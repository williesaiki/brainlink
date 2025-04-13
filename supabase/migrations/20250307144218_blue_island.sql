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
    - Add policy for authenticated users to manage admin_users if they are admins

  3. Initial Data
    - Create first admin user
*/

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;

-- Create admin_users table if not exists
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

-- Create policy for admins to manage admin_users
CREATE POLICY "Admins can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin'
    )
  );

-- Create initial admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE username = 'admin@estateacademy.pl'
  ) THEN
    INSERT INTO admin_users (
      username,
      password_hash,
      role,
      created_at
    ) VALUES (
      'admin@estateacademy.pl',
      crypt('admin123', gen_salt('bf')),
      'admin',
      now()
    );
  END IF;
END $$;