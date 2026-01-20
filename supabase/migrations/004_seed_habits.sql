-- Seed System Habits
INSERT INTO system_habits (title) VALUES
  ('Morning meditation'),
  ('Exercise'),
  ('Read for 30 minutes'),
  ('Drink 8 glasses of water'),
  ('Journal'),
  ('No social media'),
  ('Eat healthy'),
  ('Practice gratitude'),
  ('Sleep 8 hours'),
  ('Learn something new'),
  ('Connect with a friend'),
  ('Stretch'),
  ('No phone in bedroom'),
  ('Cook a meal'),
  ('Take a walk')
ON CONFLICT (title) DO NOTHING;
