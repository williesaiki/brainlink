/*
  # Create admin users table and initial admin user

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for authenticated users to manage admin_users (if not exists)

  3. Initial Data
    - Create first admin user
*/

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  CONSTRAINT valid_role CHECK (role = ANY (ARRAY['admin', 'manager', 'agent']))
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
  
  CREATE POLICY "Admins can manage admin_users"
    ON admin_users
    FOR ALL
    TO authenticated
    USING (
      auth.uid() IN (
        SELECT id FROM admin_users WHERE role = 'admin'
      )
    );
END $$;

-- Create initial admin user if not exists
INSERT INTO admin_users (
  username,
  password_hash,
  role,
  created_at
) 
SELECT 
  'admin@estateacademy.pl',
  crypt('admin123', gen_salt('bf')),
  'admin',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE username = 'admin@estateacademy.pl'
);