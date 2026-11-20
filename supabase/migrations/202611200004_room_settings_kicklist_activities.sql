create table if not exists public.talkzy_room_settings (
  room_id uuid primary key references public.talkzy_rooms(id) on delete cascade,
  tourists_on_mic boolean not null default true,
  tourists_send_text boolean not null default true,
  tourists_send_pic boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.talkzy_room_settings enable row level security;

create table if not exists public.talkzy_room_kicklist (
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kicked_by uuid not null references auth.users(id),
  reason text not null default '',
  created_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
alter table public.talkzy_room_kicklist enable row level security;
create index if not exists talkzy_room_kicklist_room_created_idx
  on public.talkzy_room_kicklist(room_id, created_at desc);

create table if not exists public.talkzy_room_activities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.talkzy_rooms(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  title text not null,
  description text not null default '',
  poster_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','published','completed','cancelled')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(title)) between 1 and 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
alter table public.talkzy_room_activities enable row level security;
create index if not exists talkzy_room_activities_room_status_start_idx
  on public.talkzy_room_activities(room_id, status, starts_at);

create or replace function public.talkzy_lock_published_room_activity_poster()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status in ('published','completed','cancelled')
     and new.poster_url is distinct from old.poster_url then
    raise exception 'PUBLISHED_POSTER_LOCKED';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists talkzy_room_activity_poster_lock on public.talkzy_room_activities;
create trigger talkzy_room_activity_poster_lock
before update on public.talkzy_room_activities
for each row execute function public.talkzy_lock_published_room_activity_poster();

revoke all on public.talkzy_room_settings from anon, authenticated;
revoke all on public.talkzy_room_kicklist from anon, authenticated;
revoke all on public.talkzy_room_activities from anon, authenticated;
grant all on public.talkzy_room_settings to service_role;
grant all on public.talkzy_room_kicklist to service_role;
grant all on public.talkzy_room_activities to service_role;
