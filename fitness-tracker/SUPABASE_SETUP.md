# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details and wait for it to provision

## 2. Create the Database Table

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create the user_data table
CREATE TABLE user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  workout_logs JSONB DEFAULT '[]'::jsonb,
  skill_logs JSONB DEFAULT '[]'::jsonb,
  login_logs JSONB DEFAULT '[]'::jsonb,
  progress_data JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{"darkMode": true, "accentColor": "#007AFF", "soundEnabled": true, "hapticEnabled": true}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  current_streak INTEGER DEFAULT 0,
  todays_activity INTEGER DEFAULT 0,
  last_activity_date TEXT,
  last_workout_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only access their own data
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
```

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Find your credentials in Supabase:
   - Go to **Project Settings** > **API**
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

3. Update `.env` with your values:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

## 4. Enable Email Auth (Optional)

By default, Supabase requires email confirmation. To disable for development:

1. Go to **Authentication** > **Providers**
2. Click on **Email**
3. Toggle off "Confirm email"

## 5. Run the App

```bash
npm run dev
```

The app will now:
- Show login/signup screen when Supabase is configured
- Sync data to the cloud automatically
- Work offline and sync when reconnected
- Keep local backup in localStorage

## Running Without Supabase

If no `.env` file exists or variables are empty, the app runs in **local-only mode**:
- No authentication required
- Data stored only in localStorage
- Perfect for personal use on a single device
