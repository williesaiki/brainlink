/*
  # Create admin users table and setup roles

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
    - Add policy for authenticated users to manage admin_users

  3. Initial Data
    - Insert default admin user
    - Insert default agent user
*/

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
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
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwBAK.p.RlUeO', 'admin');

-- Insert default agent user (password: Test123!)
INSERT INTO admin_users (username, password_hash, role)
VALUES ('lukasz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwBAK.p.RlUeO', 'agent');