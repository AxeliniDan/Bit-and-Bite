import { createContext } from "react"
import { Session, User } from "@supabase/supabase-js"
import { Database } from "@/types/database.types"

export type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
