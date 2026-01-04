import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Percent } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminPage() {
    const [showNewRule, setShowNewRule] = useState(false)

    const handleExport = () => {
        window.print()
    }

    const handleCreateRule = () => {
        alert("Regla de comisión guardada. (Simulación)")
        setShowNewRule(false)
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">⚖️ Administración y Legal</h1>
                <p className="text-muted-foreground">Configuración sensible, auditoría y comisiones.</p>
            </div>

            <Tabs defaultValue="audit" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="audit">Auditoría (Logs)</TabsTrigger>
                    <TabsTrigger value="commissions">Comisiones</TabsTrigger>
                </TabsList>

                <TabsContent value="audit" className="mt-4">
                    <Card>
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Registro de Actividad
                            </h3>
                            <Button variant="outline" size="sm" onClick={handleExport}>Exportar PDF</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-2">Hora</th>
                                        <th className="px-4 py-2">Usuario</th>
                                        <th className="px-4 py-2">Acción</th>
                                        <th className="px-4 py-2">Recurso</th>
                                        <th className="px-4 py-2">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr className="bg-white">
                                        <td className="px-4 py-2 font-mono text-xs">10:42 AM</td>
                                        <td className="px-4 py-2">Dr. Carlos</td>
                                        <td className="px-4 py-2"><span className="text-blue-600 font-bold">UPDATE</span></td>
                                        <td className="px-4 py-2">inventory_batches</td>
                                        <td className="px-4 py-2 text-gray-500">Ajuste manual -2 unidades (Merma)</td>
                                    </tr>
                                    <tr className="bg-red-50">
                                        <td className="px-4 py-2 font-mono text-xs">09:15 AM</td>
                                        <td className="px-4 py-2">Recepción</td>
                                        <td className="px-4 py-2"><span className="text-red-600 font-bold">DELETE</span></td>
                                        <td className="px-4 py-2">appointments</td>
                                        <td className="px-4 py-2 text-gray-500">Cita #992 eliminada</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-4 py-2 font-mono text-xs">08:00 AM</td>
                                        <td className="px-4 py-2">System</td>
                                        <td className="px-4 py-2"><span className="text-green-600 font-bold">LOGIN</span></td>
                                        <td className="px-4 py-2">auth</td>
                                        <td className="px-4 py-2 text-gray-500">Inicio de sesión exitoso</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="commissions" className="mt-4">
                    <Card className="p-6 text-center text-muted-foreground">
                        <Percent className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="font-bold">Reglas de Comisión</h3>
                        <p>Configura aquí los porcentajes por médico y servicio.</p>
                        <Button className="mt-4" onClick={() => setShowNewRule(true)}>Nueva Regla</Button>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Regla de Comisión</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Médico</Label>
                            <Input placeholder="Todos" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Servicio</Label>
                            <Input placeholder="Ej. Cirugía" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Porcentaje %</Label>
                            <Input type="number" placeholder="10" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateRule}>Guardar Regla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
