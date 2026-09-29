CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS reservation_dates_ordered;
ALTER TABLE "reservation"
  ADD CONSTRAINT reservation_dates_ordered
  CHECK ("checkOut" > "checkIn" AND "blockedUntil" >= "checkOut");

ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS reservation_no_overlap;
ALTER TABLE "reservation"
  ADD CONSTRAINT reservation_no_overlap
  EXCLUDE USING gist (
    "propertyId" WITH =,
    tstzrange("checkIn", "blockedUntil", '[)') WITH &&
  )
  WHERE (status = 'CONFIRMED'::"ReservationStatus");

ALTER TABLE "property" DROP CONSTRAINT IF EXISTS property_pricing_complete;
ALTER TABLE "property"
  ADD CONSTRAINT property_pricing_complete
  CHECK (NOT "pricingEnabled" OR "nightlyPrice" IS NOT NULL);

CREATE OR REPLACE FUNCTION reservation_freeze_past() RETURNS trigger AS $$
BEGIN
  IF OLD."blockedUntil" <= now()
     AND current_setting('hosto.allow_past_edit', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION
      'reservation % ended at % and can no longer be changed', OLD.id, OLD."blockedUntil"
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reservation_freeze_past ON "reservation";
CREATE TRIGGER reservation_freeze_past
  BEFORE UPDATE OR DELETE ON "reservation"
  FOR EACH ROW EXECUTE FUNCTION reservation_freeze_past();
