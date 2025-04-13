/*
  # Create admin users table and policies

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `role` (text)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)
    
  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for admin access only
    - Handle existing policy gracefully
*/

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'agent'))
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
  
  -- Create new policy
  CREATE POLICY "Admins can manage admin_users"
    ON admin_users
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin'
    ));
END $$;

-- Insert default admin user (password: Test123!)
INSERT INTO admin_users (username, password_hash, role)
VALUES ('lukasz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwBAK.p.RlUeO', 'admin')
ON CONFLICT (username) DO NOTHING;