import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                // DEMO MODE CHECK
                // Only activate demo mode if explicitly flag is present in URL
                // This prevents forcing demo mode on GH Pages when a real user wants to login
                if (window.location.hash.includes("demo_mode=true")) {
                    console.log("⚠️ DEMO MODE ACTIVATED (Initial)")
                    const demoUser = { id: "demo-user", email: "demo@bitandbite.com", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: new Date().toISOString() } as User
                    setUser(demoUser)
                    setSession({ user: demoUser, access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer" } as Session)
                    // Mock Profile
                    setProfile({ id: "demo-user", first_name: "Demo", last_name: "User", clinic_id: "demo-clinic", role: "admin", is_super_admin: false, created_at: new Date().toISOString() } as any)
                }
                setLoading(false)
            }
        })

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                // DEMO MODE CHECK
                if (window.location.hash.includes("demo_mode=true")) {
                    console.log("⚠️ DEMO MODE ACTIVATED")
                    const demoUser = { id: "demo-user", email: "demo@bitandbite.com", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: new Date().toISOString() } as User
                    setUser(demoUser)
                    setSession({ user: demoUser, access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer" } as Session)
                    // Mock Profile
                    setProfile({ id: "demo-user", first_name: "Demo", last_name: "User", clinic_id: "demo-clinic", role: "admin", is_super_admin: false, created_at: new Date().toISOString() } as any)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setProfile(null)
        setUser(null)
        setSession(null)

        // Clear demo mode flag from URL if present
        if (window.location.hash.includes("demo_mode=true")) {
            window.location.hash = window.location.hash.replace(/[?&]demo_mode=true/, '')
                .replace(/#\/\?/, '#/');
        }
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
