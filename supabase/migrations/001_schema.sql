-- Run this in your Supabase SQL editor to set up all tables.

-- Discussion board
create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  content text not null,
  created_at timestamptz default now()
);

-- Characters (Meet the Resistance)
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references auth.users(id) on delete set null,
  name text not null,
  race text,
  class text,
  bio text,
  image_url text,
  created_at timestamptz default now()
);

-- Shared items
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text,
  name text not null,
  subtitle text,
  description text,
  tier int not null default 1,
  image_url text,
  created_at timestamptz default now()
);

-- Communal gold pool (single row, id always = 1)
create table if not exists gold_pool (
  id int primary key default 1,
  amount bigint not null default 0
);
insert into gold_pool (id, amount) values (1, 0) on conflict do nothing;

create table if not exists gold_transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references auth.users(id) on delete set null,
  player_name text,
  amount int not null,
  note text,
  created_at timestamptz default now()
);

-- Adventures (The Board)
create table if not exists adventures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  description text,
  tier int not null default 1,
  status text not null default 'active', -- 'active' | 'completed'
  created_at timestamptz default now()
);

-- Row Level Security (enable and set policies in Supabase dashboard)
-- Recommended: enable RLS on all tables and allow authenticated users to insert/update their own rows.

-- Storage buckets needed (create in Supabase Storage dashboard):
--   characters  (public)
--   items       (public)
