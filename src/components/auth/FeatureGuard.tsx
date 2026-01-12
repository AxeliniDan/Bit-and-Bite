import { ReactNode } from 'react';
import { useTenant } from '@/context/useTenant';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGuardProps {
    module: string;
    children: ReactNode;
    fallback?: ReactNode;
    showLock?: boolean; // If true, shows a lock UI instead of null
}

export function FeatureGuard({ module, children, fallback = null, showLock = false }: FeatureGuardProps) {
    const { hasModule, isLoading } = useTenant();

    if (isLoading) return null; // Or a skeleton

    if (hasModule(module)) {
        return <>{children}</>;
    }

    if (showLock) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-center opacity-70 hover:opacity-100 transition-opacity">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                    <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">Módulo Bloqueado</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">
                    Tu plan actual no incluye acceso al módulo <strong>{module}</strong>.
                </p>
                <Button variant="outline" size="sm" onClick={() => alert("Contactar Ventas")}>
                    Actualizar Plan
                </Button>
            </div>
        );
    }

    return <>{fallback}</>;
}
