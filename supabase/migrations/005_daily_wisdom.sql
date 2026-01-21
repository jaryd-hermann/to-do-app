-- Create daily_wisdom table
CREATE TABLE IF NOT EXISTS daily_wisdom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author TEXT DEFAULT 'Oliver Burkeman',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE daily_wisdom ENABLE ROW LEVEL SECURITY;

-- Allow all users to read daily wisdom
CREATE POLICY "Anyone can read daily wisdom"
  ON daily_wisdom
  FOR SELECT
  USING (true);

-- Seed with wisdom quotes
INSERT INTO daily_wisdom (quote) VALUES
('Think of each day as a chance to move just a small number of meaningful things forward. This helps you focus on what matters. Pay no mind to what you''re "neglecting" to do.'),
('The secret to productivity isn''t doing more. It''s doing less, but doing it better. Focus on what truly matters and let the rest fall away.'),
('You can''t do everything. Accepting this is the first step toward doing what actually matters.'),
('The most productive people aren''t the ones who do the most. They''re the ones who say no to almost everything.'),
('Your time is finite. Every yes to one thing is a no to everything else. Choose wisely.'),
('The goal isn''t to finish everything. The goal is to finish the right things.'),
('Productivity isn''t about speed. It''s about direction. Move toward what matters, even if slowly.'),
('Stop trying to do it all. Start trying to do what matters. The difference is everything.'),
('The best way to get more done is to do less. Focus on what truly moves the needle.'),
('You don''t need to do everything. You just need to do the right things. And that''s a much shorter list.');
