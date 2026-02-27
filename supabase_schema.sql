-- Users table extends auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  squat_1rm numeric,
  bench_press_1rm numeric,
  deadlift_1rm numeric,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Generated Menus table
create table public.generated_menus (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  menu_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for generated_menus
alter table public.generated_menus enable row level security;

create policy "Users can view own menus" on public.generated_menus
  for select using (auth.uid() = user_id);

create policy "Users can insert own menus" on public.generated_menus
  for insert with check (auth.uid() = user_id);

-- Trigger to create a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
