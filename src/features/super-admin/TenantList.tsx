import { useState, useEffect } from "react"
import { getTenants, Tenant } from "./mockTenants"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Ban, CheckCircle, LogIn } from "lucide-react"
// import { useTenant } from "@/context/TenantContext"
// import { useNavigate } from "react-router-dom"

export function TenantList() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    // const { setClinicId } = useTenant() 
    // const navigate = useNavigate()

    useEffect(() => {
        setTenants(getTenants())
    }, [])

    const handleLoginAs = (tenantId: string) => {
        // Logic to simulate login as this tenant
        if (confirm(`¿Entrar al panel de ${tenantId}?`)) {
            console.log("Switching to", tenantId);
            localStorage.setItem('demo_clinic_id', tenantId);
            window.location.hash = "#/"; // Update hash to trigger HashRouter
            window.location.reload(); // Force reload to ensure context updates with new clinicId
        }
    }

    const toggleStatus = (tenant: Tenant) => {
        const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
        // Fix Type Mismatch by casting or ensuring string matches union
        const updated = tenants.map(t => t.id === tenant.id ? { ...t, status: newStatus as "active" | "suspended" | "trial" } : t);
        setTenants(updated);
        localStorage.setItem('saas_tenants', JSON.stringify(updated));
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Clínicas Registradas ({tenants.length})</CardTitle>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Clínica
                </Button>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ingresos</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-mono text-xs">{tenant.id}</td>
                                    <td className="p-4 align-middle font-medium">{tenant.name}</td>
                                    <td className="p-4 align-middle">
                                        <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}
                                            className={tenant.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {tenant.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle uppercase text-xs">{tenant.plan}</td>
                                    <td className="p-4 align-middle">${tenant.revenue}</td>
                                    <td className="p-4 align-middle text-right flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleLoginAs(tenant.id)} title="Login As">
                                            <LogIn className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStatus(tenant)}
                                            className={tenant.status === 'active' ? "text-destructive" : "text-green-600"}
                                            title={tenant.status === 'active' ? "Suspender" : "Activar"}
                                        >
                                            {tenant.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
