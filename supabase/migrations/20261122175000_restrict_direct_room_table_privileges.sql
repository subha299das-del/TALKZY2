-- Keep public API tables read-only for authenticated clients. Server uses service role.
revoke all privileges on table
  public.talkzy_rooms,
  public.talkzy_room_members,
  public.talkzy_room_admins,
  public.talkzy_room_chat_clears,
  public.talkzy_room_follows,
  public.talkzy_room_mic_controls,
  public.talkzy_room_mic_seats,
  public.talkzy_room_presence,
  public.talkzy_room_settings,
  public.talkzy_room_visitors,
  public.talkzy_room_messages
from anon, authenticated;

grant select on table
  public.talkzy_rooms,
  public.talkzy_room_members,
  public.talkzy_room_admins,
  public.talkzy_room_chat_clears,
  public.talkzy_room_follows,
  public.talkzy_room_mic_controls,
  public.talkzy_room_mic_seats,
  public.talkzy_room_presence,
  public.talkzy_room_settings,
  public.talkzy_room_visitors,
  public.talkzy_room_messages
to authenticated;
