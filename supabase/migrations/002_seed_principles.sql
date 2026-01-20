-- Seed default principles for users to remix
-- These are system templates that all users can view and copy

-- First, modify the schema to allow NULL user_id for system templates
-- This allows system templates to exist without being tied to a specific user
ALTER TABLE public.principles
  ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure user_id is NOT NULL for non-system templates
ALTER TABLE public.principles
  ADD CONSTRAINT principles_user_id_check 
  CHECK (is_system_template = TRUE OR user_id IS NOT NULL);

-- Add unique constraint on title for system templates to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_principles_system_template_title 
ON public.principles(title) 
WHERE is_system_template = TRUE;

-- Update the foreign key constraint to handle NULL values
ALTER TABLE public.principles
  DROP CONSTRAINT IF EXISTS principles_user_id_fkey;

ALTER TABLE public.principles
  ADD CONSTRAINT principles_user_id_fkey
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Insert system template principles
-- Using NULL user_id for system templates since they're not tied to any specific user
-- ON CONFLICT will prevent duplicates if migration is run multiple times
INSERT INTO public.principles (id, user_id, title, description, position, is_system_template, created_at, updated_at)
VALUES
  (
    uuid_generate_v4(),
    NULL,
    'Health & Fitness',
    'Look and feel strong by nurturing and respecting my body with intense exercise, progressive challenge, good foods and self care',
    0,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Relationships',
    'Show up with presence, curiosity, and kindness to always make the people I love feel seen and invest in moments that deepen our connections and shared experiences',
    1,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Money & Wealth',
    'Live my rich life and enjoy money, but spend less than I earn and invest with discipline from multiple income sources to compound freedom, flexibility, and wealth',
    2,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Mindfulness & Spirit',
    'Practice being present, finding moments of stillness and awe, protecting my peace and being grounded through gratitude',
    3,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Wisdom & Growth',
    'Always be learning, developing skills, improving my character, and practicing the tenets of Stoicism',
    4,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Work & Craft',
    'Put pride, effort, and my taste and creativity into building quality products that help people',
    5,
    TRUE,
    NOW(),
    NOW()
  )
ON CONFLICT (title) 
WHERE is_system_template = TRUE 
DO NOTHING;
