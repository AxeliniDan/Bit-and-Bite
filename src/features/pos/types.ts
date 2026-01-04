export interface Product {
    id: string
    clinic_id: string
    name: string
    sku?: string
    price_base: number
    currency: 'MXN' | 'USD'
    tax_rate: number // 0.16
    track_inventory: boolean
    min_stock_alert: number
    type: 'product' | 'service' | 'bundle'
}

export interface SaleItem {
    product: Product
    quantity: number
    unit_price: number // At moment of sale
    discount?: number
    total: number
}

export interface PaymentMethods {
    cash_mxn: number
    cash_usd: number
    card: number
    transfer: number
    other: number
}

export interface CartState {
    items: SaleItem[]
    client_id?: string
    patient_id?: string
    summary: {
        subtotal: number
        taxes: number
        total: number
    }
}
