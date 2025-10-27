/*
  # Propel Platform Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `wallet_address` (text, unique)
      - `username` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `status` (enum: open, in_progress, under_review, completed, failed)
      - `milestone_title` (text)
      - `success_criteria` (jsonb array)
      - `deliverables` (jsonb array)
      - `market_duration_days` (integer)
      - `development_duration_days` (integer)
      - `market_end_time` (timestamptz)
      - `milestone_deadline` (timestamptz)
      - `total_pool` (numeric, default 0)
      - `yes_pool` (numeric, default 0)
      - `no_pool` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `bets`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references profiles)
      - `position` (enum: yes, no)
      - `amount` (numeric)
      - `potential_profit` (numeric)
      - `status` (enum: active, won, lost, refunded)
      - `payout` (numeric, nullable)
      - `created_at` (timestamptz)

    - `verdicts`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects, unique)
      - `is_success` (boolean)
      - `votes_for` (integer, default 0)
      - `votes_against` (integer, default 0)
      - `evidence_links` (jsonb array)
      - `review_notes` (text)
      - `decided_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all projects and verdicts
      - Create/update own profile
      - Create bets (authenticated users only)
      - Create projects (authenticated users only)
      - Update own projects (creators only)
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('open', 'in_progress', 'under_review', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bet_position AS ENUM ('yes', 'no');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bet_status AS ENUM ('active', 'won', 'lost', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  wallet_address text UNIQUE,
  username text,
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status project_status DEFAULT 'open',
  milestone_title text NOT NULL,
  success_criteria jsonb DEFAULT '[]'::jsonb,
  deliverables jsonb DEFAULT '[]'::jsonb,
  market_duration_days integer NOT NULL,
  development_duration_days integer NOT NULL,
  market_end_time timestamptz NOT NULL,
  milestone_deadline timestamptz NOT NULL,
  total_pool numeric DEFAULT 0,
  yes_pool numeric DEFAULT 0,
  no_pool numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  position bet_position NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  potential_profit numeric DEFAULT 0,
  status bet_status DEFAULT 'active',
  payout numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bets"
  ON bets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bets"
  ON bets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Verdicts table
CREATE TABLE IF NOT EXISTS verdicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_success boolean NOT NULL,
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  evidence_links jsonb DEFAULT '[]'::jsonb,
  review_notes text,
  decided_at timestamptz DEFAULT now()
);

ALTER TABLE verdicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verdicts"
  ON verdicts FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_bets_project ON bets(project_id);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_verdicts_project ON verdicts(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles
DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add trigger to projects
DO $$ BEGIN
  CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
