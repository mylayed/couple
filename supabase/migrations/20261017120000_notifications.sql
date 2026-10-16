-- Етап 5: push-сповіщення про дії партнера.
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібна міграція 20261016120000_couples.sql.

-- pg_net надсилає HTTP-запити з бази: так push іде в Expo без окремої Edge Function
create extension if not exists pg_net with schema extensions;

-- Expo push-токени пристроїв. Один телефон — один токен; після входу іншим акаунтом
-- токен переходить до нового власника.
create table public.push_tokens (
  token text primary key check (token ~ '^Expo(nent)?PushToken\[.+\]$'),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

create index push_tokens_user on public.push_tokens (user_id);

-- Клієнт працює з токенами лише через функції нижче
alter table public.push_tokens enable row level security;
revoke all on public.push_tokens from anon, authenticated;

create function public.register_push_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  insert into public.push_tokens (token, user_id, platform)
  values (p_token, auth.uid(), p_platform)
  on conflict (token) do update
    set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end;
$$;

create function public.unregister_push_token(p_token text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.push_tokens where token = p_token and user_id = (select auth.uid());
$$;

revoke execute on function public.register_push_token(text, text) from public, anon;
revoke execute on function public.unregister_push_token(text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
grant execute on function public.unregister_push_token(text) to authenticated;

-- Надсилає push другому учаснику пари. Помилка доставки не має зривати запис даних.
create function public.push_to_partner(p_couple_id uuid, p_author uuid, p_body text, p_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  messages jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'to', t.token,
      'title', 'Dotyk',
      'body', p_body,
      'sound', 'default',
      'data', jsonb_build_object('url', p_url)
    )
  )
  into messages
  from public.push_tokens t
  join public.couple_members m on m.user_id = t.user_id
  where m.couple_id = p_couple_id and m.user_id <> p_author;

  if messages is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := messages,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
exception when others then
  raise warning 'push_to_partner: %', sqlerrm;
end;
$$;

revoke execute on function public.push_to_partner(uuid, uuid, text, text)
  from public, anon, authenticated;

create function public.author_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select name from public.profiles where id = p_user_id), 'Партнер');
$$;

revoke execute on function public.author_name(uuid) from public, anon, authenticated;

-- Тексти без роду й відмінків: застосунок не знає статі, а імена не відмінюємо
create function public.notify_partner_daily_answer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.push_to_partner(
    new.couple_id,
    new.user_id,
    public.author_name(new.user_id) || ' вже має відповідь на питання дня. Відповідай, щоб побачити її 💬',
    '/question'
  );
  return null;
end;
$$;

create function public.notify_partner_moment_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  moment_title text;
begin
  -- Старі відмітки, внесені заднім числом, не варті сповіщення
  if new.happened_on < current_date - 1 then
    return null;
  end if;
  select title into moment_title from public.moments where id = new.moment_id;
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ': «' || coalesce(moment_title, 'Момент') || '» — це було 💞',
    '/moment/' || new.moment_id
  );
  return null;
end;
$$;

create function public.notify_partner_important_date()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ' додає важливу дату: ' || new.title,
    '/dates'
  );
  return null;
end;
$$;

create trigger daily_answers_notify_partner
  after insert on public.daily_answers
  for each row execute function public.notify_partner_daily_answer();
create trigger moment_logs_notify_partner
  after insert on public.moment_logs
  for each row execute function public.notify_partner_moment_log();
create trigger important_dates_notify_partner
  after insert on public.important_dates
  for each row execute function public.notify_partner_important_date();
