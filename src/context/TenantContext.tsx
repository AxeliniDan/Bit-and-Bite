import { useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/features/auth/useAuth"
import { ClinicSettings, TenantContext } from './TenantContextType';

// Default Settings
const DEFAULT_SETTINGS: ClinicSettings = {
    modules: ['appointments', 'patients', 'pos', 'hospital', 'inventory', 'translator', 'admin'],
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
            navOrder: ['appointments', 'patients', 'hospital', 'pos', 'translator', 'inventory', 'admin']
        },
        branding: { logoUrl: null }
    }
};
export function TenantProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth()
    const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS)
    const [clinicId, setClinicId] = useState<string>("") // Empty by default
    const [isSuspended] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    useEffect(() => {
        const loadTenant = async () => {
            if (authLoading) return // Wait for Auth to finish

            if (!user) {
                // No user logged in? We DON'T return early anymore, we let it fall through to finally block for demo check
                setClinicId("")
                setIsSuperAdmin(false)
                // continue to finally...
            } else {
                // Only fetch profile if user exists
                try {
                    // Fetch User Profile AND Clinic Settings
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select(`
                        clinic_id, 
                        role, 
                        is_super_admin,
                        clinics (
                            settings
                        )
                    `)
                        .eq('id', user.id)
                        .single()

                    if (profileError) throw profileError

                    if (profile) {
                        if (profile.clinic_id) setClinicId(profile.clinic_id)
                        if (profile.is_super_admin) setIsSuperAdmin(true)

                        // LOAD SETTINGS FROM DB
                        // @ts-expect-error settings exists in clinics join
                        if (profile.clinics?.settings) {
                            // @ts-expect-error settings exists in clinics join
                            const dbSettings = profile.clinics.settings as ClinicSettings

                            // MIGRATION: Ensure 'translator' exists for old accounts
                            if (!dbSettings.modules.includes('translator')) {
                                dbSettings.modules.push('translator')
                            }
                            if (dbSettings.theme?.layout?.navOrder && !dbSettings.theme.layout.navOrder.includes('translator')) {
                                // Add before 'admin' or at the end
                                const adminIdx = dbSettings.theme.layout.navOrder.indexOf('admin')
                                if (adminIdx >= 0) {
                                    dbSettings.theme.layout.navOrder.splice(adminIdx, 0, 'translator')
                                } else {
                                    dbSettings.theme.layout.navOrder.push('translator')
                                }
                            }

                            setSettings(dbSettings)
                        }
                    }

                } catch (error) {
                    console.error("Failed to load tenant", error)
                }
            }

            // finally block handles checking for demo mode...
            setIsLoading(false) // Set loading false after check logic
        }

        // Wrap execution to use finally behavior simulation since we refactored try/catch
        const run = async () => {
            await loadTenant();
            // DEMO MODE CHECK (Moved here to ensure it runs always)
            if (window.location.hostname.includes("axelinidan.github.io") || window.location.hash.includes("demo_mode=true")) {
                if (!user) { // Only force demo if NOT logged in (to allow login on demo site)
                    console.log("Activating Demo Mode Settings")
                    setClinicId("demo-clinic")
                    setSettings({
                        modules: ['appointments', 'patients', 'pos', 'hospital', 'inventory', 'translator', 'admin'],
                        theme: {
                            tokens: DEFAULT_SETTINGS.theme!.tokens,
                            layout: {
                                mode: 'sidebar',
                                density: 'normal',
                                navOrder: ['appointments', 'patients', 'hospital', 'pos', 'translator', 'inventory', 'admin']
                            },
                            branding: { logoUrl: null }
                        }
                    })
                }
            }
        }
        run()
    }, [user, authLoading])

    const hasModule = useCallback((moduleName: string) => {
        if (isLoading) return true;
        return settings.modules.includes(moduleName);
    }, [isLoading, settings.modules]);

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


