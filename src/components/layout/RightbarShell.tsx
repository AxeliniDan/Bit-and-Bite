import { useAuth } from "@/features/auth/AuthContext"
import { Outlet, Link } from "react-router-dom"
import { SidebarNav } from "./SidebarNav"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/common/CommandPalette"
import { VoiceMicButton } from "@/features/smart-consult/VoiceMicButton"
import { useTenant } from "@/context/TenantContext"
import { LogOut, LayoutDashboard, Users, Stethoscope, ShoppingCart, TableProperties, ShieldAlert, Bug } from "lucide-react"
import * as Sentry from "@sentry/react"

function ErrorButton() {
    return (
        <Button
            variant="destructive"
            size="sm"
            className="w-full mb-2 bg-red-600 hover:bg-red-700"
            onClick={() => {
                Sentry.logger.info('User triggered test error', { action: 'test_error_button_click' });
                Sentry.metrics.count('test_counter', 1);
                throw new Error('This is your first error!');
            }}
        >
            <Bug className="mr-2 h-4 w-4" />
            BREAK THE WORLD
        </Button>
    );
}

export function RightbarShell() {
    const { signOut, profile } = useAuth()
    const { settings } = useTenant()

    const theme = settings.theme || {
        layout: { navOrder: [] },
        branding: { logoUrl: null }
    };

    // Convert Config to Menu Items
    const navOrder = theme.layout?.navOrder || [];
    const menuItems = navOrder.map((module: string) => {
        switch (module) {
            case 'appointments': return { title: "Agenda_", href: "/", icon: LayoutDashboard }
            case 'patients': return { title: "Pacientes_", href: "/patients", icon: Users }
            case 'hospital': return { title: "Hospital_", href: "/hospital", icon: Stethoscope }
            case 'pos': return { title: "Terminal_POS", href: "/pos", icon: ShoppingCart }
            case 'inventory': return { title: "Inventario_", href: "/inventory", icon: TableProperties }
            case 'admin': return { title: "Sys_Admin", href: "/admin", icon: ShieldAlert }
            default: return { title: `${module}_`, href: `/${module}` }
        }
    })

    return (
        <div className="min-h-screen flex bg-background font-mono text-foreground">

            {/* MAIN CONTENT - Padded Right (UI Law: Standard Padding inside) */}
            <div className="mr-64 flex-1 flex flex-col min-h-screen">
                <main className="flex-1 p-6 lg:p-8 space-y-6">
                    <Outlet />
                </main>
            </div>

            {/* RIGHT SIDEBAR - Fixed w-64 */}
            <aside className="w-64 bg-card border-l border-border h-full flex flex-col fixed right-0 top-0 bottom-0 z-50 shadow-2xl">
                <div className="h-16 flex items-center justify-end px-6 border-b border-border bg-card/50 backdrop-blur-md">
                    {theme.branding?.logoUrl ? (
                        <img src={theme.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
                    ) : (
                        <div className="font-bold text-xl tracking-widest text-primary uppercase animate-pulse">Bit/Bite_</div>
                    )}
                </div>

                <div className="flex-1 py-6 px-4 overflow-y-auto">
                    {/* Reusing Standard Component but it will inherit Font Mono and Cyber Colors */}
                    <SidebarNav items={menuItems} className="items-end" />
                </div>

                <div className="p-4 border-t border-border bg-card/50">
                    <div className="flex flex-col items-end gap-1 mb-4 px-2 text-right">
                        <span className="text-sm font-bold text-foreground truncate">{profile?.full_name || "USR_001"}</span>
                        <span className="text-[10px] text-primary uppercase tracking-widest">{profile?.role} // CONNECTED</span>
                    </div>

                    {/* SENTRY TEST BUTTON */}
                    <ErrorButton />

                    <Link to="/legal/privacy" className="text-[10px] text-muted-foreground hover:text-primary block text-right mb-2 transition-colors">
                        Política de Privacidad
                    </Link>

                    <Button variant="destructive" size="sm" onClick={signOut} className="w-full font-bold tracking-wider rounded-none">
                        <LogOut className="mr-2 h-4 w-4" />
                        DISCONNECT
                    </Button>
                </div>
            </aside>

            <CommandPalette />
            <VoiceMicButton />
        </div>
    )
}
