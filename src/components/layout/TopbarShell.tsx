import { useAuth } from "@/features/auth/AuthContext"
import { FeatureGuard } from "@/components/auth/FeatureGuard"
import { Outlet, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/common/CommandPalette"
import { VoiceMicButton } from "@/features/smart-consult/VoiceMicButton"
import { useTenant } from "@/context/TenantContext"

export function TopbarShell() {
    const { signOut, profile } = useAuth()
    const { settings } = useTenant()

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            {/* Top Navigation Bar - Centered Content */}
            <header className="bg-white border-b sticky top-0 z-40 shadow-sm backdrop-blur-xl bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-8">
                        {settings.theme?.branding?.logoUrl ? (
                            <img src={settings.theme.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
                        ) : (
                            <div className="font-bold text-xl text-primary tracking-tight">Bit and Bite 🐾</div>
                        )}

                        {/* Desktop Nav - Centered/Next to logo */}
                        <nav className="hidden md:flex items-center gap-2">
                            {(settings.theme?.layout?.navOrder || ['appointments', 'patients', 'pos', 'inventory', 'hospital', 'translator', 'admin']).map((module: string) => {
                                const baseClass = "px-3 py-2 text-sm font-medium rounded-full transition-all hover:bg-primary/10 hover:text-primary text-gray-600"

                                if (module === 'appointments') return (
                                    <Link key="appt" to="/" className={baseClass}>Agenda</Link>
                                )
                                if (module === 'patients') return (
                                    <Link key="patients" to="/patients" className={baseClass}>Pacientes</Link>
                                )
                                return (
                                    <FeatureGuard key={module} module={module}>
                                        <Link to={`/${module === 'admin' ? 'admin' : module}`} className={`${baseClass} capitalize`}>
                                            {module === 'pos' ? 'Punto de Venta' :
                                                module === 'translator' ? 'Traductor' : module}
                                        </Link>
                                    </FeatureGuard>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex relative items-center text-sm text-muted-foreground bg-gray-100/50 px-3 py-1.5 rounded-full border cursor-pointer hover:bg-gray-200/50 transition-colors" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
                            <span className="mr-2">Buscar...</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 leading-none">{profile?.full_name || "Usuario"}</p>
                                <p className="text-xs text-gray-500">{profile?.role}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={signOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Centered */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <CommandPalette />
            <VoiceMicButton />
        </div>
    )
}
