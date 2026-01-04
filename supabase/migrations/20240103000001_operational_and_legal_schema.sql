-- MIGRATION: Phase 3 - Operational, Legal, and Loyalty Modules
-- DESCRIPTION: Schema for Hospital, Hotel, Grooming, Audit Logs, and Subscriptions.

-- ==============================================================================
-- 1. PHYSICAL FACILITIES (Common for Hospital & Hotel)
-- ==============================================================================
create table public.facilities (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    
    name text not null, -- "Jaula 1", "Suite Presidencial"
    type text check (type in ('cage', 'room', 'run', 'aquarium')),
    area text check (area in ('hospital', 'hotel', 'isolation')), -- Where is it located?
    
    status text check (status in ('available', 'occupied', 'dirty', 'maintenance')) default 'available',
    
    created_at timestamptz default now()
);

-- ==============================================================================
-- 2. HOSPITALIZATION MODULE
-- ==============================================================================

-- 2.1 ADMISSIONS
create table public.hospital_admissions (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    patient_id uuid references public.patients(id) not null,
    
    facility_id uuid references public.facilities(id), -- Which cage?
    
    admitted_at timestamptz default now(),
    discharged_at timestamptz,
    
    initial_diagnosis text,
    admission_reason text,
    
    status text check (status in ('active', 'discharged', 'transferred', 'deceased')) default 'active',
    
    created_at timestamptz default now()
);

-- 2.2 FLOW SHEET / KARDEX (The Chart)
create table public.medical_events (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    admission_id uuid references public.hospital_admissions(id) not null,
    performing_user_id uuid references auth.users(id), -- Doctor/Nurse
    
    event_type text check (event_type in ('vital_sign', 'medication', 'fluid_therapy', 'feeding', 'note', 'procedure')),
    
    -- Flexible data storage for different event types
    -- Vital Signs: {"temp": 38.5, "hr": 120, "rr": 30, "mm": "pink"}
    -- Medication: {"drug": "Meloxicam", "dose": "2mg", "route": "IV"}
    data jsonb not null default '{}'::jsonb, 
    
    performed_at timestamptz default now(), -- Actual time (might differ from created_at if entered later)
    created_at timestamptz default now()
);

-- ==============================================================================
-- 3. HOTEL / BOARDING MODULE
-- ==============================================================================

create table public.hotel_bookings (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    patient_id uuid references public.patients(id) not null,
    facility_id uuid references public.facilities(id), -- Reserved cage
    
    check_in_date date not null,
    check_out_date date not null,
    
    actual_check_in timestamptz,
    actual_check_out timestamptz,
    
    feeding_instructions text,
    belongings text, -- "Trae su cobija y juguete kong"
    
    status text check (status in ('reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show')) default 'reserved',
    
    created_at timestamptz default now()
);

-- ==============================================================================
-- 4. GROOMING / ESTHETIC MODULE (Kanban)
-- ==============================================================================

create table public.grooming_sessions (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    appointment_id uuid references public.appointments(id), -- Optional link
    patient_id uuid references public.patients(id) not null,
    groomer_id uuid references auth.users(id),
    
    service_type text, -- "Baño", "Corte", "Deslanado"
    
    -- KANBAN STAGES
    current_stage text check (current_stage in ('waiting', 'bathing', 'drying', 'haircut', 'ready', 'delivered')) default 'waiting',
    
    started_at timestamptz,
    finished_at timestamptz,
    
    notes text,
    created_at timestamptz default now()
);

-- ==============================================================================
-- 5. LEGAL & SECURITY
-- ==============================================================================

-- 5.1 AUDIT LOGS (Critical for "Controlled Drugs" and Security)
create table public.audit_logs (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    user_id uuid references auth.users(id),
    
    action text not null, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN'
    table_name text not null, -- 'inventory_batches', 'medical_records'
    record_id uuid,
    
    changes jsonb, -- Stack diff: {"old": {price: 10}, "new": {price: 50}}
    ip_address text,
    user_agent text,
    
    created_at timestamptz default now()
);

-- 5.2 CONSENT FORMS
create table public.consent_templates (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    name text not null, -- "Autorización Anestesia"
    content_html text not null,
    is_active boolean default true
);

create table public.signed_consents (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    patient_id uuid references public.patients(id) not null,
    
    template_snapshot text not null, -- Copy of text at moment of signing
    signature_base64 text, -- Or URL to blob storage
    signer_name text,
    
    signed_at timestamptz default now()
);

-- ==============================================================================
-- 6. LOYALTY (SUBSCRIPTIONS)
-- ==============================================================================

create table public.subscription_plans (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    name text not null, -- "Plan Cachorro Gold"
    price_monthly numeric(10,2) not null,
    billing_period text default 'monthly', -- monthly, yearly
    
    features jsonb, -- {"free_vaccines": 3, "discount_products": 0.10}
    is_active boolean default true
);

create table public.patient_subscriptions (
    id uuid not null default uuid_generate_v4() primary key,
    clinic_id uuid references public.clinics(id) not null,
    patient_id uuid references public.patients(id) not null,
    plan_id uuid references public.subscription_plans(id) not null,
    
    start_date date not null,
    end_date date, -- Null if auto-renew
    next_billing_date date,
    
    status text check (status in ('active', 'paused', 'cancelled', 'payment_failed')) default 'active',
    
    created_at timestamptz default now()
);

-- RLS POLICIES (Simplified for Output)
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE grooming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_subscriptions ENABLE ROW LEVEL SECURITY;
