-- Етап 9: перші ігри та челенджі пари.
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібні міграції 20261016120000_couples.sql, 20261017120000_notifications.sql,
-- 20261018120000_engagement.sql і 20261019120000_plans.sql.
-- Каталоги питань і челенджів живуть у застосунку; бали й рівень дерева теж рахує застосунок
-- зі спільних даних, тому обидва телефони показують однаковий результат без окремої таблиці.
-- Загальні правила ті самі: id генерує клієнт, updated_at ставить сервер, видалення м'яке.

-- ─── Ігри ────────────────────────────────────────────────────────────────────

-- Раунд гри: набір питань із каталогу застосунку.
-- guess — «Що обрав(ла) б партнер»: автор раунду обирає про себе, другий вгадує.
-- pair — «Щось одне з двох»: обоє обирають таємно, бали за збіги.
create table public.game_rounds (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  kind text not null check (kind in ('guess', 'pair')),
  question_ids text[] not null
    check (cardinality(question_ids) between 1 and 10 and array_position(question_ids, null) is null),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Вибір кожного гравця: номер варіанта на кожне питання раунду, по порядку.
-- Змінити вибір не можна, інакше можна було б підглянути відповідь партнера й перевибрати.
create table public.game_answers (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  round_id uuid not null references public.game_rounds (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  choices smallint[] not null
    check (
      cardinality(choices) between 1 and 10
      and array_position(choices, null) is null
      and 0 <= all (choices)
      and 3 >= all (choices)
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (round_id, user_id)
);

create index game_answers_round on public.game_answers (round_id);

-- ─── Челенджі ────────────────────────────────────────────────────────────────

-- Челендж із каталогу застосунку, який пара взяла. Назву зберігаємо для push і на випадок,
-- якщо челендж зникне з каталогу. Виконаним його може відмітити будь-хто з двох.
create table public.challenges (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  challenge_id text not null check (char_length(challenge_id) <= 40),
  title text not null check (char_length(title) between 1 and 120),
  done_at timestamptz,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ─── Спільні правила ─────────────────────────────────────────────────────────

create index game_rounds_sync on public.game_rounds (couple_id, updated_at);
create index game_answers_sync on public.game_answers (couple_id, updated_at);
create index challenges_sync on public.challenges (couple_id, updated_at);

create trigger game_rounds_set_updated_at
  before update on public.game_rounds
  for each row execute function public.set_updated_at();
create trigger game_answers_set_updated_at
  before update on public.game_answers
  for each row execute function public.set_updated_at();
create trigger challenges_set_updated_at
  before update on public.challenges
  for each row execute function public.set_updated_at();

-- Питання раунду, вибір гравця і челендж не змінюються після створення
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
  end if;
  return new;
end;
$$;

create trigger game_rounds_keep_owner
  before update on public.game_rounds
  for each row execute function public.keep_record_owner();
create trigger game_answers_keep_owner
  before update on public.game_answers
  for each row execute function public.keep_record_owner();
create trigger challenges_keep_owner
  before update on public.challenges
  for each row execute function public.keep_record_owner();

-- Вибір має відповідати раунду: та сама пара і по одному варіанту на кожне питання
create function public.check_game_answer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  round public.game_rounds;
begin
  select * into round from public.game_rounds where id = new.round_id;
  if round.id is null or round.couple_id <> new.couple_id then
    raise exception 'game_answers: раунд не належить парі';
  end if;
  if cardinality(new.choices) <> cardinality(round.question_ids) then
    raise exception 'game_answers: кількість відповідей не збігається з раундом';
  end if;
  return new;
end;
$$;

create trigger game_answers_check
  before insert on public.game_answers
  for each row execute function public.check_game_answer();

alter table public.game_rounds enable row level security;
alter table public.game_answers enable row level security;
alter table public.challenges enable row level security;

create policy "game_rounds: couple read" on public.game_rounds
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "game_rounds: couple insert" on public.game_rounds
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "game_rounds: couple update" on public.game_rounds
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- Як і з питанням дня, вибір партнера сервер віддає лише після власного.
-- security definer: політика game_answers не може рекурсивно читати саму таблицю.
create function public.has_played(p_round_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.game_answers
    where round_id = p_round_id
      and user_id = (select auth.uid())
      and deleted_at is null
  );
$$;

revoke execute on function public.has_played(uuid) from public, anon;
grant execute on function public.has_played(uuid) to authenticated;

create policy "game_answers: own or after playing" on public.game_answers
  for select to authenticated
  using (
    couple_id = (select public.my_couple_id())
    and (user_id = (select auth.uid()) or public.has_played(round_id))
  );
create policy "game_answers: insert own" on public.game_answers
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and user_id = (select auth.uid()));
create policy "game_answers: update own" on public.game_answers
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "challenges: couple read" on public.challenges
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "challenges: couple insert" on public.challenges
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "challenges: couple update" on public.challenges
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- ─── Push ────────────────────────────────────────────────────────────────────

create function public.notify_partner_game_round()
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
    public.author_name(new.created_by) || case new.kind
      when 'guess' then ' загадує свої відповіді. Вгадаєш? 🎲'
      else ' кличе зіграти в «Щось одне з двох» 🎲'
    end,
    '/games/' || new.id
  );
  return null;
end;
$$;

create trigger game_rounds_notify_partner
  after insert on public.game_rounds
  for each row execute function public.notify_partner_game_round();

-- Перша відповідь іде разом зі створенням раунду, тож пишемо лише тоді, коли зіграли обоє
create function public.notify_partner_game_answer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.game_answers
    where round_id = new.round_id and deleted_at is null
  ) < 2 then
    return null;
  end if;
  perform public.push_to_partner(
    new.couple_id,
    new.user_id,
    public.author_name(new.user_id) || ' теж відповідає. Дивись результат ✨',
    '/games/' || new.round_id
  );
  return null;
end;
$$;

create trigger game_answers_notify_partner
  after insert on public.game_answers
  for each row execute function public.notify_partner_game_answer();

create function public.notify_partner_challenge()
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
      public.author_name(actor) || ' пропонує челендж: ' || new.title || ' 💪',
      '/challenges'
    );
  elsif old.done_at is null and new.done_at is not null then
    perform public.push_to_partner(
      new.couple_id,
      actor,
      'Челендж виконано: ' || new.title || ' 🏆',
      '/challenges'
    );
  end if;
  return null;
end;
$$;

create trigger challenges_notify_partner
  after insert or update of done_at on public.challenges
  for each row execute function public.notify_partner_challenge();

-- ─── Realtime ────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table
  public.game_rounds,
  public.game_answers,
  public.challenges;
