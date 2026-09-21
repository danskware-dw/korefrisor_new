export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  status text NOT NULL,
  employee_id text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  hold_until timestamptz,
  slot_occupied boolean NOT NULL DEFAULT true,
  service_ids text[] NOT NULL DEFAULT '{}',
  cancel_token text NOT NULL UNIQUE,
  payment_reference text UNIQUE,
  payment_mode text,
  provider_state text,
  authorized_ore integer NOT NULL DEFAULT 0,
  captured_ore integer NOT NULL DEFAULT 0,
  refunded_ore integer NOT NULL DEFAULT 0,
  sms_day_before boolean,
  reminder_for_start timestamptz,
  sms_reminder_sent_at timestamptz,
  lat double precision,
  lon double precision,
  manual_payment_verified_at timestamptz,
  manual_payment_verified_by text,
  refund_pending_at timestamptz,
  snapshot jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS bookings_employee_start_idx ON bookings (employee_id, start_at);

CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY DEFAULT 'default',
  overlay jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_events (
  id text PRIMARY KEY,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  operation text NOT NULL,
  amount_ore integer NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb
);

CREATE TABLE IF NOT EXISTS payment_operations (
  id text PRIMARY KEY,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  kind text NOT NULL,
  status text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text NOT NULL UNIQUE,
  last_error text
);

CREATE TABLE IF NOT EXISTS outbox (
  id text PRIMARY KEY,
  booking_id text NOT NULL,
  kind text NOT NULL,
  send_key text NOT NULL UNIQUE,
  payload jsonb NOT NULL,
  status text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text
);

CREATE TABLE IF NOT EXISTS message_deliveries (
  send_key text PRIMARY KEY,
  delivered_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  message text NOT NULL
);

CREATE INDEX IF NOT EXISTS job_applications_created_idx ON job_applications (created_at DESC);
`;

export const EXCLUSION_SQL = `
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_employee_time_excl;
ALTER TABLE bookings ADD CONSTRAINT bookings_employee_time_excl
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (slot_occupied AND employee_id IS NOT NULL);
`;
