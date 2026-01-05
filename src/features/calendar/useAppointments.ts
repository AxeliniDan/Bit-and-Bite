import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useTenant } from "@/context/TenantContext"
import { format } from "date-fns"

export function useAppointments(currentDate: Date) {
    const { tenant } = useTenant()

    return useQuery({
        queryKey: ['appointments', tenant?.id, format(currentDate, 'yyyy-MM-dd')],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const startOfDay = new Date(currentDate)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(currentDate)
            endOfDay.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    patients (
                        name,
                        client_name,
                        species
                    )
                `)
                .eq('clinic_id', tenant!.id)
                .gte('start_time', startOfDay.toISOString())
                .lte('start_time', endOfDay.toISOString())
                .order('start_time', { ascending: true })

            if (error) throw error
            return data
        }
    })
}

export function useCreateAppointment() {
    const queryClient = useQueryClient()
    const { tenant } = useTenant()

    return useMutation({
        mutationFn: async (newAppointment: any) => {
            if (!tenant?.id) throw new Error("No clinic selected")

            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    ...newAppointment,
                    clinic_id: tenant.id
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }
    })
}

