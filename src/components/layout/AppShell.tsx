import { Navigate } from "react-router-dom"
import { useTenant } from "@/context/TenantContext"
import { useAuth } from "@/features/auth/AuthContext"
import { SidebarShell } from "./SidebarShell"
import { TopbarShell } from "./TopbarShell"
import { RightbarShell } from "./RightbarShell"
import { TenantList } from "@/features/super-admin/TenantList";
import { Button } from "@/components/ui/button";
import { SuspendedLockScreen } from "@/components/common/SuspendedLockScreen";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";
import { UpdateNotification } from "@/components/devops/UpdateNotification";

export function AppShell() {
    const { settings, isSuspended } = useTenant()
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

    if (!user) {
        return <Navigate to="/login" />
    }

    // TEMPORARY ROUTE HACKS
    if (window.location.pathname === '/super-admin') {
        return (
            <div className="min-h-screen bg-neutral-950 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-red-500">SUPER ADMIN /// GOD MODE</h1>
                        <Button variant="secondary" onClick={() => window.location.href = '/'}>Volver a la App</Button>
                    </div>
                    <TenantList />
                </div>
            </div>
        )
    }

    if (window.location.pathname === '/onboarding') {
        return <OnboardingWizard />
    }

    // MOUNT UPDATER GLOBALLY
    // It will be invisible unless an update is found
    // We place it here so it works on any route (except super-admin specialized view above, but we could move it up if needed)

    // SUSPENSION LOCK
    // If tenant is suspended, block access to everything else
    if (isSuspended) {
        return <SuspendedLockScreen />
    }

    // Layout Engine Router
    const Layout = () => {
        if (settings.theme?.layout?.mode === 'topbar') return <TopbarShell />
        if (settings.theme?.layout?.mode === 'rightbar') return <RightbarShell />
        return <SidebarShell />
    }

    return (
        <>
            <Layout />
            <UpdateNotification />
        </>
    )
}
