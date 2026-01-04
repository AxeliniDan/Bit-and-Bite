import { supabase } from "@/lib/supabase"

export interface InventoryBatch {
    id: string
    product_id: string
    batch_number: string
    expiry_date?: string
    current_qty: number
    cost_per_unit: number
}

export const inventoryService = {
    /**
     * Get all batches for a product, ordered by expiry (FIFO logic).
     */
    getBatchesForProduct: async (productId: string) => {
        const { data, error } = await supabase
            .from('inventory_batches')
            .select('*')
            .eq('product_id', productId)
            .gt('current_qty', 0)
            .order('expiry_date', { ascending: true }) // FIFO: Oldest first

        if (error) throw error
        return data as InventoryBatch[]
    },

    /**
     * Registers a new stock movement (Purchase/In).
     * Creates a new batch.
     */
    registerPurchase: async (productId: string, qty: number, cost: number, expiry?: string, batchCode?: string) => {
        // 1. Create Batch
        const { data: batch, error } = await supabase
            .from('inventory_batches')
            .insert({
                product_id: productId,
                initial_qty: qty,
                current_qty: qty,
                cost_per_unit: cost,
                expiry_date: expiry,
                batch_number: batchCode
            })
            .select()
            .single()

        if (error) throw error

        // 2. Log Movement
        await supabase.from('stock_movements').insert({
            product_id: productId,
            batch_id: batch.id,
            type: 'IN_PURCHASE',
            quantity_change: qty
        })

        return batch
    }
}
