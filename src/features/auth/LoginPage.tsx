import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (signInError) throw signInError
            navigate("/")
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-slate-900">Bit&Bite v0.2</CardTitle>
                    <CardDescription>
                        Ingresa a tu Clínica Veterinaria
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(error) && (
                        <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="doctor@clinica.com"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800" type="submit" disabled={loading}>
                            {loading ? "Verificando..." : "Iniciar Sesión"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <a href="/about" className="text-primary hover:underline mb-2 block text-sm font-medium">
                            Conoce más sobre nosotros (Bit and Bite)
                        </a>
                        <p>¿No tienes cuenta? Contacta al administrador.</p>
                        <p className="mt-1">Acceso restringido a personal autorizado.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
