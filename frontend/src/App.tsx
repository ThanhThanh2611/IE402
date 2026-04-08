import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, ManagerRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "@/components/ui";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ApartmentsPage = lazy(() => import("@/pages/ApartmentsPage"));
const ContractsPage = lazy(() => import("@/pages/ContractsPage"));
const TenantsPage = lazy(() => import("@/pages/TenantsPage"));
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const BuildingDetailPage = lazy(() => import("@/pages/BuildingDetailPage"));
const ApartmentDetailPage = lazy(() => import("@/pages/ApartmentDetailPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="rounded-xl border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
        Đang tải màn hình...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
