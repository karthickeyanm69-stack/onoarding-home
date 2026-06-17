-- EVE Admin Dashboard Database Schema Setup Script
-- Target: Supabase / PostgreSQL
-- Description: Creates the 'profiles' table matching the complete onboarding wizard fields.
--               Enables Row Level Security (RLS), configures permissive CRUD policies,
--               and sets up an automated trigger for 'updated_at' timestamps.

-- 1. CLEANUP (Idempotency)
-- Drop existing trigger, function, and table to prevent "already exists" errors.
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREATE TABLE
CREATE TABLE profiles (
    -- Primary identifier (UUID)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Section 1: Basic Information
    full_name TEXT NOT NULL DEFAULT '',
    preferred_name TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    
    -- Section 2: Academic Background
    education_level TEXT NOT NULL DEFAULT '',
    field_of_study TEXT NOT NULL DEFAULT '',
    institution TEXT NOT NULL DEFAULT '',
    
    -- Section 3: Parent/Guardian Details
    -- NOTE: parent fields are nullable because Independent Adult learners have no guardian
    is_independent_adult BOOLEAN NOT NULL DEFAULT FALSE,
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    parent_relationship TEXT,
    
    -- Section 4: Learning Goals & Areas of Interest (PostgreSQL Arrays)
    learning_goals TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    interests TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    
    -- Section 5: Learning & Habit Preferences
    learning_preference TEXT NOT NULL DEFAULT '',
    daily_commitment TEXT NOT NULL DEFAULT '',
    
    -- Section 6: AI Personalization Settings
    ai_adaptive_difficulty BOOLEAN NOT NULL DEFAULT TRUE,
    ai_study_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    ai_career_insights BOOLEAN NOT NULL DEFAULT FALSE,
    ai_concept_explainer BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Section 7: Communication Preferences
    notify_email_digest BOOLEAN NOT NULL DEFAULT TRUE,
    notify_push BOOLEAN NOT NULL DEFAULT TRUE,
    notify_weekly_achievements BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Form Metadata & Progress State
    step INTEGER NOT NULL DEFAULT 1,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes on fields commonly filtered/ordered in the Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON profiles(completed);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_is_independent ON profiles(is_independent_adult);

-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- Enable Row Level Security on the table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent creation collision
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable delete access for all users" ON profiles;

-- Create CRUD policies (Allow public anon & authenticated access since onboarding is done anonymously before login)
CREATE POLICY "Enable read access for all users" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON profiles FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" 
ON profiles FOR DELETE 
USING (true);

-- 4. AUTOMATED TIMESTAMP TRIGGER
-- Function to automatically set updated_at on modify
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to the profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. MIGRATION: If upgrading existing table, add missing column
-- Run this block only if upgrading an existing database (not a fresh install):
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_independent_adult BOOLEAN NOT NULL DEFAULT FALSE;
-- UPDATE profiles SET is_independent_adult = TRUE WHERE parent_name = 'SKIPPED';
-- UPDATE profiles SET parent_name = NULL, parent_email = NULL, parent_phone = NULL, parent_relationship = NULL WHERE is_independent_adult = TRUE;

-- 6. SAMPLE SEED DATA (Optional)
-- Insert a test profile (with parent guardian) to verify structure
INSERT INTO profiles (
    full_name, preferred_name, gender, education_level, field_of_study, institution, 
    is_independent_adult, parent_name, parent_email, parent_phone, parent_relationship, 
    learning_goals, interests, learning_preference, daily_commitment,
    ai_adaptive_difficulty, ai_study_reminders, ai_career_insights, ai_concept_explainer,
    notify_email_digest, notify_push, notify_weekly_achievements, step, completed
) VALUES (
    'Alex Mercer', 'Alex', 'non-binary', 'undergraduate', 'Computer Science', 'Stanford University',
    FALSE, 'Helen Mercer', 'helen@example.com', '+15550199', 'mother',
    ARRAY['Software Engineering', 'AI & Machine Learning'], ARRAY['Web Technologies', 'Robotics'], 'interactive', 'serious',
    TRUE, TRUE, TRUE, TRUE,
    TRUE, FALSE, TRUE, 10, TRUE
);

-- Insert an independent adult learner profile as a test
INSERT INTO profiles (
    full_name, preferred_name, gender, education_level, field_of_study, institution, 
    is_independent_adult, parent_name, parent_email, parent_phone, parent_relationship, 
    learning_goals, interests, learning_preference, daily_commitment,
    ai_adaptive_difficulty, ai_study_reminders, ai_career_insights, ai_concept_explainer,
    notify_email_digest, notify_push, notify_weekly_achievements, step, completed
) VALUES (
    'Jordan Blake', 'Jordan', 'prefer-not-to-say', 'postgraduate', 'Data Science', 'MIT',
    TRUE, NULL, NULL, NULL, NULL,
    ARRAY['career-advancement', 'skill-improvement'], ARRAY['data-science', 'mathematics'], 'hands-on', 'intensive',
    TRUE, FALSE, TRUE, TRUE,
    FALSE, TRUE, FALSE, 10, TRUE
);

