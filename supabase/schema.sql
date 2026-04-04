-- ============================================
-- SOYPROFESIONAL - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'professional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFESSIONALS TABLE
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trade TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  lat DOUBLE PRECISION NOT NULL DEFAULT -38.7183,
  lng DOUBLE PRECISION NOT NULL DEFAULT -62.2663,
  status TEXT NOT NULL DEFAULT 'Disponible',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_early_adopter BOOLEAN NOT NULL DEFAULT FALSE,
  is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PORTFOLIO ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  caption TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('antes-despues', 'en-progreso', 'terminado', 'general')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PROFILES: Everyone can read, users can update their own
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PROFESSIONALS: Everyone can read, owners can update
CREATE POLICY "professionals_select_all" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "professionals_insert_own" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "professionals_update_own" ON public.professionals FOR UPDATE USING (auth.uid() = profile_id);

-- REVIEWS: Everyone can read, authenticated users can insert
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- PORTFOLIO: Everyone can read, owners can insert/update
CREATE POLICY "portfolio_select_all" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "portfolio_insert_own" ON public.portfolio_items FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT profile_id FROM public.professionals WHERE id = professional_id)
);
CREATE POLICY "portfolio_update_own" ON public.portfolio_items FOR UPDATE USING (
  auth.uid() IN (SELECT profile_id FROM public.professionals WHERE id = professional_id)
);

-- CONVERSATIONS: Participants can read/insert
CREATE POLICY "conversations_select_own" ON public.conversations FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);
CREATE POLICY "conversations_insert_auth" ON public.conversations FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);
CREATE POLICY "conversations_update_own" ON public.conversations FOR UPDATE USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- MESSAGES: Participants can read/insert
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "messages_insert_auth" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ENABLE REALTIME for messages
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_professionals_trade ON public.professionals(trade);
CREATE INDEX IF NOT EXISTS idx_professionals_location ON public.professionals(lat, lng);
CREATE INDEX IF NOT EXISTS idx_reviews_professional ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_professional ON public.portfolio_items(professional_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
