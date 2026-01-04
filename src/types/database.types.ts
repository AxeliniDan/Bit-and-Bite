export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clinics: {
                Row: {
                    id: string
                    name: string
                    search_code: string
                    subscription_status: 'active' | 'past_due' | 'trial'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    search_code: string
                    subscription_status?: 'active' | 'past_due' | 'trial'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    search_code?: string
                    subscription_status?: 'active' | 'past_due' | 'trial'
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    clinic_id: string
                    role: 'owner' | 'vet' | 'assistant'
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    clinic_id: string
                    role?: 'owner' | 'vet' | 'assistant'
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    clinic_id?: string
                    role?: 'owner' | 'vet' | 'assistant'
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            patients: {
                Row: {
                    id: string
                    clinic_id: string
                    name: string
                    species: string
                    breed: string | null
                    client_name: string
                    client_phone: string | null
                    birth_date: string | null
                    medical_alerts: string[] | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    clinic_id: string
                    name: string
                    species: string
                    breed?: string | null
                    client_name: string
                    client_phone?: string | null
                    birth_date?: string | null
                    medical_alerts?: string[] | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    clinic_id?: string
                    name?: string
                    species?: string
                    breed?: string | null
                    client_name?: string
                    client_phone?: string | null
                    birth_date?: string | null
                    medical_alerts?: string[] | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    clinic_id: string
                    patient_id: string | null
                    vet_id: string | null
                    start_time: string
                    end_time: string
                    status: 'pending' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
                    reason: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    clinic_id: string
                    patient_id?: string | null
                    vet_id?: string | null
                    start_time: string
                    end_time: string
                    status?: 'pending' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
                    reason?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    clinic_id?: string
                    patient_id?: string | null
                    vet_id?: string | null
                    start_time?: string
                    end_time?: string
                    status?: 'pending' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
                    reason?: string | null
                    created_at?: string
                }
            }
        }
    }
}
