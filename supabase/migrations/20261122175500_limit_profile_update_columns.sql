-- Prevent users from editing their stable TALKZY ID or profile creation timestamp.
revoke insert, update on table public.talkzy_profiles from authenticated;
grant update (display_name, gender, avatar_url, country, language, bio)
  on table public.talkzy_profiles to authenticated;
