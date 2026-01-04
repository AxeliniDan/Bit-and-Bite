import { useState, useEffect } from "react"
import { AIConsultResult } from "./aiConsultService"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, UserPlus, Search, Stethoscope, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface VoiceResolutionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    result: AIConsultResult | null
    isLoading: boolean
}

export function VoiceResolutionDialog({ open, onOpenChange, result, isLoading }: VoiceResolutionDialogProps) {
    const [step, setStep] = useState<'MATCHING' | 'FORM'>('MATCHING')

    // Reset step when dialog opens
    useEffect(() => {
        if (open && result) {
            setStep('MATCHING')
        }
    }, [open, result])

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center py-12">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin relative z-10" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Procesando Consulta...</h3>
                    <p className="text-gray-500 text-center text-sm px-4 mt-2">
                        Analizando audio, transcribiendo y estructurando datos clínicos.
                    </p>
                </DialogContent>
            </Dialog>
        )
    }

    if (!result) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                        Consulta Inteligente
                    </DialogTitle>
                    <DialogDescription>
                        IA ha detectado los siguientes datos. Verifica y confirma.
                    </DialogDescription>
                </DialogHeader>

                {step === 'MATCHING' && (
                    <div className="grid gap-6 py-4">
                        {/* 1. Patient Detection Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">1. Paciente Detectado</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Card className={`p-4 border-2 cursor-pointer transition-all ${!result.datos_identificacion.es_nuevo_paciente_probable ? 'border-blue-500 bg-blue-50' : 'border-dashed hover:border-gray-400'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <Search className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Buscar Existente</div>
                                                <div className="text-sm text-gray-500">
                                                    "{result.datos_identificacion.nombre_paciente}" de {result.datos_identificacion.nombre_dueno || "?"}
                                                </div>
                                            </div>
                                        </div>
                                        {!result.datos_identificacion.es_nuevo_paciente_probable && <Check className="h-5 w-5 text-blue-600" />}
                                    </div>
                                    {!result.datos_identificacion.es_nuevo_paciente_probable && (
                                        <div className="mt-4 text-xs text-blue-700 bg-blue-100/50 p-2 rounded">
                                            Coincidencia probable encontrada en base de datos.
                                        </div>
                                    )}
                                </Card>

                                <Card className={`p-4 border-2 cursor-pointer transition-all ${result.datos_identificacion.es_nuevo_paciente_probable ? 'border-green-500 bg-green-50' : 'border-dashed hover:border-gray-400'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <UserPlus className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Registrar Nuevo</div>
                                                <div className="text-sm text-gray-500">
                                                    Crear expediente
                                                </div>
                                            </div>
                                        </div>
                                        {result.datos_identificacion.es_nuevo_paciente_probable && <Check className="h-5 w-5 text-green-600" />}
                                    </div>
                                    <ul className="mt-4 space-y-1 text-xs text-gray-600">
                                        <li>• Nombre: <strong>{result.datos_identificacion.nombre_paciente}</strong></li>
                                        <li>• Raza: <strong>{result.datos_identificacion.especie_raza_detectada}</strong></li>
                                        <li>• Peso: <strong>{result.datos_identificacion.peso_detectado}</strong></li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        {/* 2. Clinical Summary Preview */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">2. Resumen Clínico Generado</h3>
                            <div className="bg-gray-50 p-4 rounded-md border text-sm space-y-2">
                                <p><strong>Motivo:</strong> {result.resumen_clinico.motivo_consulta}</p>
                                <p><strong>Diagnóstico Presuntivo:</strong> <span className="text-amber-700 bg-amber-50 px-1 rounded font-medium">{result.resumen_clinico.diagnostico_presuntivo}</span></p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button onClick={() => setStep('FORM')}>Continuar y Validar</Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'FORM' && (
                    <div className="grid gap-6 py-4">
                        <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-md flex items-center gap-2 text-sm text-blue-700">
                            <Check className="h-4 w-4" /> Datos precargados por IA. Edita si es necesario.
                        </div>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Subjetivo</Label>
                                <Textarea className="col-span-3 h-20" defaultValue={result.resumen_clinico.subjetivo} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Objetivo</Label>
                                <Textarea className="col-span-3 h-20" defaultValue={result.resumen_clinico.objetivo} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Plan (Rx)</Label>
                                <Textarea className="col-span-3 h-24 font-mono text-sm bg-gray-50" defaultValue={result.resumen_clinico.plan_tratamiento} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep('MATCHING')}>Atrás</Button>
                            <Button className="bg-green-600 hover:bg-green-700">Confirmar y Guardar Consulta</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
