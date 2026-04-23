-- Run this in your Supabase SQL Editor to add the category column without losing data
ALTER TABLE public.professionals 
ADD COLUMN category TEXT NOT NULL DEFAULT 'profesional' 
CHECK (category IN ('profesional', 'servicio', 'tecnico', 'oficio'));

-- Optional: Since everyone defaults to 'profesional' right now, 
-- they will manually correct it the next time they edit their profile, 
-- or you can run a script later.
