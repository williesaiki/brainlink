/*
  # Estate Academy Database Structure

  1. New Tables
    - Creates clients, offers, client_offers, user_profiles, and admin_users tables if they don't exist
    - All tables use UUID primary keys with proper relations
    - Appropriate data types and constraints for all columns

  2. Security
    - Enables Row Level Security for all tables
    - Creates access policies for authenticated users
    - Sets up proper relationship handling

  3. Performance
    - Adds indexes on frequently queried columns
    - Sets up triggers for automatic timestamp updates
*/

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Check if clients table exists, create if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients') THEN
    CREATE TABLE clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name text NOT NULL,
      last_name text NOT NULL,
      email text,
      phone text,
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      client_type text NOT NULL CHECK (client_type IN ('buyer', 'seller')),
      locations text[] DEFAULT '{}',
      price_min numeric,
      price_max numeric,
      agent_id uuid REFERENCES auth.users(id),
      agent_name text,
      tags text[] DEFAULT '{}'
    );
    
    -- Enable RLS on clients table
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Add update trigger for clients if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at'
  ) THEN
    CREATE TRIGGER update_clients_updated_at
      BEFORE UPDATE ON clients
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Check if offers table exists, create if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'offers') THEN
    CREATE TABLE offers (
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
      photos text[] DEFAULT '{}',
      features jsonb DEFAULT '{}'::jsonb,
      address jsonb DEFAULT '{}'::jsonb,
      contact_info jsonb DEFAULT '{}'::jsonb
    );
    
    -- Enable RLS on offers table
    ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Add update trigger for offers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_offers_updated_at'
  ) THEN
    CREATE TRIGGER update_offers_updated_at
      BEFORE UPDATE ON offers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Check if client_offers table exists, create if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'client_offers') THEN
    CREATE TABLE client_offers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      notes text,
      status text DEFAULT 'active',
      UNIQUE(client_id, offer_id)
    );
    
    -- Enable RLS on client_offers table
    ALTER TABLE client_offers ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Check if user_profiles table exists, create if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name text,
      phone text,
      location text,
      specialization text,
      experience text,
      avatar_url text,
      bio text,
      social_links jsonb DEFAULT '{}'::jsonb,
      preferences jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Enable RLS on user_profiles table
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Add update trigger for user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Check if admin_users table exists, create if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_users') THEN
    CREATE TABLE admin_users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      username text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'agent')),
      created_at timestamptz DEFAULT now(),
      last_login timestamptz
    );
    
    -- Enable RLS on admin_users table
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create security policies for clients table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can read their own clients') THEN
    CREATE POLICY "Users can read their own clients"
      ON clients
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can insert their own clients') THEN
    CREATE POLICY "Users can insert their own clients"
      ON clients
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can update their own clients') THEN
    CREATE POLICY "Users can update their own clients"
      ON clients
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can delete their own clients') THEN
    CREATE POLICY "Users can delete their own clients"
      ON clients
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create security policies for offers table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offers' AND policyname = 'Users can read their own offers') THEN
    CREATE POLICY "Users can read their own offers"
      ON offers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offers' AND policyname = 'Users can insert their own offers') THEN
    CREATE POLICY "Users can insert their own offers"
      ON offers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offers' AND policyname = 'Users can update their own offers') THEN
    CREATE POLICY "Users can update their own offers"
      ON offers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offers' AND policyname = 'Users can delete their own offers') THEN
    CREATE POLICY "Users can delete their own offers"
      ON offers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create security policies for client_offers table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_offers' AND policyname = 'Users can read their own client offers') THEN
    CREATE POLICY "Users can read their own client offers"
      ON client_offers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_offers' AND policyname = 'Users can insert their own client offers') THEN
    CREATE POLICY "Users can insert their own client offers"
      ON client_offers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_offers' AND policyname = 'Users can delete their own client offers') THEN
    CREATE POLICY "Users can delete their own client offers"
      ON client_offers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create security policies for user_profiles table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can read their own profile') THEN
    CREATE POLICY "Users can read their own profile"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Create security policy for admin_users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Admins can manage admin_users') THEN
    CREATE POLICY "Admins can manage admin_users"
      ON admin_users
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM admin_users 
          WHERE role = 'admin'
        )
      );
  END IF;
END
$$;

-- Create necessary indexes for performance optimization
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_client_type_idx ON clients(client_type);
CREATE INDEX IF NOT EXISTS clients_price_range_idx ON clients(price_min, price_max);
CREATE INDEX IF NOT EXISTS offers_user_id_idx ON offers(user_id);
CREATE INDEX IF NOT EXISTS offers_price_idx ON offers(price);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);
CREATE INDEX IF NOT EXISTS client_offers_client_id_idx ON client_offers(client_id);
CREATE INDEX IF NOT EXISTS client_offers_offer_id_idx ON client_offers(offer_id);
CREATE INDEX IF NOT EXISTS client_offers_user_id_idx ON client_offers(user_id);