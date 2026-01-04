import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Pill, FileText, BedDouble, Plus, XCircle, Thermometer, Clock, Stethoscope } from "lucide-react"

// Mock Hospital Layout
const INITIAL_CAGES = [
    { id: 1, name: "Jaula A1", type: "Grande", status: "occupied", patient: "Firulais", diagnosis: "Parvovirus (Aisla)", next_med: "14:00" },
    { id: 2, name: "Jaula A2", type: "Mediana", status: "available", patient: null },
    { id: 3, name: "Jaula A3", type: "Mediana", status: "occupied", patient: "Gatito", diagnosis: "Post-op Esterilización", next_med: "16:00" },
    { id: 4, name: "Jaula B1", type: "Pequeña", status: "available", patient: null },
    { id: 5, name: "Jaula B2", type: "Pequeña", status: "dirty", patient: null },
]

export function HospitalPage() {
    const [cages, setCages] = useState<any[]>(INITIAL_CAGES)
    const [selectedCage, setSelectedCage] = useState<any>(null)

    // Modal States
    const [showAdmit, setShowAdmit] = useState(false)
    const [showVitals, setShowVitals] = useState(false)
    const [showKardex, setShowKardex] = useState(false)

    // Form States
    const [patientName, setPatientName] = useState("")
    const [diagnosis, setDiagnosis] = useState("")
    const [vitalsData, setVitalsData] = useState({ temp: '', hr: '', rr: '', weight: '' })
    const [kardexNote, setKardexNote] = useState("")

    // --- HANDLERS ---

    const handleAddCage = () => {
        const nextNum = cages.length + 1
        const newCage = {
            id: Date.now(),
            name: `Jaula C${nextNum}`,
            type: "Estándar",
            status: "available",
            patient: null
        }
        setCages([...cages, newCage])
        // Scroll to bottom logic if needed
    }

    const handleAssignClick = (cage: any) => {
        setSelectedCage(cage)
        setPatientName("")
        setDiagnosis("")
        setShowAdmit(true)
    }

    const confirmAdmission = () => {
        if (!patientName || !diagnosis) return alert("Completa los datos")
        setCages(prev => prev.map(c => c.id === selectedCage.id ? {
            ...c,
            status: 'occupied',
            patient: patientName,
            diagnosis: diagnosis,
            next_med: 'Pendiente'
        } : c))
        setShowAdmit(false)
    }

    const handleDischarge = (cageId: number) => {
        if (!confirm("⚠️ ¿Confirmar ALTA MÉDICA?\n\nEsto liberará la jaula y generará la cuenta final.")) return

        setCages(prev => prev.map(c => c.id === cageId ? {
            ...c, status: 'dirty', patient: null, diagnosis: null
        } : c))

        alert("✅ Paciente dado de alta.\n📄 Cuenta generada y enviada a Caja.")
    }

    const handleClean = (cageId: number) => {
        setCages(prev => prev.map(c => c.id === cageId ? { ...c, status: 'available' } : c))
    }

    const handleOpenVitals = (cage: any) => {
        setSelectedCage(cage)
        setVitalsData({ temp: '38.5', hr: '120', rr: '30', weight: '15' }) // Default or fetch
        setShowVitals(true)
    }

    const handleSaveVitals = () => {
        alert(`✅ Signos guardados para ${selectedCage.patient}:\n\nTemp: ${vitalsData.temp}°C\nFC: ${vitalsData.hr} bpm`)
        setShowVitals(false)
    }

    const handleOpenKardex = (cage: any) => {
        setSelectedCage(cage)
        setKardexNote("")
        setShowKardex(true)
    }

    const handleAddKardexNote = () => {
        if (!kardexNote) return
        alert("📝 Nota agregada al expediente clínico.")
        setKardexNote("")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">🏥 Hospitalización <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{cages.filter(c => c.status === 'occupied').length} Pacientes</span></h1>
                    <p className="text-muted-foreground">Gestión de internados, tratamientos y signos vitales.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm" onClick={handleAddCage}>
                    <Plus className="h-4 w-4" /> Agregar Jaula
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cages.map(cage => (
                    <Card key={cage.id} className={`relative overflow-hidden transition-all hover:shadow-xl group ${cage.status === 'occupied' ? 'border-l-4 border-l-orange-500' :
                        cage.status === 'dirty' ? 'border-l-4 border-l-yellow-400 bg-yellow-50/50' :
                            'border-l-4 border-l-green-500 opacity-90 hover:opacity-100'
                        }`}>
                        <div className="p-4 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{cage.name}</h3>
                                    <span className="text-xs text-muted-foreground uppercase">{cage.type}</span>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${cage.status === 'occupied' ? 'bg-orange-100 text-orange-700' :
                                    cage.status === 'dirty' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {cage.status === 'occupied' ? 'Ocupada' : cage.status === 'dirty' ? 'Limpieza' : 'Libre'}
                                </div>
                            </div>

                            {cage.status === 'occupied' ? (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="bg-white p-3 rounded border shadow-sm">
                                        <div className="font-bold text-indigo-700 text-lg">{cage.patient}</div>
                                        <div className="text-xs text-gray-600">{cage.diagnosis}</div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm bg-slate-100 p-2 rounded">
                                        <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Med:</span>
                                        <span className="font-mono font-bold text-blue-600">{cage.next_med || '--:--'}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="text-xs h-8 hover:bg-blue-50 hover:text-blue-600 border-blue-200" onClick={() => handleOpenVitals(cage)}>
                                            <Activity className="h-3 w-3 mr-1" /> Signos
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-xs h-8 hover:bg-purple-50 hover:text-purple-600 border-purple-200" onClick={() => handleOpenKardex(cage)}>
                                            <FileText className="h-3 w-3 mr-1" /> Kardex
                                        </Button>
                                    </div>
                                    <Button size="sm" variant="destructive" className="w-full h-8 text-xs mt-2 bg-red-500 hover:bg-red-600" onClick={() => handleDischarge(cage.id)}>
                                        Dar de Alta
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm py-8 gap-2">
                                    {cage.status === 'dirty' ? (
                                        <>
                                            <span className="italic flex items-center gap-1"><Pill className="h-4 w-4" /> Sucia</span>
                                            <Button size="sm" variant="outline" onClick={() => handleClean(cage.id)}>Marcar Limpia</Button>
                                        </>
                                    ) : (
                                        <span className="italic opacity-50">Disponible</span>
                                    )}
                                </div>
                            )}

                            {cage.status === 'available' && (
                                <Button variant="ghost" size="sm" className="w-full border-dashed border-2 hover:bg-slate-50 text-gray-500 hover:text-gray-900" onClick={() => handleAssignClick(cage)}>
                                    <Plus className="h-4 w-4 mr-2" /> Asignar
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ADMIT DIALOG */}
            <Dialog open={showAdmit} onOpenChange={setShowAdmit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ingreso Hospitalario - {selectedCage?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Paciente</Label>
                            <Input placeholder="Nombre..." value={patientName} onChange={e => setPatientName(e.target.value)} autoFocus />
                        </div>
                        <div className="space-y-2">
                            <Label>Diagnóstico de Ingreso</Label>
                            <Input placeholder="Ej. Parvovirus" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowAdmit(false)}>Cancelar</Button>
                        <Button onClick={confirmAdmission}>Ingresar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* VITALS DIALOG */}
            <Dialog open={showVitals} onOpenChange={setShowVitals}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Signos Vitales - {selectedCage?.patient}</DialogTitle>
                        <DialogDescription>Registrar monitoreo actual.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Temperatura (°C)</Label>
                            <div className="relative">
                                <Thermometer className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input className="pl-9" value={vitalsData.temp} onChange={e => setVitalsData({ ...vitalsData, temp: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Frecuencia Cardiaca (LPM)</Label>
                            <div className="relative">
                                <Activity className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input className="pl-9" value={vitalsData.hr} onChange={e => setVitalsData({ ...vitalsData, hr: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Frecuencia Respi. (RPM)</Label>
                            <Input value={vitalsData.rr} onChange={e => setVitalsData({ ...vitalsData, rr: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Peso Actual (kg)</Label>
                            <Input value={vitalsData.weight} onChange={e => setVitalsData({ ...vitalsData, weight: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveVitals}>Guardar Registro</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* KARDEX DIALOG */}
            <Dialog open={showKardex} onOpenChange={setShowKardex}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Kardex / Hoja de Tratamientos</DialogTitle>
                        <DialogDescription>Paciente: {selectedCage?.patient}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Mock History */}
                        <div className="border rounded-md p-3 h-48 overflow-y-auto bg-gray-50 space-y-3 text-sm">
                            <div className="flex gap-2">
                                <span className="font-mono text-xs text-gray-500">14:00</span>
                                <div>
                                    <span className="font-bold text-blue-700">Ampicilina 500mg IV</span>
                                    <p className="text-gray-600">Aplicado por Dr. Turno. Sin reacción.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-mono text-xs text-gray-500">12:30</span>
                                <div>
                                    <span className="font-bold text-green-700">Comida Blanda</span>
                                    <p className="text-gray-600">Comió 50% de la ración. Buen ánimo.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Escribir nueva nota o medicamento..."
                                value={kardexNote}
                                onChange={e => setKardexNote(e.target.value)}
                                className="flex-1"
                            />
                            <Button size="icon" onClick={handleAddKardexNote}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
