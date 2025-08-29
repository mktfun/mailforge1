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
import { supabase, mockAuth } from "@/lib/supabaseClient";
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

    try {
      console.log("Attempting login with:", email);
      let result;
      let usingFallback = false;

      // Try Supabase first
      try {
        console.log("Trying Supabase authentication...");
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("Supabase login response:", result);

        // Check if Supabase returned an error but didn't throw
        if (
          result.error &&
          (result.error.message.includes("Failed to fetch") ||
            result.error.message.includes("network"))
        ) {
          throw new Error(result.error.message);
        }
      } catch (supabaseError) {
        console.warn("Supabase failed, using fallback auth:", supabaseError);
        usingFallback = true;

        try {
          // Use fallback auth if Supabase fails
          result = await mockAuth.signInWithPassword({
            email,
            password,
          });
          console.log("Fallback login response:", result);
        } catch (fallbackError) {
          console.error("Fallback auth also failed:", fallbackError);
          throw fallbackError;
        }
      }

      setLoading(false);

      if (result.error) {
        console.error("Login error:", result.error);
        setError(`Erro de login: ${result.error.message}`);
        return;
      }

      if (result.data.user) {
        console.log("Login successful, redirecting...");

        // Show a brief message if using fallback
        if (usingFallback) {
          setError(
            "Login realizado em modo offline (extensão do navegador interferindo na conexão)",
          );
          setTimeout(() => setError(null), 3000);
        }

        const redirectTo = location.state?.from || "/dashboard";
        navigate(redirectTo);
      }
    } catch (err) {
      console.error("Login catch error:", err);
      setLoading(false);

      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      if (
        errorMessage.includes("chrome-extension") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "Erro de rede detectado - possivelmente causado por extensão do navegador. Tente desabilitar extensões ou usar modo incógnito.",
        );
      } else {
        setError(`Erro de conexão: ${errorMessage}`);
      }
    }
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
