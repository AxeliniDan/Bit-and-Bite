import { Navigate } from "react-router-dom"
import { useTenant } from "@/context/useTenant"
import { useAuth } from "@/features/auth/useAuth"
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

    return (
        <>
            {settings.theme?.layout?.mode === 'topbar' ? <TopbarShell /> :
                settings.theme?.layout?.mode === 'rightbar' ? <RightbarShell /> :
                    <SidebarShell />}
            <UpdateNotification />
        </>
    )
}
