import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/lib/supabase"

// Types
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
        branding: { // Keep legacy branding inside theme for logo
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

// Default Settings
const DEFAULT_SETTINGS: ClinicSettings = {
    modules: ['appointments', 'patients', 'pos', 'hospital', 'inventory', 'admin'],
    theme: {
        tokens: {
            palette: {
                primary: '#2563eb', // Standard Blue
                secondary: '#64748b', // Slate
                accent: '#f59e0b', // Amber
                background: '#ffffff', // White
                surface: '#ffffff', // White (Card)
                success: '#22c55e',
                error: '#ef4444'
            },
            radius: 0.5
        },
        layout: {
            mode: 'sidebar', // Standard Sidebar
            density: 'normal',
            navOrder: ['appointments', 'patients', 'hospital', 'pos', 'admin', 'inventory']
        },
        branding: { logoUrl: null }
    }
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const [settings] = useState<ClinicSettings>(DEFAULT_SETTINGS)
    const [clinicId, setClinicId] = useState<string>("") // Empty by default
    const [isSuspended] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    useEffect(() => {
        const loadTenant = async () => {
            setIsLoading(true)
            try {
                // 1. Check current session
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.user) {
                    // No user logged in
                    setClinicId("")
                    setIsSuperAdmin(false)
                    setIsLoading(false)
                    return
                }

                // 2. Fetch User Profile to get Clinic ID
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('clinic_id, role, is_super_admin')
                    .eq('id', session.user.id)
                    .single()

                if (profileError) throw profileError

                if (profile) {
                    if (profile.clinic_id) setClinicId(profile.clinic_id)
                    if (profile.is_super_admin) setIsSuperAdmin(true)
                }

            } catch (error) {
                console.error("Failed to load tenant", error)
                // Fallback to demo if auth fails? No, better to force login.
            } finally {
                setIsLoading(false)
            }
        }

        // Listen for Auth Changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadTenant()
            } else if (event === 'SIGNED_OUT') {
                setClinicId("")
                setIsSuperAdmin(false)
            }
        })

        loadTenant()

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    const hasModule = (moduleName: string) => {
        if (isLoading) return true;
        return settings.modules.includes(moduleName);
    };

    return (
        <TenantContext.Provider value={{
            tenant: { id: clinicId, name: "Demo Clinc" }, // Name would come from DB
            settings,
            isLoading,
            setClinicId,
            isSuspended,
            hasModule,
            isSuperAdmin
        }}>
            {children}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
