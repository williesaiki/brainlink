/*
  # Create users and authentication tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `role` (text)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for user management
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  CONSTRAINT valid_username CHECK (char_length(username) >= 3)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  ));

-- Insert test users
DO $$
BEGIN
  INSERT INTO users (username, password_hash, role)
  VALUES 
    ('admin', crypt('Test123!', gen_salt('bf')), 'admin'),
    ('lukasz', crypt('Test123!', gen_salt('bf')), 'user'),
    ('tomek', crypt('Test123!', gen_salt('bf')), 'user');
END $$;