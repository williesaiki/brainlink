/*
  # Add admin user with unique email constraint

  1. Changes
    - Add unique constraint on email column
    - Add admin user with email 'admin' and password 'Test123!'
*/

-- First ensure email column has unique constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key'
    AND table_name = 'users'
    AND constraint_type = 'UNIQUE'
  ) THEN
    ALTER TABLE auth.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_current,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin'
);