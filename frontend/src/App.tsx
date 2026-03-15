import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, ManagerRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "@/components/ui";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ApartmentsPage from "@/pages/ApartmentsPage";
import ContractsPage from "@/pages/ContractsPage";
import TenantsPage from "@/pages/TenantsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import UsersPage from "@/pages/UsersPage";
import MapPage from "@/pages/MapPage";
import BuildingDetailPage from "@/pages/BuildingDetailPage";
import ApartmentDetailPage from "@/pages/ApartmentDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/buildings/:id" element={<BuildingDetailPage />} />
            <Route path="/buildings/:id/apartments/:apartmentId" element={<ApartmentDetailPage />} />

            {/* Manager-only routes */}
            <Route path="/apartments" element={<ManagerRoute><ApartmentsPage /></ManagerRoute>} />
            <Route path="/contracts" element={<ManagerRoute><ContractsPage /></ManagerRoute>} />
            <Route path="/tenants" element={<ManagerRoute><TenantsPage /></ManagerRoute>} />
            <Route path="/payments" element={<ManagerRoute><PaymentsPage /></ManagerRoute>} />
            <Route path="/users" element={<ManagerRoute><UsersPage /></ManagerRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
