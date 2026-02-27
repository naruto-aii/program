-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  squat_1rm numeric,
  bench_press_1rm numeric,
  deadlift_1rm numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workouts table
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- can be null for guest saves if we wanted, but typically we force login to save
  program_data jsonb not null, -- Stores the entire generated JSON structure
  goal text,
  duration text,
  period text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can view their own workouts."
  on workouts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own workouts."
  on workouts for insert
  with check ( auth.uid() = user_id );
