/*
  # Create calendar_settings table for user preferences

  1. New Tables
    - `calendar_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `default_calendar_id` (text)
      - `timezone` (text)
      - `sync_interval` (integer)
      - `notification_settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create calendar_settings table
CREATE TABLE IF NOT EXISTS calendar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_calendar_id text NOT NULL DEFAULT 'primary',
  timezone text NOT NULL DEFAULT 'Europe/Warsaw',
  sync_interval integer NOT NULL DEFAULT 15,
  notification_settings jsonb DEFAULT '{"emailNotifications": true, "pushNotifications": true, "reminderTimes": [30, 60]}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_settings_updated_at
  BEFORE UPDATE ON calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own calendar settings"
  ON calendar_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar settings"
  ON calendar_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar settings"
  ON calendar_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS calendar_settings_user_id_idx ON calendar_settings(user_id);