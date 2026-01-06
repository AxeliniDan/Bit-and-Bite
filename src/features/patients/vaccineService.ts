
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useTenant } from "@/context/TenantContext"

// Types
export interface VaccineRecord {
    id: string
    name: string // vaccine_name in DB
    applied_date: string
    next_dose_date: string
    lot_number: string
    notes?: string
}

export interface CatalogVaccine {
    id: string
    name: string
    default_interval_days: number
}

// Hooks

export function useVaccines(patientId: string) {
    const { tenant } = useTenant()

    return useQuery({
        queryKey: ['vaccines', patientId],
        enabled: !!patientId && !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('patient_vaccinations')
                .select('*')
                .eq('patient_id', patientId)
                .order('applied_date', { ascending: false })

            if (error) throw error

            // Map DB fields to UI friendly names if needed
            return data.map((item: any) => ({
                id: item.id,
                name: item.vaccine_name,
                applied_date: item.applied_date,
                next_dose_date: item.next_dose_date,
                lot_number: item.lot_number
            })) as VaccineRecord[]
        }
    })
}

export function useAddVaccine() {
    const queryClient = useQueryClient()
    const { tenant } = useTenant()

    return useMutation({
        mutationFn: async (data: { patientId: string, name: string, date: string, nextDate: string, lot: string }) => {
            if (!tenant?.id) throw new Error("No Tenant ID")

            const { data: newRecord, error } = await supabase
                .from('patient_vaccinations')
                .insert({
                    clinic_id: tenant.id,
                    patient_id: data.patientId,
                    vaccine_name: data.name,
                    applied_date: data.date,
                    next_dose_date: data.nextDate,
                    lot_number: data.lot
                })
                .select()
                .single()

            if (error) throw error
            return newRecord
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vaccines', variables.patientId] })
        }
    })
}
