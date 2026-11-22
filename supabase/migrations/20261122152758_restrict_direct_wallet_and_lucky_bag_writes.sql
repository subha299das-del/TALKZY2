-- Keep wallet and Lucky Bag writes behind the validated atomic RPC functions.
-- The mobile client needs read access for balances, history, and visible bags only.
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
