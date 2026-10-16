-- Етап 12: підписка Plus через RevenueCat. Платить один — Plus отримують обидва.
-- Запустити в Supabase: SQL Editor → New query → вставити цей файл → Run.
-- Потрібні всі попередні міграції (до 20261022120000_ai.sql).
--
-- Звідки береться статус: RevenueCat шле вебхук у Edge Function `revenuecat`, вона питає
-- в RevenueCat актуальний стан покупця й записує його в plus_entitlements. Тригери нижче
-- перераховують couples.plus_until для пари. Клієнт статус лише читає.

-- ─── Оплати ──────────────────────────────────────────────────────────────────

-- Право на Plus конкретної людини (app user id у RevenueCat = id профілю).
-- Рядок не видаляється після завершення підписки: expires_at лишається в минулому,
-- а first_purchased_at потрібен для воронки.
create table public.plus_entitlements (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  -- Назавжди — 9999-12-31; у минулому — підписка завершилась
  expires_at timestamptz not null,
  product_id text check (char_length(product_id) <= 200),
  store text check (char_length(store) <= 40),
  -- TRIAL, INTRO, NORMAL, PROMOTIONAL, PREPAID
  period_type text check (char_length(period_type) <= 20),
  will_renew boolean not null default false,
  first_purchased_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plus_entitlements_set_updated_at
  before update on public.plus_entitlements
  for each row execute function public.set_updated_at();

alter table public.plus_entitlements enable row level security;
revoke insert, update, delete on public.plus_entitlements from anon, authenticated;

-- Свою оплату і оплату партнера видно обом: у налаштуваннях пишемо, хто платить
create policy "plus_entitlements: read own couple" on public.plus_entitlements
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or user_id in (
      select user_id from public.couple_members where couple_id = (select public.my_couple_id())
    )
  );

-- ─── Plus пари ───────────────────────────────────────────────────────────────

-- Найпізніша дата серед оплат учасників пари. Коли Plus щойно з'явився,
-- партнер того, хто оплатив, отримує push.
create function public.refresh_couple_plus(p_couple_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old timestamptz;
  v_new timestamptz;
  v_payer uuid;
begin
  select plus_until into v_old from public.couples where id = p_couple_id for update;
  if not found then
    return;
  end if;

  select e.expires_at, e.user_id into v_new, v_payer
  from public.plus_entitlements e
  join public.couple_members m on m.user_id = e.user_id
  where m.couple_id = p_couple_id
  order by e.expires_at desc
  limit 1;

  if v_new is not distinct from v_old then
    return;
  end if;
  update public.couples set plus_until = v_new where id = p_couple_id;

  if v_new > now() and (v_old is null or v_old <= now())
    and (select count(*) from public.couple_members where couple_id = p_couple_id) = 2 then
    perform public.push_to_partner(
      p_couple_id,
      v_payer,
      public.author_name(v_payer) || ' оформлює Plus — тепер він у вас обох ✨',
      '/plus'
    );
  end if;
end;
$$;

revoke execute on function public.refresh_couple_plus(uuid) from public, anon, authenticated;

create function public.on_plus_entitlement_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_couple_plus(m.couple_id)
  from public.couple_members m
  where m.user_id = case when tg_op = 'DELETE' then old.user_id else new.user_id end;
  return null;
end;
$$;

create trigger plus_entitlements_refresh_couple
  after insert or update or delete on public.plus_entitlements
  for each row execute function public.on_plus_entitlement_change();

-- Хто платив до знайомства в застосунку, приносить Plus у нову пару
create function public.on_couple_member_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_couple_plus(
    case when tg_op = 'DELETE' then old.couple_id else new.couple_id end
  );
  return null;
end;
$$;

create trigger couple_members_refresh_plus
  after insert or delete on public.couple_members
  for each row execute function public.on_couple_member_change();

-- Чи є в пари Plus зараз. Для правил нижче
create function public.couple_has_plus(p_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.couples where id = p_couple_id and plus_until > now()
  );
$$;

revoke execute on function public.couple_has_plus(uuid) from public, anon;
grant execute on function public.couple_has_plus(uuid) to authenticated;

-- ─── Що дає Plus ─────────────────────────────────────────────────────────────
-- Правило для всього: після завершення підписки нічого не зникає і не ховається.
-- Обмеження стосуються лише нового: нової капсули й нових фото понад безкоштовні.

-- Капсула часу: запечатати нову можна з Plus. Уже запечатані відкриються у свій день
-- і лишаються доступними завжди.
drop policy "time_capsules: seal" on public.time_capsules;
create policy "time_capsules: seal" on public.time_capsules
  for insert to authenticated
  with check (
    couple_id = (select public.my_couple_id())
    and created_by = (select auth.uid())
    and opens_on > current_date
    and public.couple_has_plus(couple_id)
  );

-- Фото спогадів: безкоштовно 100 (FREE_PHOTOS у src/services/plus.ts), з Plus без меж.
-- Застосунок пропонує Plus ще до вибору фото, тож сервер — лише захист від обходу.
-- Запас у 10 файлів: заміна фото спочатку завантажує нове, а старе видаляє потім.
create function public.can_upload_memory_photo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.couple_has_plus(public.my_couple_id())
    or (
      select count(*) from storage.objects
      where bucket_id = 'memories'
        and name like public.my_couple_id()::text || '/%'
        and name not like '%\_thumb.jpg'
    ) < 100 + 10;
$$;

revoke execute on function public.can_upload_memory_photo() from public, anon;
grant execute on function public.can_upload_memory_photo() to authenticated;

drop policy "memories files: couple insert" on storage.objects;
create policy "memories files: couple insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = (select public.my_couple_id())::text
    and (select public.can_upload_memory_photo())
  );

