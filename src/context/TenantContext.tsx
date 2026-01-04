import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

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

// Supabase Client (Normally imported from lib/supabase)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
                // 1. Check Mock "Database" (saas_tenants) for Status
                const allTenantsStr = localStorage.getItem('saas_tenants');
                if (allTenantsStr) {
                    const allTenants = JSON.parse(allTenantsStr);
                    const currentTenant = allTenants.find((t: any) => t.id === clinicId);

                    // Check suspended status
                    if (currentTenant && currentTenant.status === 'suspended') {
                        setIsSuspended(true);
                    } else {
                        setIsSuspended(false);
                    }
                }

                // 2. Load Settings (Simulated by LocalStorage for Demo)
                // In real app, we would fetch /api/tenants/{clinicId}/settings
                // Note: Each mock tenant should ideally have its own storage key, e.g. `settings_${clinicId}`
                // For now, we fallback to the shared demo settings or default if not found.

                // MOCK LOGIC for Dynamic Settings per tenant:
                // Try to load specifics, else demo, else defaults.
                const storedSettings = localStorage.getItem(`settings_${clinicId}`) || localStorage.getItem('demo_clinic_settings');
                let parsedSettings = storedSettings ? JSON.parse(storedSettings) : null;

                // RESET / MIGRATION LOGIC
                if (parsedSettings && !parsedSettings.theme) {
                    console.log("Migrating legacy settings to Standard Theme");
                    parsedSettings = DEFAULT_SETTINGS;
                }

                const currentSettings = parsedSettings || DEFAULT_SETTINGS;
                setSettings(currentSettings);

                // 3. Inject Theme Tokens (Dynamic CSS Variables)
                if (currentSettings.theme) {
                    const theme = currentSettings.theme;
                    const root = document.documentElement;

                    // Inject Palette
                    if (theme.tokens?.palette) {
                        try {
                            const p = theme.tokens.palette;
                            const setHslProxy = (name: string, hex: string) => {
                                try {
                                    root.style.setProperty(`--${name}`, hexToCurrentShadcnFormat(hex));
                                } catch (e) { /* ignore */ }
                            };

                            setHslProxy('primary', p.primary);
                            if (p.background) setHslProxy('background', p.background);
                            if (p.secondary) setHslProxy('secondary', p.secondary);
                            if (p.accent) setHslProxy('accent', p.accent);
                            if (p.surface) {
                                setHslProxy('card', p.surface);
                                setHslProxy('popover', p.surface);
                            }
                            if (p.success) setHslProxy('destructive', p.error);

                        } catch (e) { console.error("Theme injection failed", e); }
                    }

                    // Inject Radius
                    if (theme.tokens?.radius !== undefined) {
                        root.style.setProperty('--radius', `${theme.tokens.radius}rem`);
                    }
                }

            } catch (error) {
                console.error("Failed to load tenant", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadTenant()
    }, [clinicId]) // Re-run when clinicId changes (Super Admin switch)

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
