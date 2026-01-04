import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePatient, useUpdatePatient } from "./usePatients"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Printer, Syringe, FileText, Activity, Save, X, Upload, Mic } from "lucide-react"
import { VoiceMicButton } from "@/features/smart-consult/VoiceMicButton"

export function PatientProfile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: patient, isLoading, refetch } = usePatient(id || '')
    const { mutate: updatePatient } = useUpdatePatient() // Assumes this hook exists or will be created

    // UI States
    const [isEditing, setIsEditing] = useState(false)
    const [showVaccineModal, setShowVaccineModal] = useState(false)
    const [editForm, setEditForm] = useState<any>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Vaccine Logic State
    const [selectedVaccine, setSelectedVaccine] = useState("")

    if (isLoading) return <div className="p-10 text-center">Cargando expediente...</div>
    if (!patient) return <div className="p-10 text-center">Paciente no encontrado</div>

    // -- LOGIC HANDLERS --

    const handleEditToggle = () => {
        if (!isEditing) setEditForm(patient)
        setIsEditing(!isEditing)
    }

    const handleSave = async () => {
        // Optimistic update or wait for API
        await updatePatient({ id: patient.id, ...editForm })
        setIsEditing(false)
        refetch() // Refresh data
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        // Pseudo-logic for upload
        alert(`Subiendo archivo: ${file.name} (Simulado)\nSe guardará en Supabase Storage bucket 'medical-records'`)
    }

    const handleVaccinate = () => {
        if (!selectedVaccine) return alert("Selecciona una vacuna")
        // Call Inventory Service mock
        alert(`✅ Vacuna registrada: ${selectedVaccine}\n📉 Inventario descontado: -1 unidad\n📅 Cita de refuerzo sugerida: en 1 año`)
        setShowVaccineModal(false)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
            {/* Nav Back */}
            <div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/patients')} className="mb-2 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
                </Button>
            </div>

            {/* Header Card (Editable) */}
            <Card className="overflow-hidden border-none shadow-md bg-white">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                        {isEditing ? (
                            <>
                                <Button size="sm" variant="destructive" onClick={handleEditToggle}>
                                    <X className="mr-2 h-4 w-4" /> Cancelar
                                </Button>
                                <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                                </Button>
                                <Button size="sm" variant="secondary" className="bg-white text-primary hover:bg-gray-100" onClick={handleEditToggle}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6">
                    <div className="bg-white p-1 rounded-full shadow-lg relative group">
                        <img
                            src={patient.avatar_url || "https://placehold.co/150"} // Fallback
                            alt={patient.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white"
                        />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="text-white h-6 w-6" />
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2 w-full">
                        {isEditing ? (
                            <div className="grid gap-2 max-w-md">
                                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="font-bold text-xl" />
                                <div className="flex gap-2">
                                    <Input value={editForm.species} onChange={e => setEditForm({ ...editForm, species: e.target.value })} placeholder="Especie" />
                                    <Input value={editForm.breed} onChange={e => setEditForm({ ...editForm, breed: e.target.value })} placeholder="Raza" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                                <p className="text-gray-500 font-medium">{patient.species} • {patient.breed}</p>
                            </>
                        )}
                    </div>

                    <div className="flex gap-8 text-center md:text-right">
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Edad</div>
                            {isEditing ? <Input className="w-20 text-center h-8" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} /> : <div className="font-semibold text-gray-800">{patient.age}</div>}
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Peso</div>
                            {isEditing ? <Input className="w-20 text-center h-8" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} /> : <div className="font-semibold text-gray-800">{patient.weight}</div>}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Bar (Zero Depth) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-14 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-sm" onClick={() => document.getElementById('voice-mic-trigger')?.click()}>
                    <Mic className="mr-2 h-5 w-5" /> Iniciar Consulta
                </Button>
                <Button className="h-14 bg-emerald-600 hover:bg-emerald-700 text-lg shadow-sm" onClick={() => setShowVaccineModal(true)}>
                    <Syringe className="mr-2 h-5 w-5" /> Vacunar
                </Button>
                <Button variant="outline" className="h-14 text-lg bg-white shadow-sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-5 w-5" /> Subir Archivo
                </Button>
                <Button variant="outline" className="h-14 text-lg bg-white shadow-sm">
                    <Activity className="mr-2 h-5 w-5" /> Signos Vitales
                </Button>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="vaccines">Vacunas</TabsTrigger>
                    <TabsTrigger value="info">Información</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-6 space-y-4">
                    {/* Mock Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">02 Enero 2026 - Consulta General</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-2">Paciente acude por vómito y decaimiento. Se realiza examen físico general.</p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Peso: 28kg</span>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Temp: 39.2°C</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vaccines" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Cartilla de Vacunación</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => setShowVaccineModal(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Registrar Vacuna
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {/* Existing list would go here */}
                            <div className="text-sm text-gray-500 italic">Historial de vacunas...</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="info" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Propietario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Nombre</label>
                                    <div className="font-semibold">{patient.client_name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Teléfono</label>
                                    <div className="font-semibold text-primary underline cursor-pointer" onClick={() => window.open(`https://wa.me/${patient.client_phone}`, '_blank')}>
                                        {patient.client_phone} (WhatsApp)
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Hidden Voice Mic Button which persists but we trigger it from the UI action bar */}
            <div id="voice-mic-wrapper" className="hidden">
                {/* The Floating Button component handles its own visibility, but we can trigger logic here */}
            </div>

            <Dialog open={showVaccineModal} onOpenChange={setShowVaccineModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aplicar Vacuna</DialogTitle>
                        <DialogDescription>Esto descontará del inventario automáticamente.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Seleccionar Biológico</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={selectedVaccine}
                                onChange={e => setSelectedVaccine(e.target.value)}
                            >
                                <option value="">Selecciona...</option>
                                <option value="Rabia">Vacuna Antirrábica (Lote B-99)</option>
                                <option value="Sextuple">Vacuna Séxtuple (Lote X-22)</option>
                                <option value="Bordetella">Bordetella Oral (Lote Z-11)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowVaccineModal(false)}>Cancelar</Button>
                        <Button onClick={handleVaccinate}>Confirmar Aplicación</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
