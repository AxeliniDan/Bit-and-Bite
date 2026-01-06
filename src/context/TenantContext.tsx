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
    const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS)
    const [clinicId, setClinicId] = useState<string>("c-demo-001") // Default ID
    const [isSuspended, setIsSuspended] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Helper: Convert Hex to HSL (Space separated, no %) for Shadcn
    const hexToCurrentShadcnFormat = (hex: string) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]);
            g = parseInt("0x" + hex[2] + hex[2]);
            b = parseInt("0x" + hex[3] + hex[3]);
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]);
            g = parseInt("0x" + hex[3] + hex[4]);
            b = parseInt("0x" + hex[5] + hex[6]);
        }

        r /= 255; g /= 255; b /= 255;
        const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
        let h = 0, s = 0, l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return `${h} ${s}% ${l}%`;
    };

    useEffect(() => {
        const loadTenant = async () => {
            setIsLoading(true)
            try {
                // 1. Check current session
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.user) {
                    // No user logged in
                    setClinicId("")
                    setIsLoading(false)
                    return
                }

                // 2. Fetch User Profile to get Clinic ID
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('clinic_id, role')
                    .eq('id', session.user.id)
                    .single()

                if (profileError) throw profileError

                if (profile?.clinic_id) {
                    setClinicId(profile.clinic_id)

                    // 3. Optional: Fetch Clinic Settings or Details if needed
                    // For now we assume default settings + dynamic theme
                    // In future: const { data: clinic } = ...
                }

            } catch (error) {
                console.error("Failed to load tenant", error)
                // Fallback to demo if auth fails? No, better to force login.
            } finally {
                setIsLoading(false)
            }
        }

        // Listen for Auth Changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadTenant()
            } else if (event === 'SIGNED_OUT') {
                setClinicId("")
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
            hasModule
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
