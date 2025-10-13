-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can manage blessings" ON public.blessings;

-- Create new permissive policies for events
CREATE POLICY "Anyone can manage events"
ON public.events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create new permissive policies for media
CREATE POLICY "Anyone can manage media"
ON public.media
FOR ALL
USING (true)
WITH CHECK (true);

-- Keep existing policies for public viewing
-- Events are viewable by everyone (already exists)
-- Media is viewable by everyone if visible (already exists)
-- Approved blessings are viewable by everyone (already exists)
-- Anyone can submit blessings (already exists)

-- Add policy for managing blessings
CREATE POLICY "Anyone can manage blessings"
ON public.blessings
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete blessings"
ON public.blessings
FOR DELETE
USING (true);