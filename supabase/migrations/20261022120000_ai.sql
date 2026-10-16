-- Етап 11: ШІ через Edge Function `ai` — ліміти запитів, кеш відповідей, перемикач «вимкнути ШІ».
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібна міграція 20261016120000_couples.sql.
-- Ключ Anthropic лежить лише в секретах Edge Functions, у застосунку його немає.

-- ─── Перемикач ───────────────────────────────────────────────────────────────

-- Кожен вирішує за себе. Партнер бачить це поле (політика «profiles: read partner»):
-- якщо ШІ вимкнув партнер, функція не надсилає його ім'я і спільні дані пари.
alter table public.profiles add column ai_enabled boolean not null default true;

-- ─── Ліміти ──────────────────────────────────────────────────────────────────

-- Кожен запит до моделі. Відповідь із кешу сюди не потрапляє і ліміт не витрачає.
create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  feature text not null check (feature in ('date_ideas', 'note', 'year_story')),
  created_at timestamptz not null default now()
);

create index ai_requests_user_time on public.ai_requests (user_id, created_at desc);

-- Пишуть і читають таблицю лише функції нижче та Edge Function (service role)
alter table public.ai_requests enable row level security;
revoke all on public.ai_requests from anon, authenticated;

-- Безкоштовно 3 запити за останні 24 години. Plus — без обмежень для людей,
-- але з великою стелею від зловживань і випадкових циклів.
create function public.ai_daily_limit(p_user uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1
      from public.couple_members m
      join public.couples c on c.id = m.couple_id
      where m.user_id = p_user and c.plus_until > now()
    ) then 100
    else 3
  end;
$$;

-- Скільки лишилось. resets_at — коли звільниться найстаріший врахований запит.
create function public.ai_quota()
returns table (used int, quota int, plus boolean, resets_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  with recent as (
    select created_at from public.ai_requests
    where user_id = (select auth.uid()) and created_at > now() - interval '24 hours'
  )
  select
    (select count(*) from recent)::int,
    public.ai_daily_limit((select auth.uid())),
    public.ai_daily_limit((select auth.uid())) > 3,
    (select min(created_at) + interval '24 hours' from recent);
$$;

revoke execute on function public.ai_daily_limit(uuid) from public, anon, authenticated;
grant execute on function public.ai_daily_limit(uuid) to service_role;
revoke execute on function public.ai_quota() from public, anon;
grant execute on function public.ai_quota() to authenticated;

-- Атомарно бере один запит із ліміту. Повертає id запису (щоб повернути запит,
-- якщо модель не відповіла) або null, коли ліміт вичерпано.
-- Блокування на користувача не дає паралельним запитам проскочити ліміт.
create function public.ai_take_quota(p_user uuid, p_feature text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('ai:' || p_user::text));
  if (
    select count(*) from public.ai_requests
    where user_id = p_user and created_at > now() - interval '24 hours'
  ) >= public.ai_daily_limit(p_user) then
    return null;
  end if;
  insert into public.ai_requests (user_id, feature) values (p_user, p_feature)
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.ai_take_quota(uuid, text) from public, anon, authenticated;
grant execute on function public.ai_take_quota(uuid, text) to service_role;

-- ─── Кеш ─────────────────────────────────────────────────────────────────────

-- Однаковий запит від пари (той самий набір даних) повертає збережену відповідь.
-- key — SHA-256 від функції та вхідних даних; самих даних тут немає.
-- Кеш прив'язаний до пари й зникає разом із нею.
create table public.ai_cache (
  couple_id uuid not null references public.couples (id) on delete cascade,
  key text not null check (key ~ '^[0-9a-f]{64}$'),
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (couple_id, key)
);

create index ai_cache_created on public.ai_cache (created_at);

alter table public.ai_cache enable row level security;
revoke all on public.ai_cache from anon, authenticated;
