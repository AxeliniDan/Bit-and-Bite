import { createContext } from 'react';

export interface ClinicSettings {
    modules: string[];
    theme?: {
        tokens: {
            palette: {
                primary: string;
                secondary: string;
                accent: string;
                background: string;
                surface: string;
                success: string;
                error: string;
            };
            radius: number;
        };
        layout: {
            mode: 'sidebar' | 'topbar' | 'rightbar';
            density: 'normal' | 'compact';
            navOrder: string[];
        };
        branding: {
            logoUrl?: string | null;
        }
    };
}

export interface TenantContextType {
    tenant: { id: string; name: string };
    settings: ClinicSettings;
    isLoading: boolean;
    setClinicId: (id: string) => void;
    isSuspended: boolean;
    hasModule: (moduleName: string) => boolean;
    isSuperAdmin: boolean;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
