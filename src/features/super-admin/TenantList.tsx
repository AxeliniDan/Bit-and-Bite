import { useState, useEffect } from "react"
import { getTenants, Tenant } from "./mockTenants"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Ban, CheckCircle, LogIn, ExternalLink } from "lucide-react"
import { useTenant } from "@/context/TenantContext"
import { useNavigate } from "react-router-dom"

export function TenantList() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const { setClinicId } = useTenant() // We need to expose this or manually set LS
    const navigate = useNavigate()

    useEffect(() => {
        setTenants(getTenants())
    }, [])

    const handleLoginAs = (tenantId: string) => {
        // Logic to simulate login as this tenant
        // In a real app, this would get a one-time token
        // Here we just verify it exists and alert the user (since Auth is mocked)

        if (confirm(`¿Entrar al panel de ${tenantId}?`)) {
            // Force context switch (This is a hack for the demo)
            // In reality, this requires updating the User Profile's assigned Tenant
            console.log("Switching to", tenantId);
            // Ideally TenantContext detects this change if we update a "current_tenant" localstorage key
            localStorage.setItem('demo_clinic_id', tenantId);
            window.location.href = "/"; // Hard Reload to trigger Context
        }
    }

    const toggleStatus = (tenant: Tenant) => {
        const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
        const updated = tenants.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t);
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Ingresos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="font-mono text-xs">{tenant.id}</TableCell>
                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                <TableCell>
                                    <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}
                                        className={tenant.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                        {tenant.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="uppercase text-xs">{tenant.plan}</TableCell>
                                <TableCell>${tenant.revenue}</TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
