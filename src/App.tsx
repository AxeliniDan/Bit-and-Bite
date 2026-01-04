import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/features/auth/AuthContext"
import { TenantProvider } from "@/context/TenantContext"
import { LoginPage } from "@/features/auth/LoginPage"
import { AppShell } from "@/components/layout/AppShell"
import { CalendarView } from "@/features/calendar/CalendarView"

const queryClient = new QueryClient()

import { PatientList } from "@/features/patients/PatientList"
import { PatientProfile } from "@/features/patients/PatientProfile"
import { PosPage, InventoryPage, HospitalPage, AdminPage } from "@/features/ModulesPages"
import { SuperAdminPage } from "@/features/admin/SuperAdminPage"

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* <Route element={<ProtectedRoute />}> */}
              <Route element={<AppShell />}>
                <Route path="/" element={<CalendarView />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/:id" element={<PatientProfile />} />

                <Route path="/pos" element={<PosPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/hospital" element={<HospitalPage />} />
                <Route path="/admin" element={<AdminPage />} />

                {/* Future routes: /schedule, /pos */}
              </Route>

              {/* Super Admin Route (Standalone Layout) */}
              <Route path="/super-admin" element={<SuperAdminPage />} />

              {/* </Route> */}
            </Routes>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
