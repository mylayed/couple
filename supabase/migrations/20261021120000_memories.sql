-- Етап 10: стрічка спогадів, коментарі до них, фото в Storage, аватари, push про капсулу часу.
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібні всі попередні міграції (до 20261020120000_games.sql).
-- Капсула часу (таблиця time_capsules і правило «закрито до дати») є з Етапу 4.
-- Річний підсумок рахується на телефоні зі спільних даних і таблиць не потребує.
-- Загальні правила ті самі: id генерує клієнт, updated_at ставить сервер, видалення м'яке.

-- ─── Спогади ─────────────────────────────────────────────────────────────────

-- Фото й підпис до дати. Файли лежать у приватному бакеті memories у теці пари:
-- <couple_id>/<memory_id>-<версія>.jpg і мініатюра поруч із суфіксом _thumb.
-- Рядок з'являється одразу, а шляхи до фото дописуються, коли завантаження завершилось.
create table public.memories (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  happened_on date not null check (happened_on > '1900-01-01' and happened_on <= current_date + 1),
  caption text check (char_length(caption) <= 1000),
  photo_path text,
  thumb_path text,
  photo_width integer check (photo_width > 0),
  photo_height integer check (photo_height > 0),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- Фото може бути лише в теці своєї пари
  check (photo_path is null or photo_path like couple_id::text || '/%'),
  check (thumb_path is null or thumb_path like couple_id::text || '/%')
);

create index memories_feed on public.memories (couple_id, happened_on desc);

create table public.memory_comments (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  memory_id uuid not null references public.memories (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index memory_comments_memory on public.memory_comments (memory_id, created_at);

-- ─── Спільні правила ─────────────────────────────────────────────────────────

create index memories_sync on public.memories (couple_id, updated_at);
create index memory_comments_sync on public.memory_comments (couple_id, updated_at);

create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();
create trigger memory_comments_set_updated_at
  before update on public.memory_comments
  for each row execute function public.set_updated_at();

-- Коментар не можна перенести до іншого спогаду
create or replace function public.keep_record_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.couple_id = old.couple_id;
  new.created_at = old.created_at;
  if tg_table_name = 'daily_answers' then
    new.user_id = old.user_id;
    new.question_date = old.question_date;
  elsif tg_table_name = 'moods' then
    new.user_id = old.user_id;
    new.mood_date = old.mood_date;
  elsif tg_table_name = 'game_answers' then
    new.user_id = old.user_id;
    new.round_id = old.round_id;
    new.choices = old.choices;
  else
    new.created_by = old.created_by;
  end if;
  if tg_table_name = 'answer_comments' then
    new.answer_id = old.answer_id;
  elsif tg_table_name = 'list_items' then
    new.list_id = old.list_id;
  elsif tg_table_name = 'game_rounds' then
    new.kind = old.kind;
    new.question_ids = old.question_ids;
  elsif tg_table_name = 'challenges' then
    new.challenge_id = old.challenge_id;
    new.title = old.title;
  elsif tg_table_name = 'memory_comments' then
    new.memory_id = old.memory_id;
  end if;
  return new;
end;
$$;

create trigger memories_keep_owner
  before update on public.memories
  for each row execute function public.keep_record_owner();
create trigger memory_comments_keep_owner
  before update on public.memory_comments
  for each row execute function public.keep_record_owner();

alter table public.memories enable row level security;
alter table public.memory_comments enable row level security;

-- Спогад спільний: редагувати підпис, дату й фото може будь-хто з двох
create policy "memories: couple read" on public.memories
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "memories: couple insert" on public.memories
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "memories: couple update" on public.memories
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- Коментар має належати спогаду тієї самої пари; змінити чи видалити можна лише свій
create policy "memory_comments: couple read" on public.memory_comments
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "memory_comments: couple insert" on public.memory_comments
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and exists (
      select 1 from public.memories m
      where m.id = memory_id and m.couple_id = memory_comments.couple_id
    )
  );
create policy "memory_comments: update own" on public.memory_comments
  for update to authenticated
  using (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()))
  with check (couple_id = (select public.my_couple_id()));

-- ─── Storage ─────────────────────────────────────────────────────────────────
-- Обидва бакети приватні: застосунок бере підписані посилання.
-- Видаляти файли SQL-запитом Supabase не дозволяє, тому при видаленні спогаду,
-- роз'єднанні пари чи видаленні акаунта файли прибирає застосунок через Storage API.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('memories', 'memories', false, 5242880, array['image/jpeg']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

-- Фото спогадів: тека з назвою пари
create policy "memories files: couple read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = (select public.my_couple_id())::text
  );
create policy "memories files: couple insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = (select public.my_couple_id())::text
  );
create policy "memories files: couple update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = (select public.my_couple_id())::text
  );
create policy "memories files: couple delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = (select public.my_couple_id())::text
  );

-- Аватари: тека з id користувача; бачать сам користувач і його пара
create policy "avatars: read own and partner" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (storage.foldername(name))[1] in (
        select user_id::text from public.couple_members
        where couple_id = (select public.my_couple_id())
      )
    )
  );
create policy "avatars: insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ─── Push ────────────────────────────────────────────────────────────────────

create function public.notify_partner_memory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.deleted_at is not null then
    return null;
  end if;
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ' додає спогад'
      || coalesce(': ' || left(nullif(new.caption, ''), 80), '') || ' 📸',
    '/memory/' || new.id
  );
  return null;
end;
$$;

create function public.notify_partner_memory_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ' коментує спогад: ' || left(new.body, 80),
    '/memory/' || new.memory_id
  );
  return null;
end;
$$;

-- Вміст капсули не розкриваємо, лише дату відкриття
create function public.notify_partner_time_capsule()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ' запечатує лист у капсулу часу. Відкриється '
      || to_char(new.opens_on, 'DD.MM.YYYY') || ' 💌',
    '/capsule'
  );
  return null;
end;
$$;

create trigger memories_notify_partner
  after insert on public.memories
  for each row execute function public.notify_partner_memory();
create trigger memory_comments_notify_partner
  after insert on public.memory_comments
  for each row execute function public.notify_partner_memory_comment();
create trigger time_capsules_notify_partner
  after insert on public.time_capsules
  for each row execute function public.notify_partner_time_capsule();

-- ─── Realtime ────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table
  public.memories,
  public.memory_comments;
