alter table public.talkzy_rooms
add constraint talkzy_rooms_owner_id_key unique (owner_id);
