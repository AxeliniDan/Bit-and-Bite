import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, AlertTriangle, PackagePlus, Calendar } from "lucide-react"

// Mock Batches
const INITIAL_BATCHES = [
    { id: "B1", product: "Vacuna Rabia", batch: "BATCH-X99", expiry: "2024-05-10", qty: 5, status: "critical" },
    { id: "B2", product: "Vacuna Rabia", batch: "BATCH-Y22", expiry: "2024-12-01", qty: 50, status: "good" },
    { id: "B3", product: "Croquetas Premium", batch: "L-2023", expiry: "2024-08-15", qty: 12, status: "ok" },
]

export function InventoryPage() {
    const [batches, setBatches] = useState(INITIAL_BATCHES)
    const [showAdd, setShowAdd] = useState(false)
    const [newBatch, setNewBatch] = useState({ product: "", batch: "", expiry: "", qty: "" })

    const handleAddStock = () => {
        if (!newBatch.product || !newBatch.qty) return alert("Faltan datos")

        setBatches(prev => [
            ...prev,
            {
                id: `B${Date.now()}`,
                product: newBatch.product,
                batch: newBatch.batch || "GENERATED",
                expiry: newBatch.expiry || "2025-01-01",
                qty: parseInt(newBatch.qty),
                status: 'good'
            }
        ])
        setShowAdd(false)
        setNewBatch({ product: "", batch: "", expiry: "", qty: "" })
        alert("✅ Entrada de mercancía registrada correctamente")
    }

    const handleAdjust = (id: string, currentQty: number) => {
        const newVal = prompt("Nuevo stock real:", currentQty.toString())
        if (newVal === null) return
        const num = parseInt(newVal)
        if (isNaN(num)) return alert("Número inválido")

        setBatches(prev => prev.map(b => b.id === id ? { ...b, qty: num } : b))
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">📦 Inventario Avanzado (PEPS/FIFO)</h1>
                    <p className="text-muted-foreground">Gestión de lotes y caducidades</p>
                </div>
                <Button className="gap-2" onClick={() => setShowAdd(true)}>
                    <PackagePlus className="h-4 w-4" /> Registrar Entrada
                </Button>
            </div>

            {/* ALERTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-50 border-red-200 p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="font-bold text-red-700">3 Lotes por Caducar</div>
                        <div className="text-xs text-red-600">Revisar inmediatamente</div>
                    </div>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200 p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                        <PackagePlus className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="font-bold text-yellow-700">5 Productos Bajos</div>
                        <div className="text-xs text-yellow-600">Reponer stock mínimo</div>
                    </div>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b flex gap-4 bg-gray-50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar lote o producto..." className="pl-8 bg-white" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Filtrar por Caducidad</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3">Lote (Batch)</th>
                                <th className="px-6 py-3">Caducidad</th>
                                <th className="px-6 py-3">Stock Actual</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {batches.map((row) => (
                                <tr key={row.id} className="bg-white hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{row.product}</td>
                                    <td className="px-6 py-4 font-mono text-gray-500">{row.batch}</td>
                                    <td className="px-6 py-4">{row.expiry}</td>
                                    <td className="px-6 py-4 font-bold">{row.qty}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'critical' ? 'bg-red-100 text-red-700' :
                                                row.status === 'good' ? 'bg-green-100 text-green-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {row.status === 'critical' ? 'CRÍTICO' : row.status === 'good' ? 'OPTIMO' : 'BAJO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" onClick={() => handleAdjust(row.id, row.qty)}>Ajustar</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Entrada de Mercancía</DialogTitle>
                        <DialogDescription>Registra un nuevo lote de producto.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Producto</Label>
                            <Input placeholder="Ej. Vacuna Rabia" value={newBatch.product} onChange={e => setNewBatch({ ...newBatch, product: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Número de Lote</Label>
                                <Input placeholder="BATCH-001" value={newBatch.batch} onChange={e => setNewBatch({ ...newBatch, batch: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Caducidad</Label>
                                <Input type="date" value={newBatch.expiry} onChange={e => setNewBatch({ ...newBatch, expiry: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Cantidad (Unidades)</Label>
                            <Input type="number" placeholder="0" value={newBatch.qty} onChange={e => setNewBatch({ ...newBatch, qty: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
                        <Button onClick={handleAddStock}>Registrar Entrada</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
