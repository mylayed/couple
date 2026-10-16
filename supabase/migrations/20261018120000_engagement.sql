-- Етап 7: листівки, дотики, настрій дня, коментарі до відповідей на питання дня.
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібні міграції 20261016120000_couples.sql і 20261017120000_notifications.sql.
-- Загальні правила ті самі: id генерує клієнт, updated_at ставить сервер, видалення м'яке.

-- ─── Листівки ────────────────────────────────────────────────────────────────

-- Тепле повідомлення партнеру. Автор може видалити листівку, отримувач — відкрити
-- її (opened_at) і відповісти реакцією
create table public.notes (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  style text not null default 'rose' check (style in ('rose', 'violet', 'mint', 'dawn')),
  opened_at timestamptz,
  reaction text check (reaction in ('heart', 'hug', 'thinking')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ─── Дотики ──────────────────────────────────────────────────────────────────

-- «Тик» одним дотиком: серце, обійми, «думаю про тебе». Лише додаються.
create table public.touches (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  kind text not null check (kind in ('heart', 'hug', 'thinking')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index touches_recent on public.touches (couple_id, created_by, created_at desc);

-- ─── Настрій дня ─────────────────────────────────────────────────────────────

-- Приватність вирішує застосунок до відправки: приватний настрій не потрапляє на сервер,
-- а коментар до настрою відправляється, лише якщо партнер має його бачити.
-- Тож усе, що лежить у цій таблиці, партнер бачити може.
create table public.moods (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  mood_date date not null check (mood_date <= current_date + 1),
  mood text not null check (mood in ('great', 'good', 'ok', 'low', 'bad')),
  note text check (char_length(note) <= 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (couple_id, user_id, mood_date)
);

-- ─── Коментарі до відповідей ─────────────────────────────────────────────────

create table public.answer_comments (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  answer_id uuid not null references public.daily_answers (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index answer_comments_answer on public.answer_comments (answer_id, created_at);

-- Обидва учасники відповіли на питання, до якого належить відповідь.
-- Доти коментарі не можна ні писати, ні читати: інакше вони видали б зміст відповіді.
create function public.answer_is_open(p_answer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(distinct other.user_id) >= 2
  from public.daily_answers a
  join public.daily_answers other
    on other.couple_id = a.couple_id
   and other.question_date = a.question_date
   and other.deleted_at is null
  where a.id = p_answer_id and a.deleted_at is null;
$$;

revoke execute on function public.answer_is_open(uuid) from public, anon;
grant execute on function public.answer_is_open(uuid) to authenticated;

-- ─── Спільні правила ─────────────────────────────────────────────────────────

create index notes_sync on public.notes (couple_id, updated_at);
create index touches_sync on public.touches (couple_id, updated_at);
create index moods_sync on public.moods (couple_id, updated_at);
create index answer_comments_sync on public.answer_comments (couple_id, updated_at);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();
create trigger touches_set_updated_at
  before update on public.touches
  for each row execute function public.set_updated_at();
create trigger moods_set_updated_at
  before update on public.moods
  for each row execute function public.set_updated_at();
create trigger answer_comments_set_updated_at
  before update on public.answer_comments
  for each row execute function public.set_updated_at();

-- Тепер власник у полі user_id є не лише у відповідей, а й у настрою
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
  end if;
  return new;
end;
$$;

create trigger notes_keep_owner
  before update on public.notes
  for each row execute function public.keep_record_owner();
create trigger touches_keep_owner
  before update on public.touches
  for each row execute function public.keep_record_owner();
create trigger moods_keep_owner
  before update on public.moods
  for each row execute function public.keep_record_owner();
create trigger answer_comments_keep_owner
  before update on public.answer_comments
  for each row execute function public.keep_record_owner();

-- Автор листівки змінює лише її видалення, отримувач — лише відкриття й реакцію
create function public.guard_note_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.body = old.body;
  new.style = old.style;
  if old.created_by is not distinct from (select auth.uid()) then
    new.opened_at = old.opened_at;
    new.reaction = old.reaction;
  else
    new.deleted_at = old.deleted_at;
    -- Відкриту листівку не можна «закрити» знову
    new.opened_at = coalesce(old.opened_at, new.opened_at);
  end if;
  return new;
end;
$$;

create trigger notes_guard_update
  before update on public.notes
  for each row execute function public.guard_note_update();

alter table public.notes enable row level security;
alter table public.touches enable row level security;
alter table public.moods enable row level security;
alter table public.answer_comments enable row level security;

create policy "notes: couple read" on public.notes
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "notes: couple insert" on public.notes
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and opened_at is null
    and reaction is null
  );
create policy "notes: couple update" on public.notes
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

create policy "touches: couple read" on public.touches
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "touches: couple insert" on public.touches
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
-- Відправка йде через upsert, а він потребує права на update
create policy "touches: update own" on public.touches
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (couple_id = (select public.my_couple_id()));

create policy "moods: couple read" on public.moods
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "moods: insert own" on public.moods
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and user_id = (select auth.uid()));
create policy "moods: update own" on public.moods
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "answer_comments: read open" on public.answer_comments
  for select to authenticated
  using (couple_id = (select public.my_couple_id()) and public.answer_is_open(answer_id));
create policy "answer_comments: insert open" on public.answer_comments
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and public.answer_is_open(answer_id)
    and exists (
      select 1 from public.daily_answers a
      where a.id = answer_id and a.couple_id = answer_comments.couple_id
    )
  );
create policy "answer_comments: update own" on public.answer_comments
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (couple_id = (select public.my_couple_id()));

-- ─── Push ────────────────────────────────────────────────────────────────────
-- Тексти без роду й відмінків, як і в 20261017120000_notifications.sql

create function public.notify_partner_note()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ' надсилає тобі листівку 💌',
    '/notes/' || new.id
  );
  return null;
end;
$$;

create function public.notify_partner_touch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text := public.author_name(new.created_by);
begin
  -- Серія дотиків поспіль приходить одним сповіщенням
  if exists (
    select 1 from public.touches t
    where t.couple_id = new.couple_id
      and t.created_by = new.created_by
      and t.id <> new.id
      and t.created_at > new.created_at - interval '1 minute'
  ) then
    return null;
  end if;
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    case new.kind
      when 'heart' then name || ' надсилає тобі серце ❤️'
      when 'hug' then name || ' обіймає тебе 🤗'
      else name || ' думає про тебе 💭'
    end,
    '/'
  );
  return null;
end;
$$;

create function public.notify_partner_answer_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.push_to_partner(
    new.couple_id,
    new.created_by,
    public.author_name(new.created_by) || ' коментує відповідь на питання дня: ' || left(new.body, 80),
    '/question'
  );
  return null;
end;
$$;

create trigger notes_notify_partner
  after insert on public.notes
  for each row execute function public.notify_partner_note();
create trigger touches_notify_partner
  after insert on public.touches
  for each row execute function public.notify_partner_touch();
create trigger answer_comments_notify_partner
  after insert on public.answer_comments
  for each row execute function public.notify_partner_answer_comment();

-- ─── Realtime ────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table
  public.notes,
  public.touches,
  public.moods,
  public.answer_comments;
