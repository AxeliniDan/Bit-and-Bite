import { Ban, CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SuspendedLockScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-4">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">

                <div className="mx-auto bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/50">
                    <Ban className="h-12 w-12 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Acceso Suspendido</h1>
                    <p className="text-neutral-400">
                        La suscripción de esta clínica ha expirado o ha sido pausada por falta de pago.
                    </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg text-left space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-neutral-500" />
                        <span className="text-sm">Módulo de Pacientes: <span className="text-red-500 font-mono">LOCKED</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-neutral-500" />
                        <span className="text-sm">Agenda Médica: <span className="text-red-500 font-mono">LOCKED</span></span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Button
                        size="lg"
                        className="w-full bg-white text-black hover:bg-neutral-200 font-bold"
                        onClick={() => window.location.href = 'mailto:billing@bitandbite.io'}
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Actualizar Método de Pago
                    </Button>

                    <Button
                        variant="link"
                        className="text-neutral-500"
                        onClick={() => {
                            const code = prompt("Código de Super Admin:");
                            if (code === "godmode") {
                                window.location.hash = "#/super-admin";
                            }
                        }}
                    >
                        Soy el Administrador del Sistema
                    </Button>
                </div>

                <p className="text-xs text-neutral-700 font-mono mt-8">
                    ERR_SUBSCRIPTION_PAYMENT_REQUIRED
                </p>
            </div>
        </div>
    )
}
