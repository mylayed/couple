-- Етап 8: бакет-ліст і спільні списки (фільми, ресторани, подарунки, покупки).
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібні міграції 20261016120000_couples.sql, 20261017120000_notifications.sql
-- і 20261018120000_engagement.sql.
-- Ідеї побачень і рулетка рішень працюють на телефоні й таблиць не потребують.
-- Загальні правила ті самі: id генерує клієнт, updated_at ставить сервер, видалення м'яке.

-- ─── Бакет-ліст ──────────────────────────────────────────────────────────────

-- Спільні мрії пари. Відмітку «зроблено» може поставити або зняти будь-хто з двох.
create table public.bucket_items (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  note text check (char_length(note) <= 500),
  done_at timestamptz,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ─── Спільні списки ──────────────────────────────────────────────────────────

create table public.lists (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  kind text not null default 'other'
    check (kind in ('movies', 'restaurants', 'gifts', 'shopping', 'other')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.list_items (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  list_id uuid not null references public.lists (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  done_at timestamptz,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index list_items_list on public.list_items (list_id, created_at);

-- ─── Спільні правила ─────────────────────────────────────────────────────────

create index bucket_items_sync on public.bucket_items (couple_id, updated_at);
create index lists_sync on public.lists (couple_id, updated_at);
create index list_items_sync on public.list_items (couple_id, updated_at);

create trigger bucket_items_set_updated_at
  before update on public.bucket_items
  for each row execute function public.set_updated_at();
create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();
create trigger list_items_set_updated_at
  before update on public.list_items
  for each row execute function public.set_updated_at();

-- Пункт не можна перенести в інший список
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
  else
    new.created_by = old.created_by;
  end if;
  if tg_table_name = 'answer_comments' then
    new.answer_id = old.answer_id;
  elsif tg_table_name = 'list_items' then
    new.list_id = old.list_id;
  end if;
  return new;
end;
$$;

create trigger bucket_items_keep_owner
  before update on public.bucket_items
  for each row execute function public.keep_record_owner();
create trigger lists_keep_owner
  before update on public.lists
  for each row execute function public.keep_record_owner();
create trigger list_items_keep_owner
  before update on public.list_items
  for each row execute function public.keep_record_owner();

alter table public.bucket_items enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;

create policy "bucket_items: couple read" on public.bucket_items
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "bucket_items: couple insert" on public.bucket_items
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "bucket_items: couple update" on public.bucket_items
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

create policy "lists: couple read" on public.lists
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "lists: couple insert" on public.lists
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "lists: couple update" on public.lists
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- Пункт має належати списку тієї самої пари
create policy "list_items: couple read" on public.list_items
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "list_items: couple insert" on public.list_items
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and exists (
      select 1 from public.lists l
      where l.id = list_id and l.couple_id = list_items.couple_id
    )
  );
create policy "list_items: couple update" on public.list_items
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- ─── Push ────────────────────────────────────────────────────────────────────
-- Лише про бакет-ліст: нова мрія і здійснена мрія. Пункти списків (покупки тощо)
-- додаються пачками, і сповіщення про кожен були б спамом.

create function public.notify_partner_bucket_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := coalesce((select auth.uid()), new.created_by);
begin
  if new.deleted_at is not null then
    return null;
  end if;
  if tg_op = 'INSERT' then
    perform public.push_to_partner(
      new.couple_id,
      actor,
      public.author_name(actor) || ' додає мрію в бакет-ліст: ' || new.title || ' ✨',
      '/bucket/' || new.id
    );
  elsif old.done_at is null and new.done_at is not null then
    perform public.push_to_partner(
      new.couple_id,
      actor,
      'Мрію здійснено: ' || new.title || ' 🎉',
      '/bucket/' || new.id
    );
  end if;
  return null;
end;
$$;

create trigger bucket_items_notify_partner
  after insert or update of done_at on public.bucket_items
  for each row execute function public.notify_partner_bucket_item();

-- ─── Realtime ────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table
  public.bucket_items,
  public.lists,
  public.list_items;
