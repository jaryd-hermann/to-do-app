-- Scribbles table for notes/scribbles feature
CREATE TABLE IF NOT EXISTS public.scribbles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  date DATE, -- NULL for general notes, DATE for daily scribbles
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scribbles_user_id ON public.scribbles(user_id);
CREATE INDEX IF NOT EXISTS idx_scribbles_user_date ON public.scribbles(user_id, date);
CREATE INDEX IF NOT EXISTS idx_scribbles_user_pinned ON public.scribbles(user_id, pinned);
CREATE INDEX IF NOT EXISTS idx_scribbles_user_created ON public.scribbles(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.scribbles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scribbles
CREATE POLICY "Users can view own scribbles" ON public.scribbles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scribbles" ON public.scribbles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scribbles" ON public.scribbles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scribbles" ON public.scribbles
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_scribbles_updated_at
  BEFORE UPDATE ON public.scribbles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
