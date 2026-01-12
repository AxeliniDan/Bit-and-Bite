import { Suspense, lazy } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HashRouter, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/features/auth/AuthContext"
import { TenantProvider } from "@/context/TenantContext"
import { AppShell } from "@/components/layout/AppShell"
import { Loader2 } from "lucide-react"

// Optimized Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute (Data stays "fresh" for 1min)
      gcTime: 10 * 60 * 1000, // 10 minutes (Keep unused data in cache)
      refetchOnWindowFocus: false, // Don't refetch just because user clicked window
      retry: 1
    }
  }
})

// Eager Loading (Critical Path)
import { LoginPage } from "@/features/auth/LoginPage"
import { CalendarView } from "@/features/calendar/CalendarView"

// Lazy Loading (Split Bundles)
// These modules will only be downloaded when the user navigates to them
const PatientList = lazy(() => import("@/features/patients/PatientList").then(module => ({ default: module.PatientList })))
const PatientProfile = lazy(() => import("@/features/patients/PatientProfile").then(module => ({ default: module.PatientProfile })))
// For ModulesPages, we need to handle named exports carefully if they are re-exported
// Assuming ModulesPages.tsx exports like: export { PosPage } from ...
const PosPage = lazy(() => import("@/features/ModulesPages").then(module => ({ default: module.PosPage })))
const InventoryPage = lazy(() => import("@/features/ModulesPages").then(module => ({ default: module.InventoryPage })))
const HospitalPage = lazy(() => import("@/features/ModulesPages").then(module => ({ default: module.HospitalPage })))
const AdminPage = lazy(() => import("@/features/ModulesPages").then(module => ({ default: module.AdminPage })))
const SuperAdminPage = lazy(() => import("@/features/admin/SuperAdminPage").then(module => ({ default: module.SuperAdminPage })))
const AboutPage = lazy(() => import("@/features/landing/AboutPage").then(module => ({ default: module.AboutPage })))
const TranslatorPage = lazy(() => import("@/features/translator/TranslatorPage").then(module => ({ default: module.TranslatorPage })))

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-gray-50/50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      <span className="text-sm font-medium text-muted-foreground">Cargando módulo...</span>
    </div>
  </div>
)

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<AboutPage />} />

                {/* <Route element={<ProtectedRoute />}> */}
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<CalendarView />} />
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/patients/:id" element={<PatientProfile />} />

                  <Route path="/pos" element={<PosPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/hospital" element={<HospitalPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/translator" element={<TranslatorPage />} />

                  {/* Future routes: /schedule, /pos */}
                </Route>

                {/* Super Admin Route (Standalone Layout) */}
                <Route path="/super-admin" element={<SuperAdminPage />} />

                {/* </Route> */}
              </Routes>
            </Suspense>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HashRouter>
  )
}

export default App
