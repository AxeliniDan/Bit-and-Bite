import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"


// type Patient = Database['public']['Tables']['patients']['Row']

export function usePatients() {
    return useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            // DEMO MODE: Fake data
            await new Promise(resolve => setTimeout(resolve, 800)) // Fake latency

            return [
                {
                    id: 'p1',
                    name: 'Max',
                    species: 'Canino',
                    breed: 'Golden Retriever',
                    client_name: 'Juan Pérez',
                    client_phone: '555-123-4567',
                    avatar_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2020-05-15',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'p2',
                    name: 'Luna',
                    species: 'Felino',
                    breed: 'Siamés',
                    client_name: 'Ana Gómez',
                    client_phone: '555-987-6543',
                    avatar_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2021-08-20',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'p3',
                    name: 'Rocky',
                    species: 'Canino',
                    breed: 'Bulldog Francés',
                    client_name: 'Carlos Ruiz',
                    client_phone: '555-456-7890',
                    avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2019-11-10',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'p4',
                    name: 'Coco',
                    species: 'Ave',
                    breed: 'Ninfa',
                    client_name: 'Maria Diaz',
                    client_phone: '555-111-2222',
                    avatar_url: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd1?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2023-01-01',
                    created_at: new Date().toISOString()
                }
            ] as any[]
        }
    })
}

export function usePatient(id: string) {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: async () => {
            // DEMO MODE: Fake fetch
            await new Promise(resolve => setTimeout(resolve, 500))

            // Mock data (extended)
            const mockPatients: any = {
                'p1': {
                    id: 'p1',
                    name: 'Max',
                    species: 'Canino',
                    breed: 'Golden Retriever',
                    sex: 'Macho',
                    weight: '28 kg',
                    age: '3 años 5 meses',
                    client_name: 'Juan Pérez',
                    client_phone: '555-123-4567',
                    avatar_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2020-05-15',
                    medical_alerts: ['Alergia a la Penicilina', 'Displasia de cadera leve'],
                    created_at: new Date().toISOString()
                },
                'p2': {
                    id: 'p2',
                    name: 'Luna',
                    species: 'Felino',
                    breed: 'Siamés',
                    sex: 'Hembra',
                    weight: '4.2 kg',
                    age: '2 años',
                    client_name: 'Ana Gómez',
                    client_phone: '555-987-6543',
                    avatar_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2021-08-20',
                    medical_alerts: [],
                    created_at: new Date().toISOString()
                },
                'p3': {
                    id: 'p3',
                    name: 'Rocky',
                    species: 'Canino',
                    breed: 'Bulldog Francés',
                    sex: 'Macho',
                    weight: '12 kg',
                    age: '4 años',
                    client_name: 'Carlos Ruiz',
                    client_phone: '555-456-7890',
                    avatar_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300&auto=format&fit=crop',
                    birth_date: '2019-11-10',
                    medical_alerts: ['Sensibilidad digestiva'],
                    created_at: new Date().toISOString()
                },
            }

            return mockPatients[id] || mockPatients['p1'] // Return p1 fallback
        }
    })
}

export function useUpdatePatient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: any) => {
            // DEMO MODE: Fake update
            await new Promise(resolve => setTimeout(resolve, 800))
            console.log("Patient updated:", data)
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patient', data.id] })
            alert("✅ Paciente actualizado (Modo Demo)")
        }
    })
}

export function useCreatePatient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: any) => {
            // DEMO MODE: Fake create
            await new Promise(resolve => setTimeout(resolve, 800))
            console.log("Patient created:", data)
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
            alert(`✅ Expediente creado para ${data.name || 'Mascota'}`)
        }
    })
}
