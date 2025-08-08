-- ENUMS
create type role as enum ('admin','instructor','reviewer','student');
create type interval as enum ('month','year');
create type sub_status as enum ('trial','active','past_due','canceled');
create type lesson_type as enum ('theory','quiz','exercise','video','project','final_project');
create type progress_status as enum ('started','completed');

-- PROFILES
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle text unique,
  role role default 'student',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PLANS
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents int not null,
  currency text default 'MXN',
  interval interval not null,
  features jsonb default '{}'::jsonb,
  is_active bool default true
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references plans(id),
  status sub_status not null default 'trial',
  renews_at timestamptz,
  canceled_at timestamptz,
  grace_period_end timestamptz,
  provider text,
  ext_customer_id text,
  ext_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PAYMENTS (opcional; útil para conciliación)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade,
  amount_cents int not null,
  currency text default 'MXN',
  provider text not null,
  provider_payment_id text,
  status text,
  created_at timestamptz default now()
);

-- WEBHOOK EVENTS (idempotencia)
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  signature_valid bool default false,
  dedupe_key text unique,
  payload jsonb not null,
  processed_at timestamptz
);

-- COURSES / MODULES / LESSONS
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  level text,
  tags text[] default '{}',
  cover_image text,
  description text,
  version int default 1,
  draft_of uuid references courses(id),
  published_at timestamptz
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  summary text,
  "order" int not null,
  unique(course_id, "order")
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  type lesson_type not null,
  "order" int not null,
  content jsonb default '{}'::jsonb,
  unique(module_id, "order")
);

-- EXERCISES & ATTEMPTS
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  runtime text,
  instructions text,
  starter_code text,
  test_cases jsonb default '[]'::jsonb,
  time_limit_ms int default 5000,
  memory_limit_mb int default 128
);

create table if not exists exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  score int default 0,
  passed bool default false,
  stdout text,
  stderr text,
  duration_ms int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ix_attempt_user_ex on exercise_attempts(user_id, exercise_id);

-- PROGRESS
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  module_id uuid references modules(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  status progress_status default 'started',
  last_code text,
  updated_at timestamptz default now()
);
create index if not exists ix_progress_user_course on user_progress(user_id, course_id);

-- CHALLENGES
create table if not exists challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  code text,
  score int default 0,
  is_public bool default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CERTIFICATES
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  issued_at timestamptz default now(),
  certificate_url text,
  sha256_hash text unique
);

-- RLS
alter table profiles enable row level security;
create policy "read own or admin" on profiles
  for select using (auth.uid() = user_id or exists(select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin')));
create policy "update own" on profiles for update using (auth.uid() = user_id);

alter table user_progress enable row level security;
create policy "own progress" on user_progress for select using (auth.uid() = user_id);
create policy "upsert own" on user_progress for insert with check (auth.uid() = user_id);

alter table challenge_submissions enable row level security;
create policy "view public or own" on challenge_submissions for select using (is_public OR auth.uid() = user_id);
create policy "insert own" on challenge_submissions for insert with check (auth.uid() = user_id);

alter table subscriptions enable row level security;
create policy "read own or admin" on subscriptions
  for select using (auth.uid() = user_id or exists(select 1 from profiles p where p.user_id = auth.uid() and p.role='admin'));
