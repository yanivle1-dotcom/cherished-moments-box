-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('draft', 'published');

-- Create Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  cover_image_url TEXT,
  description_short TEXT,
  description_full TEXT,
  status public.event_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (status = 'published' OR true);

CREATE POLICY "Authenticated users can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Media table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  caption TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is viewable by everyone if visible"
  ON public.media FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage media"
  ON public.media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Blessings table
CREATE TYPE public.blessing_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.blessings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_relation TEXT,
  text TEXT NOT NULL,
  media_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status public.blessing_status DEFAULT 'pending'
);

ALTER TABLE public.blessings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved blessings are viewable by everyone"
  ON public.blessings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can submit blessings"
  ON public.blessings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage blessings"
  ON public.blessings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_media_event_id ON public.media(event_id);
CREATE INDEX idx_media_visible ON public.media(visible);
CREATE INDEX idx_blessings_event_id ON public.blessings(event_id);
CREATE INDEX idx_blessings_status ON public.blessings(status);