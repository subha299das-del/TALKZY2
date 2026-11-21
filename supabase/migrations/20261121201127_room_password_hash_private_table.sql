create table if not exists public.talkzy_room_passwords (
  room_id uuid primary key references public.talkzy_rooms(id) on delete cascade,
  password_hash text not null
);
alter table public.talkzy_room_passwords enable row level security;
revoke all on public.talkzy_room_passwords from public, anon, authenticated;
grant all on public.talkzy_room_passwords to service_role;
insert into public.talkzy_room_passwords(room_id,password_hash)
select id,password_hash from public.talkzy_rooms where password_hash is not null
on conflict(room_id) do update set password_hash=excluded.password_hash;
alter table public.talkzy_rooms drop column if exists password_hash;