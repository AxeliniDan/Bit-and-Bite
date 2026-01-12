import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useTenant } from "@/context/useTenant"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Building2, ShieldAlert, Palette, Plus, UserPlus, Mail, Layout, ArrowUp, ArrowDown, PanelLeft, PanelTop } from "lucide-react"

// Types
interface Clinic {
    id: string;
    name: string;
    status: 'active' | 'trial' | 'past_due' | 'suspended';
    settings: {
        modules: string[];
        branding: {
            primaryColor: string;
        };
        layout: {
            mode: 'sidebar' | 'topbar';
            radius?: number;
            navOrder?: string[];
        };
    };
    created_at: string;
}

export function SuperAdminPage() {
    const { isSuperAdmin, isLoading: isAuthLoading } = useTenant()
    const navigate = useNavigate()

    // Data State
    const [clinics, setClinics] = useState<Clinic[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // UI State
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Forms
    const [editSettings, setEditSettings] = useState<Clinic['settings'] | null>(null)
    const [newClinicData, setNewClinicData] = useState({ name: '', adminEmail: '', adminName: '' })

    // 1. Verify Access
    useEffect(() => {
        if (!isAuthLoading && !isSuperAdmin) {
            navigate("/") // Redirect unauthorized
        }
    }, [isSuperAdmin, isAuthLoading, navigate])

    // 2. Fetch Clinics
    const fetchClinics = useCallback(async () => {
        const { data } = await supabase
            .from('clinics')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setClinics(data as Clinic[])
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (isSuperAdmin) {
            const timer = setTimeout(() => {
                void fetchClinics()
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [isSuperAdmin, fetchClinics])


    const handleEditClick = (clinic: Clinic) => {
        setSelectedClinic(clinic)
        // Ensure default settings structure exists
        const currentSettings = clinic.settings || { modules: [], branding: {}, layout: {} }
        setEditSettings(JSON.parse(JSON.stringify(currentSettings))) // Deep copy
        setIsEditing(true)
    }


    const handleSave = async () => {
        if (!selectedClinic) return

        const { error } = await supabase
            .from('clinics')
            .update({ settings: editSettings })
            .eq('id', selectedClinic.id)

        if (error) {
            alert("Error al actualizar: " + error.message)
        } else {
            alert("✅ Configuración actualizada")
            setIsEditing(false)
            fetchClinics()
        }
    }

    const handleCreateClinic = async () => {
        if (!newClinicData.name || !newClinicData.adminEmail) return alert("Completa los datos")

        // 1. Create Clinic
        const { data: clinic, error: clinicError } = await supabase
            .from('clinics')
            .insert({
                name: newClinicData.name,
                search_code: Math.random().toString(36).substring(7),
                settings: {
                    modules: ['appointments', 'patients'],
                    branding: { primaryColor: '#2563eb' }
                }
            })
            .select()
            .single()

        if (clinicError) return alert("Error creando clínica: " + clinicError.message)

        // 2. Invite/Create Admin User (Mock for now, or use Supabase Admin API if enabled)
        // Since we are client-side, we can't create users directly without logging them in.
        // Alternative: Create a "Profile" placeholder and let them claim it? 
        // OR: Just create the clinic and tell the Super Admin to share the "Login Code" if we implement that.
        // FOR NOW: We just create the clinic. User creation is manual or handled separately.

        alert(`✅ Clínica creada: ${clinic.name}\n\nNota: Para asignar un admin, el usuario debe registrarse y tú debes vincularlo manualmente o usar el sistema de invitación (pendiente).`)

        setClinics([clinic as Clinic, ...clinics])
        setIsCreating(false)
        setNewClinicData({ name: '', adminEmail: '', adminName: '' })
    }

    // Toggle Module Helper
    const toggleModule = (module: string) => {
        setEditSettings((prev) => {
            if (!prev) return null
            const modules = prev.modules?.includes(module)
                ? prev.modules.filter((m: string) => m !== module)
                : [...(prev.modules || []), module]
            return { ...prev, modules }
        })
    }

    // Layout Helpers
    const changeRadius = (val: number) => {
        setEditSettings((prev) => prev ? ({ ...prev, layout: { ...prev.layout, radius: val } }) : null)
    }

    const availableModules = ['appointments', 'patients', 'pos', 'hospital', 'inventory', 'admin']

    const moveModule = (index: number, direction: 'up' | 'down') => {
        setEditSettings((prev) => {
            if (!prev) return null
            const list = [...(prev.layout?.navOrder || availableModules)]
            if (direction === 'up' && index > 0) {
                [list[index - 1], list[index]] = [list[index], list[index - 1]]
            }
            if (direction === 'down' && index < list.length - 1) {
                [list[index + 1], list[index]] = [list[index], list[index + 1]]
            }
            return { ...prev, layout: { ...prev.layout, navOrder: list } }
        })
    }

    if (isAuthLoading) return <div className="p-8">Verificando permisos...</div>
    if (!isSuperAdmin) return <div className="p-8 text-red-600">Acceso Denegado.</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
                        <ShieldAlert className="h-8 w-8 text-indigo-600" />
                        Control Panel (Super Admin)
                    </h1>
                    <p className="text-muted-foreground mt-1">Gestión centralizada de Clínicas (Tenants) y Feature Flags.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Nueva Clínica
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? <p>Cargando clínicas...</p> : clinics.map(clinic => (
                    <Card key={clinic.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    {clinic.name}
                                    <Badge variant={clinic.status === 'active' ? 'default' : 'secondary'} className={clinic.status === 'active' ? 'bg-green-600' : ''}>
                                        {clinic.status || 'Active'}
                                    </Badge>
                                </h3>
                                <div className="text-sm text-muted-foreground font-mono mt-1">ID: {clinic.id}</div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {clinic.settings?.modules?.map((m: string) => (
                                        <span key={m} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div
                                className="h-8 w-8 rounded-full border shadow-sm"
                                style={{ backgroundColor: clinic.settings?.branding?.primaryColor || '#000' }}
                                title="Color Primario de Marca"
                            />
                            <Button variant="outline" onClick={() => handleEditClick(clinic)}>Configurar</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Configurar: {selectedClinic?.name}</DialogTitle>
                        <DialogDescription>Activa módulos y personaliza la marca del cliente.</DialogDescription>
                    </DialogHeader>

                    {editSettings && (
                        <div className="py-4 space-y-6">
                            {/* Feature Flags */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Módulos Activos (Feature Flags)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {availableModules.map(module => (
                                        <div key={module} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => toggleModule(module)}>
                                            <Label className="cursor-pointer capitalize font-medium pointer-events-none">{module === 'pos' ? 'Punto de Venta' : module}</Label>
                                            <Switch className="pointer-events-none" checked={editSettings.modules.includes(module)} readOnly />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Branding */}
                            <div className="space-y-3 pt-4 border-t">
                                <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                    <Palette className="h-4 w-4" /> Branding / Whitelabel
                                </h4>
                                <div className="grid gap-2">
                                    <Label>Color Primario</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            value={editSettings.branding.primaryColor}
                                            onChange={(e) => setEditSettings({ ...editSettings, branding: { ...editSettings.branding, primaryColor: e.target.value } })}
                                        />
                                        <Input
                                            value={editSettings.branding.primaryColor}
                                            onChange={(e) => setEditSettings({ ...editSettings, branding: { ...editSettings.branding, primaryColor: e.target.value } })}
                                            className="font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Layout & Interface */}
                            {/* Layout & Interface */}
                            <div className="space-y-3 pt-4 border-t">
                                <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                    <Layout className="h-4 w-4" /> Interfaz y Acomodo
                                </h4>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label>Estructura de Navegación</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div
                                                className={`border-2 rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 hover:bg-slate-50 transition-all ${editSettings.layout?.mode === 'sidebar' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'}`}
                                                onClick={() => setEditSettings((prev) => prev ? ({ ...prev, layout: { ...prev.layout, mode: 'sidebar' } }) : null)}
                                            >
                                                <PanelLeft className={`h-6 w-6 ${editSettings.layout?.mode === 'sidebar' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                <span className="text-xs font-medium">Dashboard Clásico</span>
                                            </div>
                                            <div
                                                className={`border-2 rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 hover:bg-slate-50 transition-all ${editSettings.layout?.mode === 'topbar' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'}`}
                                                onClick={() => setEditSettings((prev) => prev ? ({ ...prev, layout: { ...prev.layout, mode: 'topbar' } }) : null)}
                                            >
                                                <PanelTop className={`h-6 w-6 ${editSettings.layout?.mode === 'topbar' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                <span className="text-xs font-medium">Sitio Moderno</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Geometría (Radio de Borde)</Label>
                                        <div className="flex gap-2">
                                            {[0, 0.25, 0.5, 0.75, 1.0, 1.5].map(r => (
                                                <div
                                                    key={r}
                                                    className={`h-8 w-8 border-2 flex items-center justify-center cursor-pointer hover:bg-slate-100 ${editSettings.layout?.radius === r ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
                                                    style={{ borderRadius: `${r}rem` }}
                                                    onClick={() => changeRadius(r)}
                                                >
                                                    <span className="text-[10px] font-mono">{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Orden del Menú (Arrastrar / Mover)</Label>
                                        <div className="border rounded-md divide-y">
                                            {(editSettings.layout?.navOrder || availableModules).map((item: string, idx: number, arr: string[]) => (
                                                <div key={item} className="flex items-center justify-between p-2 bg-white hover:bg-slate-50">
                                                    <span className="text-sm font-medium capitalize flex items-center gap-2">
                                                        <span className="text-muted-foreground text-xs w-4">{idx + 1}.</span>
                                                        {item === 'pos' ? 'Punto de Venta' : item}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveModule(idx, 'up')}>
                                                            <ArrowUp className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === arr.length - 1} onClick={() => moveModule(idx, 'down')}>
                                                            <ArrowDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CREATE CLINIC DIALOG */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alta de Nueva Clínica</DialogTitle>
                        <DialogDescription>Crea un nuevo Tenant (Inquilino) y envía invitación al administrador.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre de la Clínica</Label>
                            <div className="relative">
                                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input className="pl-9" placeholder="Ej. Veterinaria San José" value={newClinicData.name} onChange={e => setNewClinicData({ ...newClinicData, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Correo del Administrador (Dueño)</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input className="pl-9" placeholder="correo@ejemplo.com" value={newClinicData.adminEmail} onChange={e => setNewClinicData({ ...newClinicData, adminEmail: e.target.value })} />
                            </div>
                            <p className="text-xs text-muted-foreground">Se enviará un enlace de registro único a este correo.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button onClick={handleCreateClinic}>
                            <UserPlus className="h-4 w-4 mr-2" /> Crear e Invitar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
