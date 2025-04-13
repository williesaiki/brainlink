/*
  # Fix RLS policies for clients table

  1. Security Changes
    - Drop existing policies
    - Re-enable RLS
    - Recreate policies for CRUD operations:
      - Users can read their own clients
      - Users can insert clients with their user_id
      - Users can update their own clients
      - Users can delete their own clients
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own clients" ON clients;
  DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
  DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
  DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
END $$;

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy for reading clients
CREATE POLICY "Users can read their own clients"
ON clients
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for inserting clients
CREATE POLICY "Users can insert their own clients"
ON clients
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for updating clients
CREATE POLICY "Users can update their own clients"
ON clients
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting clients
CREATE POLICY "Users can delete their own clients"
ON clients
FOR DELETE
USING (auth.uid() = user_id);