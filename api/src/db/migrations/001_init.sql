CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,email text UNIQUE NOT NULL,phone text NOT NULL,password_hash text NOT NULL,role text NOT NULL DEFAULT 'HOMEOWNER',package_id text,stripe_customer_id text UNIQUE,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS refresh_tokens(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES users(id) ON DELETE CASCADE,token_hash text UNIQUE NOT NULL,expires_at timestamptz NOT NULL,revoked_at timestamptz,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS properties(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES users(id) ON DELETE CASCADE,name text NOT NULL,address_line1 text NOT NULL,address_line2 text,city text NOT NULL,postcode text NOT NULL,property_type text NOT NULL,bedrooms int,notes text,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS subscriptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES users(id) ON DELETE CASCADE,package_id text NOT NULL,stripe_subscription_id text UNIQUE,status text NOT NULL,current_period_end timestamptz,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS tickets(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
    guest_name text,
    guest_phone text,
    guest_email text,
    guest_address text,
    guest_city text,
    guest_postcode text,
    title text NOT NULL,
    description text NOT NULL,
    priority text NOT NULL,
    status text NOT NULL DEFAULT 'OPEN',quote numeric(10,2),
    invoice_note text,
    stripe_payment_intent_id text UNIQUE,
    paid_at timestamptz,
    completed_at timestamptz,
    confirmed_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS ratings(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),ticket_id uuid UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,user_id uuid REFERENCES users(id),stars int CHECK(stars BETWEEN 1 AND 5),comment text,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS ticket_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,actor_user_id uuid,event text,metadata jsonb DEFAULT '{}',created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS schema_migrations(id text PRIMARY KEY,applied_at timestamptz DEFAULT now());
