import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { user } = useAuth();

  if (user) navigate("/dashboard");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    const redirectTo = location.state?.from || "/dashboard";
    navigate(redirectTo);
  }

  return (
    <main className="min-h-screen bg-muted py-10">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse sua conta MailForge AI</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="voce@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Entrando…" : "Entrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link
                  to="/cadastro"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
