/*
  # Optimized Database Schema for Estate Academy
  
  This migration creates the core tables and essential functionality.
  It is optimized to avoid connection timeouts by focusing on critical schema elements.
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Alter clients table to add additional columns
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS client_type text,
  ADD COLUMN IF NOT EXISTS locations text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_min numeric,
  ADD COLUMN IF NOT EXISTS price_max numeric,
  ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS agent_name text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add constraint to client_type column
ALTER TABLE public.clients
  ADD CONSTRAINT clients_client_type_check CHECK (client_type IN ('buyer', 'seller'));

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create clients update trigger
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Offers table
CREATE TABLE IF NOT EXISTS public.offers (
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
  external_id text UNIQUE
);

-- Alter offers table to add additional columns
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}'::jsonb;

-- Enable RLS on offers table
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create offers update trigger
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Junction table between clients and offers
CREATE TABLE IF NOT EXISTS public.client_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text,
  status text DEFAULT 'active',
  UNIQUE(client_id, offer_id)
);

-- Enable RLS on client_offers table
ALTER TABLE public.client_offers ENABLE ROW LEVEL SECURITY;

-- Extended user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create user_profiles update trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Add constraint to role column
ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('admin', 'manager', 'agent'));

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create necessary indexes for performance optimization
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS clients_client_type_idx ON public.clients(client_type);
CREATE INDEX IF NOT EXISTS clients_price_range_idx ON public.clients(price_min, price_max);
CREATE INDEX IF NOT EXISTS offers_user_id_idx ON public.offers(user_id);
CREATE INDEX IF NOT EXISTS offers_price_idx ON public.offers(price);
CREATE INDEX IF NOT EXISTS offers_status_idx ON public.offers(status);
CREATE INDEX IF NOT EXISTS client_offers_client_id_idx ON public.client_offers(client_id);
CREATE INDEX IF NOT EXISTS client_offers_offer_id_idx ON public.client_offers(offer_id);
CREATE INDEX IF NOT EXISTS client_offers_user_id_idx ON public.client_offers(user_id);

-- Security policies for clients table
CREATE POLICY "Users can read their own clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);