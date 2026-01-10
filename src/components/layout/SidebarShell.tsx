import { useAuth } from "@/features/auth/AuthContext"
import { Outlet } from "react-router-dom"
import { SidebarNav } from "./SidebarNav"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/common/CommandPalette"
import { VoiceMicButton } from "@/features/smart-consult/VoiceMicButton"
import { useTenant } from "@/context/TenantContext"
import { User, LogOut, LayoutDashboard, Users, Stethoscope, ShoppingCart, TableProperties, ShieldAlert, Bug, Languages } from "lucide-react"
import * as Sentry from "@sentry/react"

function ErrorButton() {
    return (
        <Button
            variant="destructive"
            size="sm"
            className="w-full mb-2 bg-red-600 hover:bg-red-700 justify-start"
            onClick={() => {
                Sentry.logger.info('User triggered test error', { action: 'test_error_button_click' });
                Sentry.metrics.count('test_counter', 1);
                throw new Error('This is your first error!');
            }}
        >
            <Bug className="mr-2 h-4 w-4" />
            Test Error
        </Button>
    );
}

export function SidebarShell() {
    const { signOut, profile } = useAuth()
    const { settings, isSuperAdmin } = useTenant()

    const theme = settings.theme || {
        layout: { navOrder: [] },
        branding: { logoUrl: null },
        tokens: { radius: 0.5 }
    };

    // Convert Config to Menu Items (UI Law: Semantic Structure)
    const navOrder = theme.layout?.navOrder || [];
    const menuItems = navOrder.map((module: string) => {
        switch (module) {
            case 'appointments': return { title: "Agenda", href: "/", icon: LayoutDashboard }
            case 'patients': return { title: "Pacientes", href: "/patients", icon: Users }
            case 'hospital': return { title: "Hospital", href: "/hospital", icon: Stethoscope }
            case 'pos': return { title: "Caja (POS)", href: "/pos", icon: ShoppingCart }
            case 'inventory': return { title: "Inventario", href: "/inventory", icon: TableProperties }
            case 'translator': return { title: "Traductor", href: "/translator", icon: Languages }
            case 'admin': return { title: "Admin", href: "/admin", icon: ShieldAlert }
            default: return { title: module, href: `/${module}` }
        }
    })

    return (
        <div className="min-h-screen flex bg-background font-sans antialiased text-foreground">
            {/* SIDEBAR - Fixed w-64 */}
            <aside className="w-64 bg-card border-r border-border h-full flex flex-col fixed left-0 top-0 bottom-0 z-50">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    {theme.branding?.logoUrl ? (
                        <img src={theme.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
                    ) : (
                        <div className="font-bold text-xl tracking-tight text-primary">Bit and Bite 🐾</div>
                    )}
                </div>

                <div className="flex-1 py-6 px-4 overflow-y-auto">
                    <SidebarNav items={menuItems} />

                    {isSuperAdmin && (
                        <div className="mt-8 pt-4 border-t border-dashed border-border">
                            <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Sistema
                            </div>
                            <Button variant="ghost" className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" asChild>
                                <a href="/super-admin">
                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                    Super Admin
                                </a>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-card">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{profile?.full_name}</span>
                            <span className="text-xs text-muted-foreground capitalize truncate">{profile?.role}</span>
                        </div>
                    </div>

                    <ErrorButton />

                    <Button variant="outline" size="sm" onClick={signOut} className="w-full justify-start text-muted-foreground hover:text-foreground">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT - Standard Padding */}
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="flex-1 p-6 lg:p-8 space-y-6">
                    <Outlet />
                </div>
            </main>

            <CommandPalette />
            <VoiceMicButton />
        </div>
    )
}
