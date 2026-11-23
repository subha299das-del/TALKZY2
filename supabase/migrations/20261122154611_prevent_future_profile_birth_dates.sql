alter table public.talkzy_profile_private
  add constraint talkzy_profile_private_dob_not_future
  check (date_of_birth <= current_date);
