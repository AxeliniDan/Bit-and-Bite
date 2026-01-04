-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLINICS (Tenants)
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  search_code TEXT UNIQUE NOT NULL, -- Para invitar a otros
  subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'trial')) DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES (Users linking Auth to Clinics)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'vet', 'assistant')) DEFAULT 'vet',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PATIENTS
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  client_name TEXT NOT NULL, -- Desnormalizado para búsquedas rápidas
  client_phone TEXT,
  birth_date DATE,
  medical_alerts TEXT[], -- Array de strings: ['AGRESIVO', 'DIABETICO']
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES profiles(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'checked_in', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) SETUP

-- Habilitar RLS en todas las tablas
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Función Helper para obtener el clinic_id del usuario actual
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- POLICIES

-- Profiles: Users can view their own profile and profiles in their clinic
CREATE POLICY "View own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "View clinic members" ON profiles
  FOR SELECT USING (clinic_id = get_my_clinic_id());

-- Clinics: Users can view their own clinic
CREATE POLICY "View own clinic" ON clinics
  FOR SELECT USING (id = get_my_clinic_id());

-- Patients: Users can only see patients in their clinic
CREATE POLICY "View clinic patients" ON patients
  FOR ALL USING (clinic_id = get_my_clinic_id());

-- Appointments: Users can only see appointments in their clinic
CREATE POLICY "View clinic appointments" ON appointments
  FOR ALL USING (clinic_id = get_my_clinic_id());

-- SIMPLE SEED (Optional for development)
-- INSERT INTO clinics (name, search_code) VALUES ('Clinica Demo', 'DEMO123');
