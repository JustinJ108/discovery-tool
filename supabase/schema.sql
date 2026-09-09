-- ============================================================
-- Discovery Tool schema for Supabase
-- Run this whole file in Supabase → SQL Editor → New query → Run
-- ============================================================

-- Enable UUID generation (pgcrypto ships enabled by default on Supabase)
create extension if not exists "pgcrypto";

-- ORGANIZATIONS
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  industry    text,
  website     text,
  size        text,          -- e.g. '1-10', '11-50', '51-200'
  notes       text,
  created_at  timestamptz not null default now()
);

-- CONTACTS
create table contacts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  first_name      text not null,
  last_name       text,
  title           text,
  email           text,
  phone           text,
  linkedin_url    text,
  created_at      timestamptz not null default now()
);

-- DISCOVERY_NOTES
create table discovery_notes (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  contact_id      uuid references contacts(id) on delete set null,
  title           text,
  content         text not null,
  meeting_date    date,
  created_at      timestamptz not null default now()
);

-- PAIN_POINTS
create table pain_points (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  contact_id        uuid references contacts(id) on delete set null,
  discovery_note_id uuid references discovery_notes(id) on delete set null,
  description       text not null,
  category          text,      -- e.g. 'budget', 'technical', 'process'
  severity          text check (severity in ('low', 'medium', 'high', 'critical')),
  created_at        timestamptz not null default now()
);

-- Helpful indexes on FK columns
create index idx_contacts_organization_id       on contacts(organization_id);
create index idx_discovery_notes_organization_id on discovery_notes(organization_id);
create index idx_discovery_notes_contact_id      on discovery_notes(contact_id);
create index idx_pain_points_organization_id     on pain_points(organization_id);
create index idx_pain_points_contact_id          on pain_points(contact_id);
create index idx_pain_points_discovery_note_id   on pain_points(discovery_note_id);


-- ============================================================
-- updated_at support
-- ============================================================

alter table organizations    add column updated_at timestamptz not null default now();
alter table contacts         add column updated_at timestamptz not null default now();
alter table discovery_notes  add column updated_at timestamptz not null default now();
alter table pain_points      add column updated_at timestamptz not null default now();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function set_updated_at();

create trigger trg_contacts_updated_at
  before update on contacts
  for each row execute function set_updated_at();

create trigger trg_discovery_notes_updated_at
  before update on discovery_notes
  for each row execute function set_updated_at();

create trigger trg_pain_points_updated_at
  before update on pain_points
  for each row execute function set_updated_at();


-- ============================================================
-- Row Level Security
-- ============================================================

alter table organizations    add column owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade;
alter table contacts         add column owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade;
alter table discovery_notes  add column owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade;
alter table pain_points      add column owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade;

create index idx_organizations_owner_id   on organizations(owner_id);
create index idx_contacts_owner_id        on contacts(owner_id);
create index idx_discovery_notes_owner_id on discovery_notes(owner_id);
create index idx_pain_points_owner_id     on pain_points(owner_id);

alter table organizations    enable row level security;
alter table contacts         enable row level security;
alter table discovery_notes  enable row level security;
alter table pain_points      enable row level security;

create policy "Owner can select organizations"
  on organizations for select using (owner_id = auth.uid());
create policy "Owner can insert organizations"
  on organizations for insert with check (owner_id = auth.uid());
create policy "Owner can update organizations"
  on organizations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owner can delete organizations"
  on organizations for delete using (owner_id = auth.uid());

create policy "Owner can select contacts"
  on contacts for select using (owner_id = auth.uid());
create policy "Owner can insert contacts"
  on contacts for insert with check (owner_id = auth.uid());
create policy "Owner can update contacts"
  on contacts for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owner can delete contacts"
  on contacts for delete using (owner_id = auth.uid());

create policy "Owner can select discovery_notes"
  on discovery_notes for select using (owner_id = auth.uid());
create policy "Owner can insert discovery_notes"
  on discovery_notes for insert with check (owner_id = auth.uid());
create policy "Owner can update discovery_notes"
  on discovery_notes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owner can delete discovery_notes"
  on discovery_notes for delete using (owner_id = auth.uid());

create policy "Owner can select pain_points"
  on pain_points for select using (owner_id = auth.uid());
create policy "Owner can insert pain_points"
  on pain_points for insert with check (owner_id = auth.uid());
create policy "Owner can update pain_points"
  on pain_points for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owner can delete pain_points"
  on pain_points for delete using (owner_id = auth.uid());
