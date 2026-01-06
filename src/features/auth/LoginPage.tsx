import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [clinicName, setClinicName] = useState("")
    const [doctorName, setDoctorName] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate("/") // AuthListener in TenantContext handles the rest
            } else {
                // REGISTER LOGIC
                if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden")
                if (!clinicName) throw new Error("Ingresa el nombre de tu clínica")

                // 1. Create User
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (signUpError) throw signUpError
                if (!authData.user) throw new Error("Error creando usuario")

                const userId = authData.user.id

                // 2. Create the Clinic (Tenant)
                // Note: RLS must allow this insert. Assuming 'clinics' allows insert for authenticated users (which are technically auth'd even if anon initially? Or we use signUp data). 
                // Wait: signUp might not auto-login immediately if email confirm is on.
                // Assuming email confirm is OFF for this prototype or we handle it.

                // CRITICAL: We need to act as the user. If signUp auto-logs-in, we are good.

                const { data: clinic, error: clinicError } = await supabase
                    .from('clinics')
                    .insert({ name: clinicName, search_code: Math.random().toString(36).substring(7) })
                    .select()
                    .single()

                if (clinicError) {
                    console.error("Clinic Error", clinicError)
                    throw new Error("Error creando la clínica. Intenta de nuevo.")
                }

                // 3. Create Profile linked to Clinic
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        clinic_id: clinic.id,
                        full_name: doctorName,
                        role: 'owner'
                    })

                if (profileError) throw profileError

                alert("¡Cuenta creada exitosamente!")
                navigate("/")
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Bit and Bite</CardTitle>
                    <CardDescription className="text-center">
                        {mode === 'login' ? 'Ingresa a tu cuenta clínica' : 'Crea tu nueva clínica digital'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        {mode === 'register' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Nombre de la Clínica</Label>
                                    <Input
                                        value={clinicName}
                                        onChange={e => setClinicName(e.target.value)}
                                        placeholder="Ej. Veterinaria San Francisco"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tu Nombre (Doctor)</Label>
                                    <Input
                                        value={doctorName}
                                        onChange={e => setDoctorName(e.target.value)}
                                        placeholder="Ej. Dr. Tadeo"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@clinica.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {mode === 'register' && (
                            <div className="space-y-2">
                                <Label>Confirmar Contraseña</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" type="submit" disabled={loading}>
                            {loading ? "Procesando..." : (mode === 'login' ? "Iniciar Sesión" : "Registrar Clínica")}
                        </Button>

                        <div className="text-center text-sm pt-2">
                            {mode === 'login' ? (
                                <p className="text-gray-500">¿No tienes cuenta? <span className="text-indigo-600 cursor-pointer font-semibold hover:underline" onClick={() => setMode('register')}>Regístrate aquí</span></p>
                            ) : (
                                <p className="text-gray-500">¿Ya tienes cuenta? <span className="text-indigo-600 cursor-pointer font-semibold hover:underline" onClick={() => setMode('login')}>Inicia Sesión</span></p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