-- ШІ: ai_daily_limit (міграція 20261022120000_ai.sql) уже читає couples.plus_until.

-- ─── Метрики ─────────────────────────────────────────────────────────────────
-- Воронка: дійшли до пари → відкрили paywall → оформили підписку.
-- «Дійшли до пари» і «оформили» видно з couple_members і plus_entitlements;
-- відкриття paywall пише застосунок.

create table public.paywall_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Звідки відкрили: ai, capsule, photos, settings, push
  source text not null check (source ~ '^[a-z_]{1,20}$'),
  created_at timestamptz not null default now()
);

create index paywall_events_time on public.paywall_events (created_at);

alter table public.paywall_events enable row level security;
revoke update, delete on public.paywall_events from anon, authenticated;

create policy "paywall_events: insert own" on public.paywall_events
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Воронка за період (від p_from). Лише для SQL Editor і сервера:
-- select * from public.plus_funnel('2026-11-01');
create function public.plus_funnel(p_from timestamptz default now() - interval '30 days')
returns table (step text, users bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with paired as (
    -- Другий учасник приєднався в цей період: обидва дійшли до пари
    select m.user_id
    from public.couple_members m
    where m.couple_id in (
      select couple_id from public.couple_members
      group by couple_id
      having count(*) = 2 and max(joined_at) >= p_from
    )
  ),
  opened as (
    select distinct e.user_id from public.paywall_events e
    join paired p on p.user_id = e.user_id
    where e.created_at >= p_from
  ),
  bought as (
    select e.user_id from public.plus_entitlements e
    join opened o on o.user_id = e.user_id
    where e.first_purchased_at >= p_from
  )
  select '1. дійшли до пари', count(*) from paired
  union all
  select '2. відкрили paywall', count(*) from opened
  union all
  select '3. оформили Plus', count(*) from bought;
$$;

revoke execute on function public.plus_funnel(timestamptz) from public, anon, authenticated;

-- Realtime: couples уже в публікації, зміна plus_until одразу доходить до обох телефонів
