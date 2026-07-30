-- Personal AI Analysis System — single-user schema.

create extension if not exists pgcrypto;

create table if not exists profile (
  id text primary key default 'me',
  narrative text not null default '',
  traits jsonb not null default '{}'::jsonb,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  goals text[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into profile (id) values ('me') on conflict (id) do nothing;

create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default (now() at time zone 'utc')::date,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists daily_entries_date_idx on daily_entries (entry_date);

create table if not exists daily_summaries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  summary text not null,
  mood text,
  key_actions jsonb not null default '[]'::jsonb,
  learned text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  horizon text not null,
  narrative text not null,
  confidence text not null default 'medium',
  focus_areas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
