import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/useTenant'

export function useDemoData() {
    const [isLoading, setIsLoading] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const { tenant } = useTenant()
    const queryClient = useQueryClient()

    const seedData = async () => {
        if (!tenant?.id) return

        try {
            setIsLoading(true)
            const { error } = await supabase.rpc('seed_demo_data', {
                target_clinic_id: tenant.id
            })

            if (error) throw error

            // Invalidate all queries to refresh the UI
            await queryClient.invalidateQueries()
            window.location.reload() // Hard refresh to ensure everything (inventory, calendar) is sync

        } catch (error) {
            console.error('Error seeding demo data:', error)
            alert('Error al cargar datos de prueba. Intenta de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    const clearData = async () => {
        if (!tenant?.id) return

        if (!confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsto borrará TODA la información de pacientes, citas, ventas e inventario de esta clínica.\n\nEsta acción NO se puede deshacer.")) return

        try {
            setIsClearing(true)
            const { error } = await supabase.rpc('clear_demo_data', {
                target_clinic_id: tenant.id
            })

            if (error) throw error

            await queryClient.invalidateQueries()
            window.location.reload()

        } catch (error) {
            console.error('Error clearing demo data:', error)
            alert('Error al eliminar datos.')
        } finally {
            setIsClearing(false)
        }
    }

    return {
        seedData,
        clearData,
        isLoading,
        isClearing
    }
}
