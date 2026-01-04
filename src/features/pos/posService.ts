import { supabase } from "@/lib/supabase"
import { CartState, PaymentMethods } from "./types"

export const posService = {
    /**
     * Pre-calculates totals without saving to DB.
     * Handles tax logic and currency conversion if needed.
     */
    calculateCart: (items: any[]): CartState['summary'] => {
        let subtotal = 0
        let taxes = 0

        items.forEach(item => {
            const lineTotal = item.quantity * item.unit_price
            subtotal += lineTotal
            if (item.product.tax_rate) {
                taxes += lineTotal * item.product.tax_rate
            }
        })

        return {
            subtotal,
            taxes,
            total: subtotal + taxes
        }
    },

    /**
     * Commits the sale to the Database.
     * Transactional logic: 
     * 1. Create Sale Header
     * 2. Create Sale Items
     * 3. Create Payments
     * (Inventory deduction is handled by DB Triggers or separate InventoryService call)
     */
    processCheckout: async (cart: CartState, payments: PaymentMethods, userId: string) => {
        // 1. Insert Header
        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert({
                client_id: cart.client_id,
                patient_id: cart.patient_id,
                user_id: userId,
                subtotal: cart.summary.subtotal,
                tax_amount: cart.summary.taxes,
                total: cart.summary.total,
                status: 'completed'
            })
            .select()
            .single()

        if (saleError) throw saleError

        // 2. Insert Items
        const itemsToInsert = cart.items.map(item => ({
            clinic_id: saleData.clinic_id, // Auto-filled by DB usually, but good to have
            sale_id: saleData.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price
        }))

        const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(itemsToInsert)

        if (itemsError) throw itemsError

        // 3. Insert Payments (Normalize structure)
        const paymentRecords = []
        if (payments.cash_mxn > 0) paymentRecords.push({ sale_id: saleData.id, method: 'cash', currency: 'MXN', amount_original: payments.cash_mxn })
        if (payments.cash_usd > 0) paymentRecords.push({ sale_id: saleData.id, method: 'cash', currency: 'USD', amount_original: payments.cash_usd, exchange_rate: 18.50 }) // TODO: Get global rate
        if (payments.card > 0) paymentRecords.push({ sale_id: saleData.id, method: 'card', currency: 'MXN', amount_original: payments.card })

        if (paymentRecords.length > 0) {
            const { error: payError } = await supabase.from('sale_payments').insert(paymentRecords)
            if (payError) throw payError
        }

        return saleData
    }
}
