-- ============================================
-- Golf Subscription Platform — Supabase Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  charity_id uuid,
  contribution_pct integer not null default 10 check (contribution_pct >= 10 and contribution_pct <= 100),
  created_at timestamptz not null default now()
);

-- Charities
create table public.charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  images text[] default '{}',
  events text[] default '{}',
  featured boolean not null default false,
  active boolean not null default true
);

-- Add FK from users to charities
alter table public.users add constraint users_charity_id_fkey
  foreign key (charity_id) references public.charities(id) on delete set null;

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'lapsed', 'cancelled')),
  stripe_id text unique,
  stripe_customer_id text,
  renewal_date timestamptz,
  cancelled_at timestamptz,
  unique(user_id)
);

-- Golf Scores
create table public.scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 45),
  date date not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Charity Contributions
create table public.charity_contributions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  charity_id uuid not null references public.charities(id),
  amount integer not null, -- in pence
  date date not null default current_date
);

-- Draws
create table public.draws (
  id uuid primary key default uuid_generate_v4(),
  month integer not null check (month >= 1 and month <= 12),
  year integer not null,
  status text not null default 'draft' check (status in ('draft', 'simulated', 'published')),
  logic text not null default 'random' check (logic in ('random', 'algorithmic')),
  jackpot_rollover_amount integer not null default 0
);

-- Prize Pools
create table public.prize_pools (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  total_amount integer not null default 0,
  tier_40 integer not null default 0,
  tier_35 integer not null default 0,
  tier_25 integer not null default 0,
  unique(draw_id)
);

-- Draw Results
create table public.draw_results (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_type text not null check (match_type in ('5', '4', '3')),
  winner_ids uuid[] default '{}',
  prize_per_winner integer not null default 0,
  total_pool_tier integer not null default 0
);

-- Winner Verifications
create table public.winner_verifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  proof_url text,
  status text not null default 'pending_submission'
    check (status in ('pending_submission', 'submitted', 'approved', 'rejected')),
  payout_status text not null default 'pending'
    check (payout_status in ('pending', 'paid')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  unique(user_id, draw_id)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.charity_contributions enable row level security;
alter table public.draws enable row level security;
alter table public.prize_pools enable row level security;
alter table public.draw_results enable row level security;
alter table public.winner_verifications enable row level security;

-- Users: can read/update own row; admins can read all
create policy "users_own" on public.users for all using (auth.uid() = id);
create policy "users_admin_read" on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Subscriptions: own only
create policy "subscriptions_own" on public.subscriptions for all using (user_id = auth.uid());
create policy "subscriptions_admin" on public.subscriptions for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Scores: own only
create policy "scores_own" on public.scores for all using (user_id = auth.uid());
create policy "scores_admin" on public.scores for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Charities: anyone can read active; admin can manage all
create policy "charities_read" on public.charities for select using (active = true);
create policy "charities_admin" on public.charities for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Draws & pools: anyone authenticated can read published; admin manages all
create policy "draws_read" on public.draws for select using (auth.role() = 'authenticated' and status = 'published');
create policy "draws_admin" on public.draws for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "prize_pools_read" on public.prize_pools for select using (auth.role() = 'authenticated');
create policy "prize_pools_admin" on public.prize_pools for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "draw_results_read" on public.draw_results for select using (auth.role() = 'authenticated');
create policy "draw_results_admin" on public.draw_results for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Winner verifications: own only + admin
create policy "verifications_own" on public.winner_verifications for all using (user_id = auth.uid());
create policy "verifications_admin" on public.winner_verifications for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================
-- Trigger: auto-create user row on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Sample Data
-- ============================================
insert into public.charities (name, description, featured, active) values
  ('Macmillan Cancer Support', 'Macmillan provides medical, emotional, practical and financial support to people living with cancer.', true, true),
  ('Mental Health Foundation', 'Working to prevent mental health problems and drive change.', true, true),
  ('The Trussell Trust', 'Supporting a network of food banks providing emergency food.', false, true),
  ('British Heart Foundation', 'Fighting cardiovascular disease together.', false, true),
  ('RNIB', 'Supporting people with sight loss to live the lives they choose.', false, true);
