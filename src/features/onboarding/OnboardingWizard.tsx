import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronRight, Stethoscope, Palette } from "lucide-react"

type Step = 'info' | 'theme' | 'finish';

export function OnboardingWizard() {
    const [step, setStep] = useState<Step>('info');
    const [formData, setFormData] = useState({
        clinicName: '',
        taxId: '',
        primaryColor: '#2563eb',
        radius: '0.5'
    });

    const handleNext = () => {
        if (step === 'info') setStep('theme');
        else if (step === 'theme') setStep('finish');
        else window.location.href = '/'; // Finish
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        {step === 'info' && <Stethoscope className="h-6 w-6 text-primary" />}
                        {step === 'theme' && <Palette className="h-6 w-6 text-primary" />}
                        {step === 'finish' && <Check className="h-6 w-6 text-green-500" />}
                        <CardTitle>
                            {step === 'info' && "Configura tu Clínica"}
                            {step === 'theme' && "Personaliza tu Marca"}
                            {step === 'finish' && "¡Todo Listo!"}
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {step === 'info' && "Empecemos con lo básico. Esta información aparecerá en tus recetas."}
                        {step === 'theme' && "Elige los colores que representan a tu marca."}
                        {step === 'finish' && "Tu sistema está configurado y listo para recibir pacientes."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {step === 'info' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1">
                                <Label htmlFor="name">Nombre de la Clínica</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej. Veterinaria San Francisco"
                                    value={formData.clinicName}
                                    onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tax">Razón Social / RFC</Label>
                                <Input
                                    id="tax"
                                    placeholder="Opcional"
                                    value={formData.taxId}
                                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'theme' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Color Principal</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            type="color"
                                            className="w-12 h-12 p-1 rounded-md cursor-pointer"
                                            value={formData.primaryColor}
                                            onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                        />
                                        <span className="font-mono text-xs">{formData.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estilo de Bordes</Label>
                                    <div className="flex gap-2">
                                        <div
                                            className={`h-10 w-10 border-2 flex items-center justify-center cursor-pointer ${formData.radius === '0' ? 'border-primary bg-primary/10' : 'border-slate-200'}`}
                                            onClick={() => setFormData({ ...formData, radius: '0' })}
                                        >
                                            <div className="w-4 h-4 bg-slate-900"></div>
                                        </div>
                                        <div
                                            className={`h-10 w-10 border-2 rounded-md flex items-center justify-center cursor-pointer ${formData.radius === '0.5' ? 'border-primary bg-primary/10' : 'border-slate-200'}`}
                                            onClick={() => setFormData({ ...formData, radius: '0.5' })}
                                        >
                                            <div className="w-4 h-4 bg-slate-900 rounded-sm"></div>
                                        </div>
                                        <div
                                            className={`h-10 w-10 border-2 rounded-full flex items-center justify-center cursor-pointer ${formData.radius === '1' ? 'border-primary bg-primary/10' : 'border-slate-200'}`}
                                            onClick={() => setFormData({ ...formData, radius: '1' })}
                                        >
                                            <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Vista Previa</p>
                                <Button style={{ backgroundColor: formData.primaryColor, borderRadius: `${formData.radius}rem` }}>
                                    Botón de Ejemplo
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'finish' && (
                        <div className="text-center py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Configuración Completa</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Hemos guardado tus preferencias. Ahora puedes empezar a usar el sistema.
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
                    {step !== 'info' && step !== 'finish' && (
                        <Button variant="ghost" onClick={() => setStep('info')}>Atrás</Button>
                    )}
                    {step === 'info' && <div></div>} {/* Spacer */}

                    <Button onClick={handleNext} className={step === 'finish' ? "w-full" : ""}>
                        {step === 'finish' ? "Ir al Dashboard" : (
                            <>
                                Siguiente
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
