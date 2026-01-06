
-- 1. VACCINES CATALOG (Global or Per-Clinic? For simplicity global but linked to clinic for customization if needed, 
-- but let's make it clinic-specific so they can manage their own inventory/names)

CREATE TABLE vaccines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- 'Canine', 'Feline', etc.
  default_interval_days INT DEFAULT 365, -- 1 año por defecto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENT VACCINATIONS (Records)
CREATE TABLE patient_vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL, -- Guardamos el nombre snapshot por si borran del catálogo
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_dose_date DATE,
  lot_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- RLS POLICIES

ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vaccinations ENABLE ROW LEVEL SECURITY;

-- Vaccines Policies
CREATE POLICY "View clinic vaccines" ON vaccines
  FOR ALL USING (clinic_id = get_my_clinic_id());

-- Patient Vaccinations Policies
CREATE POLICY "View clinic vaccinations" ON patient_vaccinations
  FOR ALL USING (clinic_id = get_my_clinic_id());

-- Seed some default vaccines for the demo (assuming we can get a clinic_id, or user adds them)
-- This part acts as logic to be run manually or via app seed since we don't know the clinic_id here statically without context.
