/*
# Offers Management Schema

1. New Tables
   - `offers` - Stores property offer information
2. Enhancements
   - Add photos, features, address, and contact_info fields
   - Add external_id field for integration with external systems
3. Security
   - Enable RLS on offers table
   - Add policies for authenticated users
4. Indexing
   - Create indexes for common query patterns
*/

-- Create offers table if it doesn't exist
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  location text,
  area numeric,
  rooms integer,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id text UNIQUE,
  photos text[] DEFAULT '{}'::text[],
  features jsonb DEFAULT '{}'::jsonb,
  address jsonb DEFAULT '{}'::jsonb,
  contact_info jsonb DEFAULT '{}'::jsonb
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS offers_user_id_idx ON offers(user_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);
CREATE INDEX IF NOT EXISTS offers_price_idx ON offers(price);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'offers' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create their own offers" ON offers;
  DROP POLICY IF EXISTS "Users can read their own offers" ON offers;
  DROP POLICY IF EXISTS "Users can update their own offers" ON offers;
  DROP POLICY IF EXISTS "Users can delete their own offers" ON offers;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create or replace policies
CREATE POLICY "Users can create their own offers"
  ON offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers"
  ON offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offers"
  ON offers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_offers_updated_at'
    AND tgrelid = 'offers'::regclass
  ) THEN
    CREATE TRIGGER update_offers_updated_at
      BEFORE UPDATE ON offers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END
$$;