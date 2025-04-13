/*
  # Create admin users table

  1. New Table
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `role` (text, constrained to admin/manager/agent)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for admin access
    - Create default admin user

  3. Constraints
    - Unique username
    - Valid role values
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

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
END $$;

-- Create policy for admin access
CREATE POLICY "Admins can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

-- Insert default admin user (password: Test123!)
INSERT INTO admin_users (username, password_hash, role)
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwBAK.p.RlUeO', 'admin')
ON CONFLICT (username) DO NOTHING;