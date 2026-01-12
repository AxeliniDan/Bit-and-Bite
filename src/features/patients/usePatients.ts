import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useTenant } from "@/context/useTenant"

export function usePatients() {
    const { tenant } = useTenant()

    return useQuery({
        queryKey: ['patients', tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('clinic_id', tenant!.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        }
    })
}

export function usePatient(id: string) {
    return useQuery({
        queryKey: ['patient', id],
        enabled: !!id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        }
    })
}

export function useUpdatePatient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { id: string;[key: string]: unknown }) => {
            const { data: updated, error } = await supabase
                .from('patients')
                .update(data)
                .eq('id', data.id)
                .select()
                .single()

            if (error) throw error
            return updated
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patient', data.id] })
            queryClient.invalidateQueries({ queryKey: ['patients'] })
        }
    })
}

export function useCreatePatient() {
    const queryClient = useQueryClient()
    const { tenant } = useTenant()

    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            if (!tenant?.id) throw new Error("No clinic selected")

            const { data: newPatient, error } = await supabase
                .from('patients')
                .insert({
                    ...data,
                    clinic_id: tenant.id
                })
                .select()
                .single()

            if (error) throw error
            return newPatient
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
            alert(`✅ Expediente creado exitosamente`)
        }
    })
}

