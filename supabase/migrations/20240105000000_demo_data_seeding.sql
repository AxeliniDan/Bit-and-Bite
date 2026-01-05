-- MIGRATION: Demo Data Seeding
-- DESCRIPTION: Adds RPC functions to seed and clear demo data for a clinic.

-- ==============================================================================
-- 1. SEED DEMO DATA RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION seed_demo_data(target_clinic_id UUID)
RETURNS VOID AS $$
DECLARE
    cat_serv_id UUID;
    cat_prod_id UUID;
    prod_rabia_id UUID;
    prod_nexgard_id UUID;
    serv_consulta_id UUID;
    patient_firulais_id UUID;
    patient_mishifus_id UUID;
    patient_panchito_id UUID;
    vet_id UUID; -- We need a valid user ID for appointments, will pick the first one found or NULL
BEGIN
    -- 0. Get a vet ID (owner/user of the clinic)
    SELECT id INTO vet_id FROM profiles WHERE clinic_id = target_clinic_id LIMIT 1;
    
    -- 1. Create Categories
    INSERT INTO categories (clinic_id, name, type) VALUES 
        (target_clinic_id, 'Servicios Clínicos', 'service') RETURNING id INTO cat_serv_id;
    INSERT INTO categories (clinic_id, name, type) VALUES 
        (target_clinic_id, 'Farmacia y Preventivos', 'product') RETURNING id INTO cat_prod_id;

    -- 2. Create Products & Services
    -- 2.1 Service: Consulta
    INSERT INTO products (clinic_id, category_id, name, type, price_base, track_inventory) VALUES
        (target_clinic_id, cat_serv_id, 'Consulta General', 'service', 500.00, false)
        RETURNING id INTO serv_consulta_id;
        
    -- 2.2 Product: Vacuna Rabia
    INSERT INTO products (clinic_id, category_id, name, type, price_base, track_inventory, min_stock_alert) VALUES
        (target_clinic_id, cat_prod_id, 'Vacuna Rabia', 'product', 350.00, true, 10)
        RETURNING id INTO prod_rabia_id;
        
    -- 2.3 Product: NexGard Spectra
    INSERT INTO products (clinic_id, category_id, name, type, price_base, track_inventory, min_stock_alert) VALUES
        (target_clinic_id, cat_prod_id, 'NexGard Spectra 15kg', 'product', 600.00, true, 5)
        RETURNING id INTO prod_nexgard_id;

    -- 3. Inventory Batches (Stock)
    -- Rabia (Stock 50)
    INSERT INTO inventory_batches (clinic_id, product_id, initial_qty, current_qty, cost_per_unit, expiry_date, batch_number) VALUES
        (target_clinic_id, prod_rabia_id, 50, 50, 150.00, NOW() + INTERVAL '1 year', 'BATCH-RB-001');
        
    -- NexGard (Stock 20)
    INSERT INTO inventory_batches (clinic_id, product_id, initial_qty, current_qty, cost_per_unit, expiry_date, batch_number) VALUES
        (target_clinic_id, prod_nexgard_id, 20, 20, 400.00, NOW() + INTERVAL '2 years', 'BATCH-NX-001');

    -- 4. Patients (and implicit Clients)
    -- 4.1 Firulais (Juan Pérez)
    INSERT INTO patients (clinic_id, name, species, breed, client_name, birth_date, medical_alerts) VALUES
        (target_clinic_id, 'Firulais', 'Perro', 'Golden Retriever', 'Juan Pérez', NOW() - INTERVAL '3 years', ARRAY['Paciente muy noble'])
        RETURNING id INTO patient_firulais_id;

    -- 4.2 Mishifus (María González)
    INSERT INTO patients (clinic_id, name, species, breed, client_name, birth_date, medical_alerts) VALUES
        (target_clinic_id, 'Mishifus', 'Gato', 'Persa', 'María González', NOW() - INTERVAL '5 years', ARRAY['ALÉRGICO A PENICILINA'])
        RETURNING id INTO patient_mishifus_id;

    -- 4.3 Panchito (Pedrito)
    INSERT INTO patients (clinic_id, name, species, breed, client_name, birth_date, medical_alerts) VALUES
        (target_clinic_id, 'Panchito', 'Roedor', 'Hamster', 'Pedrito', NOW() - INTERVAL '1 year', NULL)
        RETURNING id INTO patient_panchito_id;

    -- 5. Appointments
    -- 5.1 Past Appointment (Completed yesterday)
    INSERT INTO appointments (clinic_id, patient_id, vet_id, start_time, end_time, status, reason) VALUES
        (target_clinic_id, patient_firulais_id, vet_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 'completed', 'Consulta de Seguimiento');

    -- 5.2 Today Appointment (Pending @ 4:00 PM today)
    -- Calculation: Today at 16:00. 
    INSERT INTO appointments (clinic_id, patient_id, vet_id, start_time, end_time, status, reason) VALUES
        (target_clinic_id, patient_mishifus_id, vet_id, 
         (CURRENT_DATE + TIME '16:00:00'), 
         (CURRENT_DATE + TIME '16:30:00'), 
         'pending', 'Revisión Alergia');

    -- 5.3 Future Appointment (Confirmed tomorrow)
    INSERT INTO appointments (clinic_id, patient_id, vet_id, start_time, end_time, status, reason) VALUES
        (target_clinic_id, patient_panchito_id, vet_id, 
         (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00'), 
         (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00'), 
         'pending', 'Recorte de Dientes');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. CLEAR DEMO DATA RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION clear_demo_data(target_clinic_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete in order of dependency
    
    -- 1. Appointments & Medical Records
    DELETE FROM appointments WHERE clinic_id = target_clinic_id;
    DELETE FROM hospital_admissions WHERE clinic_id = target_clinic_id;
    -- (Add other medical tables if they exist and were populated, e.g. medical_events)
    
    -- 2. Patients (Cascade should handle related records mostly, but explicit is safer)
    DELETE FROM patients WHERE clinic_id = target_clinic_id;
    
    -- 3. Inventory & Sales
    DELETE FROM stock_movements WHERE clinic_id = target_clinic_id;
    DELETE FROM inventory_batches WHERE clinic_id = target_clinic_id;
    DELETE FROM sale_items WHERE clinic_id = target_clinic_id;
    DELETE FROM sales WHERE clinic_id = target_clinic_id;
    
    -- 4. Products & Categories
    DELETE FROM products WHERE clinic_id = target_clinic_id;
    DELETE FROM categories WHERE clinic_id = target_clinic_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
