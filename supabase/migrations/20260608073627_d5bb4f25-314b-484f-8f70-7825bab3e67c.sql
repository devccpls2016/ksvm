
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_all_auth" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- roles enum + table
create type public.app_role as enum ('admin', 'surveyor');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "roles_select_own_or_admin" on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "roles_admin_manage" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- surveys table
create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- geographic
  village text not null,
  taluka text,
  district text,
  pincode text,

  -- head of family
  head_name text not null,
  head_photo_url text,
  mobile text,
  community text default 'कोहळी',
  marital_status text,
  gender text,
  age int,
  dob date,
  education text,
  occupation text,

  -- household items
  household_items text[] default '{}',

  -- house
  owns_house boolean,
  house_type text,
  living_status text,

  -- agriculture
  has_farmland boolean,
  total_farmland text,
  crops jsonb default '[]',
  irrigation_sources text[] default '{}',
  farming_tools text[] default '{}',

  -- position
  has_position boolean default false,
  position_data jsonb default '{}',

  -- family members
  members jsonb default '[]'
);
grant select, insert, update, delete on public.surveys to authenticated;
grant all on public.surveys to service_role;
alter table public.surveys enable row level security;

create policy "surveys_select_own_or_admin" on public.surveys for select to authenticated
  using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "surveys_insert_own" on public.surveys for insert to authenticated
  with check (created_by = auth.uid());
create policy "surveys_update_own_or_admin" on public.surveys for update to authenticated
  using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "surveys_delete_admin" on public.surveys for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger surveys_touch before update on public.surveys
  for each row execute function public.touch_updated_at();

-- handle_new_user: create profile + assign role (first user = admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  admin_count int;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;

  select count(*) into admin_count from public.user_roles where role = 'admin';
  if admin_count = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'surveyor');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
