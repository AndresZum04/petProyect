-- ============================================================
-- PETCONNECT — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'User',
  role      TEXT NOT NULL DEFAULT 'user'  -- 'user' | 'admin'
);

-- ============================================================
-- TABLE: pets
-- ============================================================

CREATE TABLE IF NOT EXISTS pets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  species           TEXT NOT NULL,
  breed             TEXT,
  age_label         TEXT NOT NULL,
  size              TEXT,
  gender            TEXT,
  status            TEXT NOT NULL DEFAULT 'available',
  story             TEXT,
  personality_tags  TEXT[] DEFAULT '{}',
  rescue_story      TEXT,
  vaccines          JSONB DEFAULT '[]',
  health_notes      TEXT,
  special_needs     BOOLEAN NOT NULL DEFAULT false,
  special_needs_description TEXT,
  photos            TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: adoption_requests
-- ============================================================

CREATE TABLE IF NOT EXISTS adoption_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id       UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  housing_type TEXT,
  experience   TEXT,
  motivation   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets: public read, authenticated write (admin)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pets_select" ON pets FOR SELECT USING (true);
CREATE POLICY "pets_insert" ON pets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "pets_update" ON pets FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "pets_delete" ON pets FOR DELETE USING (auth.uid() IS NOT NULL);

-- Adoption requests: anyone can insert, only authenticated can read
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests_insert" ON adoption_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests_select" ON adoption_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "requests_update" ON adoption_requests FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE: Create pet-photos bucket
-- (Run in Supabase Storage dashboard or uncomment if supported)
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('pet-photos', 'pet-photos', true)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA (optional — comment out in production)
-- ============================================================

INSERT INTO pets (name, species, breed, age_label, size, gender, status, story, personality_tags, rescue_story, vaccines, health_notes, photos)
VALUES
  (
    'Luna', 'dog', 'Golden Retriever Mix', '2 years', 'large', 'female', 'available',
    'Luna was found wandering near the highway with a makeshift collar. Despite her rough start, she greets every visitor with her signature tail spin and melts hearts in seconds.',
    ARRAY['playful', 'affectionate', 'energetic', 'good with kids'],
    'Luna was rescued on June 15, 2024 from the side of Highway 35. A kind driver spotted her and called our rescue line. After 3 months of foster care, she is ready for her forever home.',
    '[{"name": "Rabies", "date": "Jul 2024"}, {"name": "DHPP", "date": "Jul 2024"}, {"name": "Bordetella", "date": "Aug 2024"}]'::jsonb,
    'Fully vaccinated, spayed, and microchipped. Excellent health.',
    ARRAY['https://images.unsplash.com/photo-1612940960267-26e9843ea1e8?w=800&q=80', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80']
  ),
  (
    'Mochi', 'cat', 'Domestic Shorthair', '1 year', 'small', 'male', 'available',
    'Mochi came to us as a tiny kitten abandoned in a cardboard box. He has blossomed into the most curious, chatty little soul who will follow you from room to room.',
    ARRAY['curious', 'vocal', 'indoor', 'playful'],
    'Found as a newborn kitten in September 2023, Mochi was bottle-fed and raised by our dedicated volunteer team.',
    '[{"name": "FVRCP", "date": "Oct 2023"}, {"name": "Rabies", "date": "Jan 2024"}]'::jsonb,
    'Neutered, vaccinated, and microchipped. Indoor cat. Gets along with other cats.',
    ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80', 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=80']
  ),
  (
    'Bruno', 'dog', 'French Bulldog', '4 years', 'small', 'male', 'available',
    'Bruno was surrendered when his family relocated internationally. He is fully house-trained, knows six commands, and will steal your pillow every single night.',
    ARRAY['calm', 'trained', 'loyal', 'couch-potato'],
    'Bruno was surrendered in November 2024. Despite the change, he adapted quickly and is in perfect health.',
    '[{"name": "Rabies", "date": "Sep 2024"}, {"name": "DHPP", "date": "Sep 2024"}]'::jsonb,
    'Neutered, vaccinated, microchipped. Special needs: mild breathing sensitivity (normal for the breed).',
    ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80']
  ),
  (
    'Cleo', 'cat', 'Siamese Mix', '3 years', 'medium', 'female', 'available',
    'Cleo is an elegant, independent soul with a loving side she only shares with those who earn her trust. She loves sunny spots and watching birds through the window.',
    ARRAY['elegant', 'loving', 'independent', 'calm'],
    'Cleo was surrendered when her owner moved to a pet-free apartment. She misses her home but is adapting beautifully in foster care.',
    '[{"name": "FVRCP", "date": "Mar 2024"}, {"name": "Rabies", "date": "Mar 2024"}]'::jsonb,
    'Spayed, vaccinated, and microchipped. Prefers to be the only cat.',
    ARRAY['https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=80']
  );
