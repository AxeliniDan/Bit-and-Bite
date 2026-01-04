import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Trash2, CreditCard, Banknote, RefreshCcw, FileText, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

// Mock Data
const MOCK_PRODUCTS = [
    { id: "1", name: "Vacuna Rabia", price: 350.00, sku: "VAC-001" },
    { id: "2", name: "Consulta General", price: 500.00, sku: "SRV-001" },
    { id: "3", name: "Croquetas Premium 1kg", price: 120.00, sku: "FD-001" },
    { id: "4", name: "Pipeta Antipulgas", price: 280.00, sku: "MED-002" },
]

export function PosPage() {
    const navigate = useNavigate()
    const [cart, setCart] = useState<any[]>([])
    const [search, setSearch] = useState("")

    // Modals State
    const [showPayment, setShowPayment] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
    const [cashReceived, setCashReceived] = useState("")
    const [showCut, setShowCut] = useState(false)

    // Handlers
    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id)
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p)
            }
            return [...prev, { ...product, qty: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(p => p.id !== id))
    }

    const clearCart = () => {
        if (cart.length > 0 && !confirm("¿Estás seguro de limpiar la venta actual?")) return
        setCart([])
    }

    const handleInitiatePayment = (method: 'cash' | 'card') => {
        if (cart.length === 0) return alert("El carrito está vacío")
        setPaymentMethod(method)
        setCashReceived("")
        setShowPayment(true)
    }

    const processPayment = () => {
        if (paymentMethod === 'cash') {
            if (parseFloat(cashReceived) < totalWithTax) return alert("El monto recibido es insuficiente")
        }

        // Simulating Success
        alert(`✅ Venta Exitosa\n\nMétodo: ${paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}\nTotal: $${totalWithTax.toFixed(2)}\n\n(Imprimiendo Ticket...)`)
        setCart([])
        setShowPayment(false)
    }

    const handleCashCut = () => {
        setShowCut(true)
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    const totalWithTax = total * 1.16
    const change = parseFloat(cashReceived) - totalWithTax

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">🛒 Terminal de Venta</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                        <Plus className="mr-2 h-4 w-4" /> Agregar Productos
                    </Button>
                    <div className="w-px bg-gray-300 mx-2" />
                    <Button variant="outline" size="sm" onClick={clearCart}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Nueva Venta
                    </Button>
                    <Button variant="default" size="sm" onClick={handleCashCut}>
                        <FileText className="mr-2 h-4 w-4" /> Corte de Caja
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">

                {/* LEFT: Product Catalog */}
                <Card className="col-span-2 flex flex-col p-4 gap-4 h-full">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar producto por nombre o SKU..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto content-start">
                        {MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
                            <div
                                key={product.id}
                                className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col justify-between h-32 hover:border-blue-300 hover:shadow-md"
                                onClick={() => addToCart(product)}
                            >
                                <div>
                                    <div className="font-bold text-sm truncate">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                                </div>
                                <div className="text-green-600 font-bold text-lg">${product.price.toFixed(2)}</div>
                            </div>
                        ))}
                        {/* Quick Add Placeholder */}
                        <div
                            className="border-2 border-dashed rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col items-center justify-center h-32 text-gray-400 hover:text-gray-600 hover:border-gray-400"
                            onClick={() => navigate('/inventory')}
                        >
                            <Plus className="h-8 w-8 mb-2" />
                            <span className="text-xs font-semibold">Nuevo Producto</span>
                        </div>
                    </div>
                </Card>

                {/* RIGHT: Cart & Checkout */}
                <Card className="flex flex-col h-full bg-slate-50 border-l-2">
                    <div className="p-4 border-b bg-white">
                        <h2 className="font-semibold text-lg">Ticket Actual</h2>
                        <div className="text-xs text-muted-foreground">Cliente: Público General</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 && (
                            <div className="text-center text-muted-foreground py-10 opacity-50 flex flex-col items-center">
                                <Search className="h-8 w-8 mb-2" />
                                Carrito Vacío
                            </div>
                        )}
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm animate-in fade-in slide-in-from-left-2">
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.qty} x ${item.price}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-bold">${(item.price * item.qty).toFixed(2)}</div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-white border-t mt-auto space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>IVA (16%)</span><span>${(total * 0.16).toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                                <span>Total</span>
                                <span>${totalWithTax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button className="w-full bg-green-600 hover:bg-green-700 gap-2 h-12 text-lg" onClick={() => handleInitiatePayment('cash')}>
                                <Banknote className="h-5 w-5" /> Efectivo
                            </Button>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2 h-12 text-lg" onClick={() => handleInitiatePayment('card')}>
                                <CreditCard className="h-5 w-5" /> Tarjeta
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* PAYMENT DIALOG */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Procesar Pago - {paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}</DialogTitle>
                        <DialogDescription>Total a Pagar: <span className="font-bold text-lg text-black">${totalWithTax.toFixed(2)}</span></DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        {paymentMethod === 'cash' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Monto Recibido</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <Input
                                            type="number"
                                            className="pl-7 text-lg font-bold"
                                            value={cashReceived}
                                            onChange={e => setCashReceived(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
                                    <span className="font-medium">Cambio:</span>
                                    <span className={`font-bold text-xl ${change < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        ${change > 0 ? change.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 space-y-4">
                                <div className="animate-pulse flex justify-center">
                                    <RefreshCcw className="h-12 w-12 text-blue-500 animate-spin" />
                                </div>
                                <p>Esperando respuesta de la terminal...</p>
                                <p className="text-xs text-muted-foreground">(En modo desarrollo esto se aprueba automáticamente)</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowPayment(false)}>Cancelar</Button>
                        <Button
                            onClick={processPayment}
                            disabled={paymentMethod === 'cash' && parseFloat(cashReceived) < totalWithTax}
                            className={paymentMethod === 'cash' && parseFloat(cashReceived) >= totalWithTax ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {paymentMethod === 'cash' ? 'Confirmar Cobro' : 'Simular Aprobación'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CASH CUT DIALOG */}
            <Dialog open={showCut} onOpenChange={setShowCut}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Corte de Caja</DialogTitle>
                        <DialogDescription>{new Date().toLocaleDateString()}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-green-50">
                                <div className="text-xs text-green-700 uppercase font-bold">Ventas Efectivo</div>
                                <div className="text-2xl font-bold text-green-900">$1,250.00</div>
                                <div className="text-xs text-green-600/80">14 transacciones</div>
                            </Card>
                            <Card className="p-4 bg-blue-50">
                                <div className="text-xs text-blue-700 uppercase font-bold">Ventas Tarjeta</div>
                                <div className="text-2xl font-bold text-blue-900">$3,420.00</div>
                                <div className="text-xs text-blue-600/80">8 transacciones</div>
                            </Card>
                        </div>
                        <div className="p-4 border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Total en Caja (Esperado)</span>
                                <span className="font-bold text-xl">$4,670.00</span>
                            </div>
                            <Button className="w-full" onClick={() => { alert("Corte guardado e impreso"); setShowCut(false) }}>
                                Imprimir Reporte Z
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
