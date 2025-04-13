/*
  # Update clients table RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper auth checks
    - Ensure user_id is properly handled

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper auth checks
*/

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper auth checks
CREATE POLICY "Users can read their own clients"
ON clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
ON clients FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
ON clients FOR DELETE
USING (auth.uid() = user_id);