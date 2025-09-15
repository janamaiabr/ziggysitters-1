-- Create enum types for the platform
CREATE TYPE public.user_role AS ENUM ('pet_owner', 'pet_sitter', 'both');
CREATE TYPE public.pet_species AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'other');
CREATE TYPE public.pet_size AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE public.service_type AS ENUM ('overnight_boarding', 'daycare', 'dog_walking', 'drop_in_visits', 'grooming', 'medication_admin');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table for users (both sitters and owners)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'pet_owner',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  address TEXT,
  suburb TEXT,
  city TEXT DEFAULT 'Auckland',
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'pending',
  background_check_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  response_rate INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species pet_species NOT NULL,
  breed TEXT,
  size pet_size,
  age INTEGER,
  weight DECIMAL(5, 2),
  gender TEXT,
  is_neutered BOOLEAN,
  personality_traits TEXT[],
  medical_conditions TEXT[],
  medications TEXT[],
  feeding_instructions TEXT,
  exercise_needs TEXT,
  special_care_notes TEXT,
  vaccination_status BOOLEAN DEFAULT FALSE,
  vaccination_expiry DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sitter services table
CREATE TABLE public.sitter_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  is_offered BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(8, 2),
  daily_rate DECIMAL(8, 2),
  overnight_rate DECIMAL(8, 2),
  max_pets INTEGER DEFAULT 1,
  accepted_pet_species pet_species[],
  accepted_pet_sizes pet_size[],
  has_fenced_yard BOOLEAN DEFAULT FALSE,
  allows_puppies BOOLEAN DEFAULT TRUE,
  allows_senior_pets BOOLEAN DEFAULT TRUE,
  experience_years INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(sitter_id, service_type)
);

-- Create availability calendar table
CREATE TABLE public.sitter_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(sitter_id, date)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_ids UUID[] NOT NULL,
  service_type service_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status booking_status DEFAULT 'pending',
  special_instructions TEXT,
  owner_notes TEXT,
  sitter_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_for_sitter BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, sitter_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-photos', 'profile-photos', true),
  ('pet-photos', 'pet-photos', true),
  ('verification-docs', 'verification-docs', false),
  ('message-attachments', 'message-attachments', false);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pets
CREATE POLICY "Pet owners can view their own pets" 
  ON public.pets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = pets.owner_id AND user_id = auth.uid())
  );

CREATE POLICY "Pet owners can insert their own pets" 
  ON public.pets FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = pets.owner_id AND user_id = auth.uid())
  );

CREATE POLICY "Pet owners can update their own pets" 
  ON public.pets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = pets.owner_id AND user_id = auth.uid())
  );

CREATE POLICY "Pet owners can delete their own pets" 
  ON public.pets FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = pets.owner_id AND user_id = auth.uid())
  );

-- Create RLS policies for sitter services
CREATE POLICY "Sitter services are viewable by everyone" 
  ON public.sitter_services FOR SELECT USING (true);

CREATE POLICY "Sitters can manage their own services" 
  ON public.sitter_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = sitter_services.sitter_id AND user_id = auth.uid())
  );

-- Create RLS policies for sitter availability
CREATE POLICY "Sitter availability is viewable by everyone" 
  ON public.sitter_availability FOR SELECT USING (true);

CREATE POLICY "Sitters can manage their own availability" 
  ON public.sitter_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = sitter_availability.sitter_id AND user_id = auth.uid())
  );

-- Create RLS policies for bookings
CREATE POLICY "Users can view bookings they are involved in" 
  ON public.bookings FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (id = bookings.owner_id OR id = bookings.sitter_id)
    )
  );

CREATE POLICY "Pet owners can create bookings" 
  ON public.bookings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = bookings.owner_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update bookings they are involved in" 
  ON public.bookings FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (id = bookings.owner_id OR id = bookings.sitter_id)
    )
  );

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" 
  ON public.reviews FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = reviews.reviewer_id AND user_id = auth.uid())
  );

-- Create RLS policies for messages
CREATE POLICY "Users can view messages they sent or received" 
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (id = messages.sender_id OR id = messages.recipient_id)
    )
  );

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.sender_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update messages they sent" 
  ON public.messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.sender_id AND user_id = auth.uid())
  );

-- Create RLS policies for favorites
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = favorites.owner_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own favorites" 
  ON public.favorites FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = favorites.owner_id AND user_id = auth.uid())
  );

-- Create storage policies for profile photos
CREATE POLICY "Profile photos are publicly accessible" 
  ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photos" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile photos" 
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for pet photos
CREATE POLICY "Pet photos are publicly accessible" 
  ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can upload pet photos" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for verification docs (private)
CREATE POLICY "Users can view their own verification docs" 
  ON storage.objects FOR SELECT USING (
    bucket_id = 'verification-docs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own verification docs" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'verification-docs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for message attachments (private)
CREATE POLICY "Users can view message attachments they have access to" 
  ON storage.objects FOR SELECT USING (
    bucket_id = 'message-attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload message attachments" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sitter_services_updated_at
  BEFORE UPDATE ON public.sitter_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();