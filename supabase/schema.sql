-- ============================================================
-- RELAY — Schéma complet V1
-- À coller dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enum statuts demandes ────────────────────────────────────
create type request_status as enum ('active', 'taken', 'done', 'expired');

-- ============================================================
-- TABLE : profiles
-- ============================================================
create table public.profiles (
  id                uuid        primary key references auth.users(id) on delete cascade,
  name              text        not null,
  email             text        not null,
  filiere           text        not null default '',
  skills            text[]      not null default '{}',
  available         boolean     not null default false,
  campus_radius     text        not null default 'campus',
  push_subscription jsonb,
  created_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"  on public.profiles for select  using (true);
create policy "profiles_insert_own"  on public.profiles for insert  with check (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update  using (auth.uid() = id);

-- ============================================================
-- TABLE : requests
-- ============================================================
create table public.requests (
  id              uuid           primary key default uuid_generate_v4(),
  author_id       uuid           not null references public.profiles(id) on delete cascade,
  title           text           not null,
  description     text,
  category        text           not null,
  target_filieres text[]         not null default '{}',
  location        text           not null,
  urgent          boolean        not null default false,
  duration_min    integer,
  expires_at      timestamptz,
  status          request_status not null default 'active',
  created_at      timestamptz    not null default now()
);

alter table public.requests enable row level security;

create policy "requests_select_all"   on public.requests for select  using (true);
create policy "requests_insert_auth"  on public.requests for insert  with check (auth.uid() = author_id);
create policy "requests_update_own"   on public.requests for update  using (auth.uid() = author_id);

create index requests_status_idx  on public.requests(status);
create index requests_expires_idx on public.requests(expires_at);
create index requests_created_idx on public.requests(created_at desc);

-- ============================================================
-- TABLE : help_offers
-- ============================================================
create table public.help_offers (
  id          uuid        primary key default uuid_generate_v4(),
  request_id  uuid        not null references public.requests(id) on delete cascade,
  helper_id   uuid        not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (request_id, helper_id)
);

alter table public.help_offers enable row level security;

create policy "help_offers_select_all"   on public.help_offers for select  using (true);
create policy "help_offers_insert_auth"  on public.help_offers for insert  with check (auth.uid() = helper_id);

create index help_offers_request_idx on public.help_offers(request_id);
create index help_offers_helper_idx  on public.help_offers(helper_id);

-- ============================================================
-- FONCTION : accepter une aide (premier arrivé premier servi)
-- Retourne 'ok' | 'already_taken' | 'expired'
-- ============================================================
create or replace function public.accept_help(
  p_request_id uuid,
  p_helper_id  uuid
)
returns text
language plpgsql
security definer
as $$
declare
  v_status   request_status;
  v_existing uuid;
begin
  select status into v_status
  from public.requests
  where id = p_request_id
  for update;

  if v_status = 'expired' then return 'expired'; end if;
  if v_status in ('taken', 'done') then return 'already_taken'; end if;

  select id into v_existing
  from public.help_offers
  where request_id = p_request_id
  limit 1;

  if v_existing is not null then return 'already_taken'; end if;

  insert into public.help_offers (request_id, helper_id)
  values (p_request_id, p_helper_id);

  update public.requests set status = 'taken' where id = p_request_id;

  return 'ok';
end;
$$;

-- ============================================================
-- FONCTION : expiration automatique
-- ============================================================
create or replace function public.expire_requests()
returns void
language plpgsql
security definer
as $$
begin
  update public.requests
  set status = 'expired'
  where status = 'active'
    and expires_at is not null
    and expires_at < now();
end;
$$;

-- ============================================================
-- FONCTION : créer profil à l'inscription
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name, email, filiere)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'filiere', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.help_offers;

-- ============================================================
-- pg_cron : expiration auto (décommenter après activation extension)
-- ============================================================
-- select cron.schedule('expire-requests','* * * * *','select public.expire_requests();');

-- ============================================================
-- TABLE : conversations  (à exécuter dans Supabase SQL Editor)
-- ============================================================
create table public.conversations (
  id            uuid        primary key default uuid_generate_v4(),
  request_id    uuid        not null references public.requests(id) on delete cascade,
  requester_id  uuid        not null references public.profiles(id) on delete cascade,
  helper_id     uuid        not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (request_id, helper_id)
);

alter table public.conversations enable row level security;

create policy "conversations_select" on public.conversations
  for select using (auth.uid() = requester_id or auth.uid() = helper_id);
create policy "conversations_insert" on public.conversations
  for insert with check (auth.uid() = helper_id or auth.uid() = requester_id);

create index conversations_requester_idx on public.conversations(requester_id);
create index conversations_helper_idx    on public.conversations(helper_id);

-- ============================================================
-- TABLE : messages
-- ============================================================
create table public.messages (
  id              uuid        primary key default uuid_generate_v4(),
  conversation_id uuid        not null references public.conversations(id) on delete cascade,
  sender_id       uuid        not null references public.profiles(id) on delete cascade,
  content         text        not null,
  read            boolean     not null default false,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.requester_id = auth.uid() or c.helper_id = auth.uid())
    )
  );
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.requester_id = auth.uid() or c.helper_id = auth.uid())
    )
  );
create policy "messages_update" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.requester_id = auth.uid() or c.helper_id = auth.uid())
    )
  );

create index messages_conv_idx on public.messages(conversation_id, created_at);

alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
