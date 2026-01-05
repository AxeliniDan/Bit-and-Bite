import { useState } from 'react'
import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, MessageCircle, AlertCircle, Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAppointments } from './useAppointments'
import { usePatients } from '@/features/patients/usePatients'
import { OnboardingHero } from '@/components/onboarding/OnboardingHero'
// import { NewAppointmentDialog } from './NewAppointmentDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [showNewAppt, setShowNewAppt] = useState(false)

    // Quick Form State
    const [newApptData, setNewApptData] = useState({ client: '', pet: '', type: 'Consulta' })

    // Fetch Data
    const { data: appointments, isLoading } = useAppointments(currentDate)
    const { data: patients, isLoading: isLoadingPatients } = usePatients()

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
    const timeSlots = Array.from({ length: 13 }).map((_, i) => i + 8)

    // Handlers
    const handleSlotClick = (day: Date, hour: number) => {
        // Clash detection logic
        const existing = getAppointmentsForSlot(day, hour)
        if (existing.length > 0) {
            // Usually valid to have overlap in some clinics, but we warn
            if (!confirm("Ya hay una cita en este horario. ¿Deseas agendar otra (doble turno)?")) return
        }

        setSelectedSlot({ date: day, hour })
        setNewApptData({ client: '', pet: '', type: 'Consulta' })
        setShowNewAppt(true)
    }

    const handleAppointmentClick = (e: React.MouseEvent, apt: any) => {
        e.stopPropagation()
        setSelectedAppointment(apt)
    }

    const handleCreateAppointment = () => {
        if (!newApptData.client) return alert("Falta el nombre del cliente")
        alert(`📅 Cita Agendada: ${newApptData.client} - ${newApptData.pet}\nFecha: ${format(selectedSlot!.date, 'dd/MM')} ${selectedSlot!.hour}:00`)
        setShowNewAppt(false)
        // Refetch/Invalidate query here
    }

    const handleWhatsApp = () => {
        if (!selectedAppointment) return
        const msg = `Hola! Confirmamos su cita para ${selectedAppointment.patients?.name || 'su mascota'} el día ${format(parseISO(selectedAppointment.start_time), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}. Por favor confirme asistencia. 🐾`
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
        window.open(url, '_blank')
    }

    const getAppointmentsForSlot = (day: Date, hour: number) => {
        if (!appointments) return []
        return appointments.filter(apt => {
            const aptDate = parseISO(apt.start_time)
            return isSameDay(aptDate, day) && aptDate.getHours() === hour
        })
    }

    if (isLoading) return <div className="p-10 text-center">Cargando agenda...</div>

    return (
        <div className="flex flex-col h-full gap-4">
            {/* ONBOARDING HERO */}
            {!isLoadingPatients && patients && patients.length === 0 && (
                <OnboardingHero />
            )}

            <div className="flex items-center justify-between">
                {/* Date Navigation */}
                <div className="flex items-center gap-2">

                    <h2 className="text-2xl font-bold capitalize flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <div className="flex items-center gap-1 bg-white rounded-md border p-1 ml-4 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-bold" onClick={() => setCurrentDate(new Date())}>
                            Hoy
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Button className="shadow-sm" onClick={() => handleSlotClick(new Date(), 9)}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Cita (Rápida)
                </Button>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col bg-white shadow-md border rounded-xl">
                {/* Header Days */}
                <div className="grid grid-cols-8 border-b bg-gray-50">
                    <div className="p-4 border-r text-xs font-bold text-gray-500 text-center flex items-center justify-center">
                        HORA
                    </div>
                    {weekDays.map((day) => (
                        <div
                            key={day.toString()}
                            className={cn(
                                "p-3 text-center border-r last:border-r-0 min-w-[100px] transition-colors",
                                isSameDay(day, new Date()) ? "bg-primary/5" : ""
                            )}
                        >
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                                {format(day, 'EEE', { locale: es })}
                            </div>
                            <div className={cn(
                                "text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-all",
                                isSameDay(day, new Date()) ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-gray-900"
                            )}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-8">
                        {/* Time Column */}
                        <div className="border-r bg-gray-50/30">
                            {timeSlots.map((hour) => (
                                <div key={hour} className="h-24 border-b text-xs font-mono text-gray-400 p-2 text-right">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {weekDays.map((day) => (
                            <div key={`col-${day}`} className={cn(
                                "border-r last:border-r-0 relative bg-white",
                                isSameDay(day, new Date()) ? "bg-primary/5" : ""
                            )}>
                                {timeSlots.map((hour) => {
                                    const slotAppointments = getAppointmentsForSlot(day, hour)
                                    return (
                                        <div
                                            key={`${day}-${hour}`}
                                            className="h-24 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group relative p-1"
                                            onClick={() => handleSlotClick(day, hour)}
                                        >
                                            <div className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-primary/10 z-0">
                                                <Plus className="h-6 w-6 text-primary/40" />
                                            </div>

                                            {slotAppointments.map(apt => (
                                                <div
                                                    key={apt.id}
                                                    className="relative z-10 bg-primary/10 hover:bg-primary/20 text-primary-foreground text-xs p-2 rounded-md border border-primary/20 shadow-sm cursor-pointer mb-1 transition-transform hover:-translate-y-0.5 active:scale-95"
                                                    onClick={(e) => handleAppointmentClick(e, apt)}
                                                >
                                                    <div className="font-bold flex justify-between text-primary">
                                                        <span>{format(parseISO(apt.start_time), 'HH:mm')}</span>
                                                        <span className="opacity-70 text-[10px]">VER DETALLES</span>
                                                    </div>
                                                    <div className="truncate font-medium text-gray-900">{apt.patients?.name || 'Mascota'}</div>
                                                    <div className="text-[10px] text-gray-600 truncate">{apt.clients?.full_name || 'Dueño'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* NEW APPOINTMENT MODAL */}
            <Dialog open={showNewAppt} onOpenChange={setShowNewAppt}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Cita</DialogTitle>
                        <DialogDescription>
                            {selectedSlot && format(selectedSlot.date, "EEEE d 'de' MMMM", { locale: es })} a las {selectedSlot?.hour}:00 hrs
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Nombre del Dueño</Label>
                            <Input placeholder="Buscar cliente..." value={newApptData.client} onChange={e => setNewApptData({ ...newApptData, client: e.target.value })} autoFocus />
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre de Mascota</Label>
                            <Input placeholder="Ej. Firulais" value={newApptData.pet} onChange={e => setNewApptData({ ...newApptData, pet: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Cita</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newApptData.type} onChange={e => setNewApptData({ ...newApptData, type: e.target.value })}>
                                <option>Consulta General</option>
                                <option>Vacunación</option>
                                <option>Estética</option>
                                <option>Cirugía</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowNewAppt(false)}>Cancelar</Button>
                        <Button onClick={handleCreateAppointment}>Agendar Cita</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* APPOINTMENT ACTIONS MODAL */}
            {selectedAppointment && (
                <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detalles de la Cita</DialogTitle>
                            <DialogDescription>
                                {selectedAppointment.clients?.full_name} - {selectedAppointment.patients?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Button className="w-full bg-green-500 hover:bg-green-600 gap-2" onClick={handleWhatsApp}>
                                <MessageCircle className="h-4 w-4" /> WhatsApp
                            </Button>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => alert("Navegando a consulta...")}>
                                <AlertCircle className="h-4 w-4" /> Iniciar Consulta
                            </Button>
                            <Button variant="outline" className="w-full gap-2 text-red-600 border-red-200 bg-red-50 hover:bg-red-100" onClick={() => alert("Cita Cancelada")}>
                                <X className="h-4 w-4" /> Cancelar / No Show
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                                Reprogramar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
