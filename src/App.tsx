import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import CastingCallsPage from "./pages/admin/CastingCalls";
import CastingCallForm from "./pages/admin/CastingCallForm";
import CastingCallDetail from "./pages/admin/CastingCallDetail";
import ApplicationsPage from "./pages/admin/Applications";
import ApplicationDetail from "./pages/admin/ApplicationDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/casting-calls"
              element={
                <ProtectedRoute>
                  <CastingCallsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/casting-calls/new"
              element={
                <ProtectedRoute>
                  <CastingCallForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/casting-calls/:id"
              element={
                <ProtectedRoute>
                  <CastingCallDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/casting-calls/:id/edit"
              element={
                <ProtectedRoute>
                  <CastingCallForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect /admin to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
