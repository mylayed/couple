-- Етап 4: пара, спільні дані, RLS і серверні правила.
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібна попередня міграція 20261015120000_profiles.sql.

-- ─── Пара ────────────────────────────────────────────────────────────────────

-- Пара створюється, коли користувач уперше відкриває екран запрошення.
-- Поки учасник один, у пари є invite_code; після приєднання другого код стирається.
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique check (invite_code ~ '^[A-HJKMNP-Z2-9]{6}$'),
  started_on date check (started_on > '1900-01-01' and started_on <= current_date + 1),
  -- Статус Plus змінює лише сервер (вебхук RevenueCat на Етапі 12)
  plus_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- unique (user_id): кожен користувач може бути лише в одній парі
create table public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

create trigger couples_set_updated_at
  before update on public.couples
  for each row execute function public.set_updated_at();

-- Пара поточного користувача. security definer, щоб політики RLS не перевіряли
-- couple_members рекурсивно.
create function public.my_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select couple_id from public.couple_members where user_id = (select auth.uid());
$$;

revoke execute on function public.my_couple_id() from public, anon;
grant execute on function public.my_couple_id() to authenticated;

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;

create policy "couples: read own" on public.couples
  for select to authenticated using (id = (select public.my_couple_id()));

-- Клієнт може змінити лише дату початку стосунків (див. grant нижче)
create policy "couples: update own" on public.couples
  for update to authenticated
  using (id = (select public.my_couple_id()))
  with check (id = (select public.my_couple_id()));

revoke insert, update, delete on public.couples from anon, authenticated;
grant update (started_on) on public.couples to authenticated;

create policy "couple_members: read own couple" on public.couple_members
  for select to authenticated using (couple_id = (select public.my_couple_id()));

revoke insert, update, delete on public.couple_members from anon, authenticated;

-- Партнер бачить профіль другого учасника пари
create policy "profiles: read partner" on public.profiles
  for select to authenticated
  using (
    id in (
      select user_id from public.couple_members where couple_id = (select public.my_couple_id())
    )
  );

-- ─── Код запрошення ──────────────────────────────────────────────────────────

-- Без схожих символів (0/O, 1/I/L), як у застосунку
create function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  -- gen_random_uuid() бере байти з криптографічного генератора
  bytes bytea := uuid_send(gen_random_uuid());
  code text := '';
begin
  for i in 0..5 loop
    code := code || substr(alphabet, get_byte(bytes, i) % length(alphabet) + 1, 1);
  end loop;
  return code;
end;
$$;

revoke execute on function public.generate_invite_code() from public, anon, authenticated;

-- Код запрошення поточного користувача: створює пару з одним учасником, якщо її ще немає.
-- Повертає null, якщо пару вже з'єднано.
create function public.get_invite_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  existing uuid;
  code text;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  select couple_id into existing from public.couple_members where user_id = uid;
  if existing is not null then
    select invite_code into code from public.couples where id = existing;
    return code;
  end if;

  loop
    begin
      code := public.generate_invite_code();
      insert into public.couples (invite_code) values (code) returning id into existing;
      exit;
    exception when unique_violation then
      -- Код уже зайнятий, пробуємо інший
    end;
  end loop;

  insert into public.couple_members (couple_id, user_id) values (existing, uid);
  return code;
end;
$$;

revoke execute on function public.get_invite_code() from public, anon;
grant execute on function public.get_invite_code() to authenticated;

-- Невдалі спроби вгадати код, щоб обмежити перебір
create table public.invite_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);

create index invite_attempts_user_time on public.invite_attempts (user_id, attempted_at);

-- RLS без політик: таблиця доступна лише функціям security definer
alter table public.invite_attempts enable row level security;

