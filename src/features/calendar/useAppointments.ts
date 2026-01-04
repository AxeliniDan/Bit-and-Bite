import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Database } from "@/types/database.types"
import { format } from "date-fns"

type NewAppointment = Database['public']['Tables']['appointments']['Insert']

export function useAppointments(currentDate: Date) {
    return useQuery({
        queryKey: ['appointments', format(currentDate, 'yyyy-MM-dd')],
        queryFn: async () => {
            // DEMO MODE: Return fake data
            const baseDate = format(currentDate, 'yyyy-MM-dd')

            return [
                {
                    id: '1',
                    clinic_id: 'mock-clinic-id',
                    patient_id: 'p1',
                    vet_id: 'v1',
                    start_time: `${baseDate}T09:00:00`,
                    end_time: `${baseDate}T10:00:00`,
                    status: 'pending',
                    reason: 'Vacunación Anual',
                    created_at: new Date().toISOString(),
                    patients: { name: 'Max (Golden Retriever)' }
                },
                {
                    id: '2',
                    clinic_id: 'mock-clinic-id',
                    patient_id: 'p2',
                    vet_id: 'v1',
                    start_time: `${baseDate}T11:00:00`,
                    end_time: `${baseDate}T11:30:00`,
                    status: 'checked_in',
                    reason: 'Revisión General',
                    created_at: new Date().toISOString(),
                    patients: { name: 'Luna (Gato)' }
                },
                {
                    id: '3',
                    clinic_id: 'mock-clinic-id',
                    patient_id: 'p3',
                    vet_id: 'v1',
                    start_time: `${baseDate}T15:00:00`,
                    end_time: `${baseDate}T16:00:00`,
                    status: 'completed',
                    reason: 'Cirugía Menor',
                    created_at: new Date().toISOString(),
                    patients: { name: 'Rocky (Bulldog)' }
                }
            ] as any[] // Force type casting for demo
        }
    })
}

export function useCreateAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newAppointment: NewAppointment) => {
            // DEMO MODE: Fake delay and success
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log("DEMO MODE: Appointment created", newAppointment)
            return newAppointment
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            alert("Cita creada (Simulación Demo)")
        }
    })
}
