-- Habits Feature Schema
-- System habits (predefined)
CREATE TABLE IF NOT EXISTS system_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-created habits
CREATE TABLE IF NOT EXISTS user_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, title)
);

-- User selected habits (junction table)
-- Links users to habits they want to track (either system or custom)
CREATE TABLE IF NOT EXISTS user_selected_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL, -- Can reference system_habits.id or user_habits.id
  habit_type TEXT NOT NULL CHECK (habit_type IN ('system', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id, habit_type)
);

-- Daily habit completions
CREATE TABLE IF NOT EXISTS daily_habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('system', 'custom')),
  date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id, habit_type, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_selected_habits_user_id ON user_selected_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_habit_completions_user_date ON daily_habit_completions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_habit_completions_habit ON daily_habit_completions(habit_id, habit_type, date);
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON user_habits(user_id);

-- RLS Policies for system_habits (public read)
ALTER TABLE system_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read system habits" ON system_habits FOR SELECT USING (true);

-- RLS Policies for user_habits
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own habits" ON user_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits" ON user_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON user_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON user_habits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_selected_habits
ALTER TABLE user_selected_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their selected habits" ON user_selected_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can select habits" ON user_selected_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their selected habits" ON user_selected_habits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_habit_completions
ALTER TABLE daily_habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their habit completions" ON daily_habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create habit completions" ON daily_habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their habit completions" ON daily_habit_completions FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_habit_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.is_completed = TRUE AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_daily_habit_completions_timestamp
  BEFORE UPDATE ON daily_habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_habit_completions_updated_at();