-- Приєднання до пари за кодом. Помилки повертаються кодами, застосунок перекладає їх.
create function public.join_couple(code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  target uuid;
  mine uuid;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  if (
    select count(*) from public.invite_attempts
    where user_id = uid and attempted_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'too_many_attempts';
  end if;

  select id into target from public.couples
  where invite_code = upper(trim(code))
  for update;

  if target is null then
    -- Записуємо спробу окремо від винятку, інакше відкат її скасує
    insert into public.invite_attempts (user_id) values (uid);
    return null;
  end if;

  select couple_id into mine from public.couple_members where user_id = uid;

  if mine = target then
    raise exception 'own_code';
  end if;

  if mine is not null then
    if (select count(*) from public.couple_members where couple_id = mine) > 1 then
      raise exception 'already_paired';
    end if;
    -- Пара з одним учасником ще не має спільних даних, її можна прибрати
    delete from public.couples where id = mine;
  end if;

  insert into public.couple_members (couple_id, user_id) values (target, uid);
  update public.couples set invite_code = null where id = target;
  delete from public.invite_attempts where user_id = uid;
  return target;
end;
$$;

revoke execute on function public.join_couple(text) from public, anon;
grant execute on function public.join_couple(text) to authenticated;

-- Роз'єднання пари: пара і всі спільні дані видаляються для обох
create function public.leave_couple()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  delete from public.couples where id = public.my_couple_id();
end;
$$;

revoke execute on function public.leave_couple() from public, anon;
grant execute on function public.leave_couple() to authenticated;

-- Видалення акаунта тепер прибирає і пару: партнер не має лишитися з чужими даними
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from public.couples where id = public.my_couple_id();
  delete from auth.users where id = auth.uid();
end;
$$;

-- ─── Спільні дані ────────────────────────────────────────────────────────────
-- Загальні правила для синхронізації:
-- • id генерує клієнт (UUID), тож повторна відправка не створює дублікатів
-- • updated_at ставить сервер, клієнт довантажує зміни після свого курсора
-- • видалення м'яке (deleted_at), щоб воно теж дійшло до партнера

-- Важливі дати: річниці, дні народження, перший поцілунок
create table public.important_dates (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  date date not null,
  kind text not null default 'other'
    check (kind in ('anniversary', 'birthday', 'first', 'trip', 'other')),
  repeats_yearly boolean not null default true,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- «Коли ми востаннє…»: дії, які пара відстежує
create table public.moments (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  icon text check (char_length(icon) <= 40),
  remind_after_days integer check (remind_after_days between 1 and 365),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Відмітки «це було»: лише додаються; помилкову відмітку можна м'яко видалити
create table public.moment_logs (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  moment_id uuid not null references public.moments (id) on delete cascade,
  happened_on date not null check (happened_on <= current_date + 1),
  note text check (char_length(note) <= 280),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index moment_logs_moment on public.moment_logs (moment_id, happened_on desc);

-- Відповіді на питання дня: одна на людину на день
create table public.daily_answers (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  question_date date not null,
  question_id text not null check (char_length(question_id) <= 40),
  answer text not null check (char_length(answer) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (couple_id, user_id, question_date)
);

-- Індекси для довантаження змін після курсора
create index important_dates_sync on public.important_dates (couple_id, updated_at);
create index moments_sync on public.moments (couple_id, updated_at);
create index moment_logs_sync on public.moment_logs (couple_id, updated_at);
create index daily_answers_sync on public.daily_answers (couple_id, updated_at);

create trigger important_dates_set_updated_at
  before update on public.important_dates
  for each row execute function public.set_updated_at();
create trigger moments_set_updated_at
  before update on public.moments
  for each row execute function public.set_updated_at();
create trigger moment_logs_set_updated_at
  before update on public.moment_logs
  for each row execute function public.set_updated_at();
create trigger daily_answers_set_updated_at
  before update on public.daily_answers
  for each row execute function public.set_updated_at();

-- Автор і пара запису не змінюються після створення
create function public.keep_record_owner()
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
  else
    new.created_by = old.created_by;
  end if;
  return new;
end;
$$;

create trigger important_dates_keep_owner
  before update on public.important_dates
  for each row execute function public.keep_record_owner();
create trigger moments_keep_owner
  before update on public.moments
  for each row execute function public.keep_record_owner();
create trigger moment_logs_keep_owner
  before update on public.moment_logs
  for each row execute function public.keep_record_owner();
create trigger daily_answers_keep_owner
  before update on public.daily_answers
  for each row execute function public.keep_record_owner();

alter table public.important_dates enable row level security;
alter table public.moments enable row level security;
alter table public.moment_logs enable row level security;
alter table public.daily_answers enable row level security;

-- Видалення лише м'яке, тому політик delete немає
create policy "important_dates: couple read" on public.important_dates
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "important_dates: couple insert" on public.important_dates
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "important_dates: couple update" on public.important_dates
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

create policy "moments: couple read" on public.moments
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "moments: couple insert" on public.moments
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and created_by = (select auth.uid()));
create policy "moments: couple update" on public.moments
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- Відмітка має належати дії тієї самої пари
create policy "moment_logs: couple read" on public.moment_logs
  for select to authenticated using (couple_id = (select public.my_couple_id()));
create policy "moment_logs: couple insert" on public.moment_logs
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and exists (
      select 1 from public.moments m
      where m.id = moment_id and m.couple_id = moment_logs.couple_id
    )
  );
create policy "moment_logs: couple update" on public.moment_logs
  for update to authenticated
  using (couple_id = (select public.my_couple_id()))
  with check (couple_id = (select public.my_couple_id()));

-- Чи відповів поточний користувач на питання цього дня.
-- security definer: політика daily_answers не може рекурсивно читати саму таблицю.
create function public.has_answered(p_couple_id uuid, p_question_date date)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.daily_answers
    where couple_id = p_couple_id
      and user_id = (select auth.uid())
      and question_date = p_question_date
      and deleted_at is null
  );
$$;

revoke execute on function public.has_answered(uuid, date) from public, anon;
grant execute on function public.has_answered(uuid, date) to authenticated;

-- Відповідь партнера сервер віддає лише після власної відповіді
create policy "daily_answers: own or after answering" on public.daily_answers
  for select to authenticated
  using (
    couple_id = (select public.my_couple_id())
    and (user_id = (select auth.uid()) or public.has_answered(couple_id, question_date))
  );
create policy "daily_answers: insert own" on public.daily_answers
  for insert to authenticated
  with check (couple_id = (select public.my_couple_id()) and user_id = (select auth.uid()));
create policy "daily_answers: update own" on public.daily_answers
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ─── Капсула часу ────────────────────────────────────────────────────────────
-- Інтерфейс з'явиться на Етапі 10; правило «закрито до дати» закладаємо вже зараз.

create table public.time_capsules (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  opens_on date not null,
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.time_capsules enable row level security;

-- Вміст видно лише з дати відкриття. Змінити чи видалити запечатану капсулу не можна.
create policy "time_capsules: read opened" on public.time_capsules
  for select to authenticated
  using (couple_id = (select public.my_couple_id()) and opens_on <= current_date);
create policy "time_capsules: seal" on public.time_capsules
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and opens_on > current_date
  );

revoke update, delete on public.time_capsules from anon, authenticated;

-- Список капсул пари без вмісту закритих: щоб показати «відкриється 12.05.2027»
create function public.list_time_capsules()
returns table (
  id uuid,
  created_by uuid,
  opens_on date,
  created_at timestamptz,
  message text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.created_by,
    c.opens_on,
    c.created_at,
    case when c.opens_on <= current_date then c.message end
  from public.time_capsules c
  where c.couple_id = (select public.my_couple_id())
  order by c.opens_on;
$$;

revoke execute on function public.list_time_capsules() from public, anon;
grant execute on function public.list_time_capsules() to authenticated;

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Події доходять лише тим, кому RLS дозволяє бачити рядок

alter publication supabase_realtime add table
  public.couples,
  public.couple_members,
  public.profiles,
  public.important_dates,
  public.moments,
  public.moment_logs,
  public.daily_answers;
