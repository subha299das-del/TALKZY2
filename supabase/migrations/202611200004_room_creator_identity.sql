alter table public.talkzy_rooms
  add column if not exists room_talkzy_id text,
  add column if not exists country_name text;

update public.talkzy_rooms r
set room_talkzy_id = p.talkzy_id,
    country_name = p.country
from public.talkzy_profiles p
where p.id = r.owner_id
  and (r.room_talkzy_id is distinct from p.talkzy_id
       or r.country_name is distinct from p.country);

create unique index if not exists talkzy_rooms_room_talkzy_id_uidx
  on public.talkzy_rooms (room_talkzy_id)
  where room_talkzy_id is not null;

create or replace function public.sync_room_creator_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  creator_talkzy_id text;
  creator_country text;
begin
  if tg_table_name = 'talkzy_profiles' then
    update public.talkzy_rooms
       set room_talkzy_id = new.talkzy_id,
           country_name = new.country
     where owner_id = new.id;
    return new;
  end if;

  select p.talkzy_id, p.country
    into creator_talkzy_id, creator_country
    from public.talkzy_profiles p
   where p.id = new.owner_id;

  if not found or creator_talkzy_id is null then
    raise exception 'Room creator TALKZY profile is missing.';
  end if;

  new.room_talkzy_id := creator_talkzy_id;
  new.country_name := creator_country;
  return new;
end;
$$;

drop trigger if exists talkzy_rooms_set_creator_identity on public.talkzy_rooms;
create trigger talkzy_rooms_set_creator_identity
before insert or update of owner_id on public.talkzy_rooms
for each row execute function public.sync_room_creator_identity();

drop trigger if exists talkzy_profiles_sync_owned_room_identity on public.talkzy_profiles;
create trigger talkzy_profiles_sync_owned_room_identity
after update of talkzy_id, country on public.talkzy_profiles
for each row execute function public.sync_room_creator_identity();

revoke all on function public.sync_room_creator_identity() from public, anon, authenticated;
