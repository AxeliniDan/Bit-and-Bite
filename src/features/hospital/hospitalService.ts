import { supabase } from "@/lib/supabase"

export interface HospitalAdmission {
    id: string
    patient_id: string
    facility_id: string
    status: 'active' | 'discharged'
    diagnosis: string
}

export const hospitalService = {
    /**
     * Check if a cage is available
     */
    checkAvailability: async (area: 'hospital' | 'hotel') => {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('area', area)
            .eq('status', 'available')

        if (error) throw error
        return data
    },

    /**
     * Admit a patient to a cage
     */
    admitPatient: async (patientId: string, facilityId: string, diagnosis: string) => {
        // 1. Create Admission
        const { data, error } = await supabase
            .from('hospital_admissions')
            .insert({
                patient_id: patientId,
                facility_id: facilityId,
                initial_diagnosis: diagnosis,
                status: 'active'
            })
            .select()
            .single()

        if (error) throw error

        // 2. Mark Cage as Occupied
        await supabase
            .from('facilities')
            .update({ status: 'occupied' })
            .eq('id', facilityId)

        return data
    },

    /**
     * Add an entry to the Flow Sheet (Kardex)
     */
    addKardexEntry: async (admissionId: string, userId: string, type: 'medication' | 'vital_sign', payload: Record<string, unknown>) => {
        const { error } = await supabase
            .from('medical_events')
            .insert({
                admission_id: admissionId,
                performing_user_id: userId,
                event_type: type,
                data: payload // Flexible JSON
            })

        if (error) throw error
    }
}
