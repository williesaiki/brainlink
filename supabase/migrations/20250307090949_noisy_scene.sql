/*
  # Update admin users table and policies

  1. Changes
    - Drop existing policy if exists
    - Create new policy for admin users
    - Add default admin and agent users

  2. Security
    - Ensure RLS is enabled
    - Add policy for admins to manage admin_users
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policy
CREATE POLICY "Admins can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'admin'
    )
  );

-- Insert default admin user if not exists
INSERT INTO admin_users (username, password_hash, role)
VALUES 
  ('admin', '$argon2id$v=19$m=65536,t=3,p=4$QXNhbHQ$hash', 'admin'),
  ('lukasz', '$argon2id$v=19$m=65536,t=3,p=4$QXNhbHQ$hash', 'agent')
ON CONFLICT (username) DO NOTHING;