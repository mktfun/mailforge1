import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return <div className="p-6 text-sm text-muted-foreground">Carregando…</div>;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
