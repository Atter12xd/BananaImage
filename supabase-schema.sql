-- Schema for v0-nanobanana-template (run in Supabase SQL Editor)
-- Required tables: users, usage, rate_limits

-- Users (for Sign in with Vercel)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Usage / generation history
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  credit_cost text not null,
  tokens integer not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Rate limit per IP per day (anonymous mode)
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  date text not null,
  count integer not null default 0,
  reset_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(ip, date)
);
