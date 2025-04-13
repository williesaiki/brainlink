/*
# Client Management System

1. New Tables
   - `clients` - Stores client information with type (buyer or seller)
   - `client_offers` - Junction table linking clients to offers
   
2. Features
   - Full client profile with contact information and notes
   - Client type categorization (buyer/seller)
   - Location preferences as array
   - Price range specification
   - Client tagging system
   - Client-offer relationship tracking with status

3. Security
   - Row Level Security (RLS) for data protection
   - User-specific policies ensuring data isolation
   
4. Performance
   - Optimized indexes for common query patterns
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_type text CHECK (client_type = ANY (ARRAY['buyer'::text, 'seller'::text])),
  locations text[] DEFAULT '{}'::text[],
  price_min numeric,
  price_max numeric,
  agent_id uuid REFERENCES auth.users(id),
  agent_name text,
  tags text[] DEFAULT '{}'::text[]
);

-- Create client_offers junction table
CREATE TABLE IF NOT EXISTS client_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text,
  status text DEFAULT 'active'::text
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_offers ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for client-offer pairs (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'client_offers_client_id_offer_id_key'
    ) THEN
        ALTER TABLE client_offers ADD CONSTRAINT client_offers_client_id_offer_id_key UNIQUE (client_id, offer_id);
    END IF;
END
$$;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Users can read their client_offers" ON client_offers;
DROP POLICY IF EXISTS "Users can insert their client_offers" ON client_offers;
DROP POLICY IF EXISTS "Users can delete their client_offers" ON client_offers;
DROP POLICY IF EXISTS "Users can read their own client offers" ON client_offers;
DROP POLICY IF EXISTS "Users can insert their own client offers" ON client_offers;
DROP POLICY IF EXISTS "Users can delete their own client offers" ON client_offers;

-- Create policies for clients table
CREATE POLICY "Users can read their own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for client_offers table
CREATE POLICY "Users can read their client_offers"
  ON client_offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their client_offers"
  ON client_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their client_offers"
  ON client_offers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS clients_client_type_idx ON clients(client_type);
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_price_range_idx ON clients(price_min, price_max);
CREATE INDEX IF NOT EXISTS client_offers_client_id_idx ON client_offers(client_id);
CREATE INDEX IF NOT EXISTS client_offers_offer_id_idx ON client_offers(offer_id);
CREATE INDEX IF NOT EXISTS client_offers_user_id_idx ON client_offers(user_id);