import { Navigate } from "react-router-dom"
import { useTenant } from "@/context/TenantContext"
import { useAuth } from "@/features/auth/AuthContext"
import { SidebarShell } from "./SidebarShell"
import { TopbarShell } from "./TopbarShell"
import { RightbarShell } from "./RightbarShell"
import { SuspendedLockScreen } from "@/components/common/SuspendedLockScreen";
import { UpdateNotification } from "@/components/devops/UpdateNotification";

export function AppShell() {
    const { settings, isSuspended } = useTenant()
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

    if (!user) {
        return <Navigate to="/login" />
    }

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
