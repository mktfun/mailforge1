import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import TemplateNew from "./pages/TemplateNew";
import TemplateEdit from "./pages/TemplateEdit";
import Configuracoes from "./pages/Configuracoes";
import Landing from "./pages/Landing";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import PublicLayout from "@/components/layouts/PublicLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import AppLayoutRoute from "@/components/layouts/AppLayoutRoute";

const queryClient = new QueryClient();

function RedirectIfAuthed({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return children;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
            </Route>

            {/* Auth Layout */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/cadastro"
              element={
                <RedirectIfAuthed>
                  <AuthLayout>
                    <Cadastro />
                  </AuthLayout>
                </RedirectIfAuthed>
              }
            />

            {/* App Layout (protected) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayoutRoute />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/novo" element={<TemplateNew />} />
              <Route path="/templates/:id/editar" element={<TemplateEdit />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
