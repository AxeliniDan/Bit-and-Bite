import { useState, useMemo } from "react"
import { usePatients, useCreatePatient } from "./usePatients"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function PatientList() {
    const { data: patients, isLoading } = usePatients()
    const { mutate: createPatient } = useCreatePatient()
    const navigate = useNavigate()

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    // Creation State
    const [showNewPatient, setShowNewPatient] = useState(false)
    const [newPatient, setNewPatient] = useState({ name: '', species: 'Canino', client_name: '', client_phone: '' })

    const handleCreate = () => {
        if (!newPatient.name || !newPatient.client_name) return alert("Faltan datos obligatorios")
        createPatient(newPatient)
        setShowNewPatient(false)
        setNewPatient({ name: '', species: 'Canino', client_name: '', client_phone: '' })
    }

    // Filter Logic
    const filteredPatients = useMemo(() => {
        if (!patients) return []
        return patients.filter(patient => {
            const matchesSearch =
                patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                false

            const matchesSpecies = selectedSpecies ? patient.species === selectedSpecies : true

            return matchesSearch && matchesSpecies
        })
    }, [patients, searchQuery, selectedSpecies])

    const speciesOptions = ["Canino", "Felino", "Ave", "Exótico"]

    if (isLoading) return <div className="p-10 text-center text-muted-foreground">Cargando pacientes...</div>

    return (
        <div className="flex flex-col gap-6 h-full" onClick={() => setShowFilters(false)}>
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
                    <p className="text-muted-foreground">Gestiona los expedientes clínicos de tus mascotas.</p>
                </div>
                <Button className="shadow-lg hover:shadow-xl transition-all" onClick={(e) => { e.stopPropagation(); setShowNewPatient(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm relative" onClick={(e) => e.stopPropagation()}>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, dueño o raza..."
                        className="pl-9 border-0 focus-visible:ring-0 bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-gray-200 mx-2" />

                <div className="relative">
                    <Button
                        variant={selectedSpecies ? "default" : "ghost"}
                        size="sm"
                        className={cn("text-gray-500", selectedSpecies && "text-white bg-primary hover:text-white")}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {selectedSpecies ? selectedSpecies : "Filtros"}
                    </Button>

                    {/* Custom Dropdown */}
                    {showFilters && (
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-xs font-semibold text-gray-400 px-2 py-2">POR ESPECIE</div>
                            <div
                                className={cn("flex items-center px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-gray-100", !selectedSpecies && "bg-gray-100 font-medium")}
                                onClick={() => { setSelectedSpecies(null); setShowFilters(false); }}
                            >
                                <span className="flex-1">Todas</span>
                                {!selectedSpecies && <Check className="h-3 w-3" />}
                            </div>
                            {speciesOptions.map(species => (
                                <div
                                    key={species}
                                    className={cn("flex items-center px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-gray-100", selectedSpecies === species && "bg-blue-50 text-blue-700 font-medium")}
                                    onClick={() => { setSelectedSpecies(species); setShowFilters(false); }}
                                >
                                    <span className="flex-1">{species}</span>
                                    {selectedSpecies === species && <Check className="h-3 w-3" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-10">
                {filteredPatients.length === 0 ? (
                    <div className="col-span-full text-center py-20 opacity-50">
                        <Search className="h-10 w-10 mx-auto mb-2" />
                        <p>No se encontraron pacientes que coincidan con tu búsqueda.</p>
                        {(searchQuery || selectedSpecies) && (
                            <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedSpecies(null) }}>Limpiar filtros</Button>
                        )}
                    </div>
                ) : filteredPatients.map((patient) => (
                    <Card
                        key={patient.id}
                        className="group relative overflow-hidden flex flex-col hover:shadow-lg transition-all border-gray-100 cursor-pointer"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                        <div className="h-32 bg-gray-100 relative">
                            {patient.avatar_url ? (
                                <img src={patient.avatar_url} alt={patient.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm uppercase tracking-wider text-gray-700">
                                {patient.species}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{patient.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{patient.breed}</p>
                            <div className="mt-auto pt-3 flex flex-col gap-1 text-xs text-gray-400 border-t border-gray-50">
                                <span className="flex items-center gap-1">
                                    👤 {patient.client_name}
                                </span>
                                <span className="flex items-center gap-1">
                                    📞 {patient.client_phone}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* NEW PATIENT DIALOG */}
            <Dialog open={showNewPatient} onOpenChange={setShowNewPatient}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alta de Paciente Nuevo</DialogTitle>
                        <DialogDescription>Crea un expediente clínico desde cero.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="grid gap-2">
                            <Label>Nombre de Mascota</Label>
                            <Input placeholder="Ej. Firulais" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Especie</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newPatient.species} onChange={e => setNewPatient({ ...newPatient, species: e.target.value })}>
                                    <option>Canino</option>
                                    <option>Felino</option>
                                    <option>Ave</option>
                                    <option>Exótico</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Dueño (Cliente)</Label>
                                <Input placeholder="Nombre Completo" value={newPatient.client_name} onChange={e => setNewPatient({ ...newPatient, client_name: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Teléfono de Contacto</Label>
                            <Input placeholder="555-000-0000" value={newPatient.client_phone} onChange={e => setNewPatient({ ...newPatient, client_phone: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowNewPatient(false)}>Cancelar</Button>
                        <Button onClick={handleCreate}>Crear Expediente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
