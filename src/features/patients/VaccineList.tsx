
import { useState } from "react"
import { useVaccines, useAddVaccine } from "./vaccineService"
import { Plus, Syringe, MessageCircle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface VaccineListProps {
    patientId: string
    patientName: string
    clientPhone: string
}

export function VaccineList({ patientId, patientName, clientPhone }: VaccineListProps) {
    const { data: vaccines = [], isLoading } = useVaccines(patientId)
    const { mutate: addVaccine, isPending: isAdding } = useAddVaccine()
    const [showAddModal, setShowAddModal] = useState(false)

    // Form State
    const [newVaccine, setNewVaccine] = useState({ name: "", date: new Date().toISOString().split('T')[0], next_date: "", lot: "" })

    const handleAddVaccine = () => {
        const nextYear = new Date(newVaccine.date)
        nextYear.setFullYear(nextYear.getFullYear() + 1)

        const nextDate = newVaccine.next_date || nextYear.toISOString().split('T')[0]

        addVaccine({
            patientId,
            name: newVaccine.name,
            date: newVaccine.date,
            nextDate: nextDate,
            lot: newVaccine.lot
        }, {
            onSuccess: () => {
                setShowAddModal(false)
                setNewVaccine({ name: "", date: new Date().toISOString().split('T')[0], next_date: "", lot: "" })
            }
        })
    }

    const sendWhatsApp = (vaccineName: string, nextDate: string, daysBefore: number) => {
        if (!clientPhone) return alert("El paciente no tiene teléfono registrado")

        const dateObj = new Date(nextDate)
        // Ajustar fecha de recordatorio
        const reminderDate = new Date(dateObj)
        reminderDate.setDate(reminderDate.getDate() - daysBefore)

        const isToday = daysBefore === 0
        const when = isToday ? "HOY" : `el día ${nextDate}`

        // Mensaje limpio y profesional
        const message = `Hola! Recordatorio de la Clínica Veterinaria: A ${patientName} le toca su vacuna de ${vaccineName} ${when}. Es importante para su salud. ¿Agendamos cita?`

        const url = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <div className="space-y-6">
            <Card className="print:shadow-none print:border-none">
                <CardHeader className="flex flex-row items-center justify-between print:hidden">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Syringe className="h-5 w-5 text-emerald-600" />
                            Cartilla de Vacunación Digital
                        </CardTitle>
                        <CardDescription>
                            Gestiona el esquema de vacunación y envía recordatorios.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimir Cartilla
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Registrar Vacuna
                        </Button>
                    </div>
                </CardHeader>

                {/* Print Header only (Hidden on screen) */}
                <div className="hidden print:block mb-8 text-center border-b pb-4">
                    <h1 className="text-2xl font-bold">HISTORIAL DE VACUNACIÓN</h1>
                    <h2 className="text-xl text-gray-600">Paciente: {patientName}</h2>
                    <p className="text-sm text-gray-500">Clínica Veterinaria Bit and Bite</p>
                </div>

                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-900 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left">Vacuna / Biológico</th>
                                    <th className="px-4 py-3 text-left">Fecha Aplicación</th>
                                    <th className="px-4 py-3 text-left">Próxima Dosis</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Lote</th>
                                    <th className="px-4 py-3 text-left print:hidden">Acciones (WhatsApp)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">Cargando vacunas...</td>
                                    </tr>
                                ) : vaccines.map((v) => {
                                    const isLate = new Date(v.next_dose_date) < new Date()
                                    return (
                                        <tr key={v.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{v.applied_date}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {v.next_dose_date}
                                                    {isLate && <Badge variant="destructive" className="text-[10px] h-5">Vencida</Badge>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{v.lot_number || '-'}</td>
                                            <td className="px-4 py-2 print:hidden">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        title="Recordatorio 5 días antes"
                                                        onClick={() => sendWhatsApp(v.name, v.next_dose_date, 5)}
                                                    >
                                                        <span className="font-bold text-xs">-5d</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        title="Recordatorio para HOY"
                                                        onClick={() => sendWhatsApp(v.name, v.next_dose_date, 0)}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {vaccines.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No hay vacunas registradas aún.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Vaccine Dialog */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Nueva Vacuna</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre de la Vacuna</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newVaccine.name}
                                onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Rabia">Rabia</option>
                                <option value="Sextuple">Quíntuple / Séxtuple</option>
                                <option value="Puppy">Puppy DP</option>
                                <option value="Bordetella">Bordetella</option>
                                <option value="Giardia">Giardia</option>
                                <option value="Leucemia">Leucemia Felina</option>
                                <option value="Triple Felina">Triple Felina</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha Aplicación</Label>
                                <Input
                                    type="date"
                                    value={newVaccine.date}
                                    onChange={(e) => setNewVaccine({ ...newVaccine, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Lote (Opcional)</Label>
                                <Input
                                    placeholder="Lote..."
                                    value={newVaccine.lot}
                                    onChange={(e) => setNewVaccine({ ...newVaccine, lot: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha Próximo Refuerzo</Label>
                            <Input
                                type="date"
                                value={newVaccine.next_date}
                                onChange={(e) => setNewVaccine({ ...newVaccine, next_date: e.target.value })}
                                placeholder="Calculada autom..."
                            />
                            <p className="text-xs text-gray-500">Por defecto 1 año, ajustar si es cachorro.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                        <Button onClick={handleAddVaccine} className="bg-emerald-600 hover:bg-emerald-700" disabled={isAdding}>
                            {isAdding ? "Guardando..." : "Guardar Registro"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
