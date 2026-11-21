alter table public.talkzy_room_music_state
  add column if not exists repeat_mode text not null default 'off',
  add column if not exists shuffle boolean not null default false,
  add column if not exists volume double precision not null default 0.8;
alter table public.talkzy_room_music_state
  drop constraint if exists talkzy_room_music_repeat_mode_check;
alter table public.talkzy_room_music_state
  add constraint talkzy_room_music_repeat_mode_check check (repeat_mode in ('off','one','all'));
alter table public.talkzy_room_music_state
  drop constraint if exists talkzy_room_music_volume_check;
alter table public.talkzy_room_music_state
  add constraint talkzy_room_music_volume_check check (volume >= 0 and volume <= 1);
