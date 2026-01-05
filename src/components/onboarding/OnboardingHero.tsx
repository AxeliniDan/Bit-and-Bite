import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDemoData } from "@/hooks/useDemoData"
import { Database, Sparkles, Loader2 } from "lucide-react"

export function OnboardingHero() {
    const { seedData, isLoading } = useDemoData()

    return (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg mb-6 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
                        <span>¡Bienvenido a Bit and Bite!</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Tu clínica está lista para despegar 🚀</h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        Parece que este es un espacio nuevo. Para ayudarte a explorar todas las funciones, podemos cargar
                        datos de prueba realistas (pacientes, citas, inventario) con un solo clic.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                    <Button
                        onClick={seedData}
                        disabled={isLoading}
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold shadow-md transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando...
                            </>
                        ) : (
                            <>
                                <Database className="mr-2 h-5 w-5" /> Cargar Datos Demo
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
