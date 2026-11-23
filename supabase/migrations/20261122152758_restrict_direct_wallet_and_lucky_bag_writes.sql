REVOKE ALL PRIVILEGES ON TABLE
  public.talkzy_wallets,
  public.talkzy_coin_ledger,
  public.talkzy_lucky_bags,
  public.talkzy_lucky_bag_claims
FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE
  public.talkzy_wallets,
  public.talkzy_coin_ledger,
  public.talkzy_lucky_bags,
  public.talkzy_lucky_bag_claims
FROM authenticated;

GRANT SELECT ON TABLE
  public.talkzy_wallets,
  public.talkzy_coin_ledger,
  public.talkzy_lucky_bags,
  public.talkzy_lucky_bag_claims
TO authenticated;
