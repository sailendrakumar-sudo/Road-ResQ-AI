-- ==========================================
-- ROAD RESQ AI - SUPABASE POSTGRESQL SCHEMA
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  role VARCHAR(50) DEFAULT 'traveler', -- 'traveler' or 'responder'
  full_name VARCHAR(255),
  phone VARCHAR(20) UNIQUE,
  emergency_contact VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESPONDERS TABLE
CREATE TABLE IF NOT EXISTS public.responders (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  specialization VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_rescues INT DEFAULT 0,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(10,8),
  is_online BOOLEAN DEFAULT FALSE
);

-- 3. EMERGENCIES TABLE
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(10,8),
  description TEXT,
  image_url TEXT,
  ai_diagnosis JSONB,
  risk_score INT,
  safe_mode_active BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, matched, en_route, re_planning, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESCUES TABLE
CREATE TABLE IF NOT EXISTS public.rescues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id UUID REFERENCES public.emergencies(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES public.responders(id) ON DELETE CASCADE,
  estimated_cost_min INT,
  estimated_cost_max INT,
  status VARCHAR(50) DEFAULT 'dispatched', -- dispatched, arrived, failed, completed
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Travelers view own emergencies" ON public.emergencies;
CREATE POLICY "Travelers view own emergencies" ON public.emergencies 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Responders view assigned emergencies" ON public.emergencies;
CREATE POLICY "Responders view assigned emergencies" ON public.emergencies 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.rescues 
    WHERE public.rescues.emergency_id = public.emergencies.id 
    AND public.rescues.responder_id = auth.uid()
  )
);

-- Service Role Full Access (Needed for Backend Express API with Service Role Key)
DROP POLICY IF EXISTS "Service role emergencies access" ON public.emergencies;
CREATE POLICY "Service role emergencies access" ON public.emergencies
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role rescues access" ON public.rescues;
CREATE POLICY "Service role rescues access" ON public.rescues
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow public reads on responders for proximity queries
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public responders read" ON public.responders;
CREATE POLICY "Public responders read" ON public.responders FOR SELECT USING (true);
