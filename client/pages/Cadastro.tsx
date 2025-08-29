import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmations are ON, user might need to confirm. For now, route to dashboard after session is created.
    if (data.session) navigate("/dashboard");
  }

  return (
    <main className="min-h-screen bg-muted py-10">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Comece a usar o MailForge AI</CardDescription>
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
                {loading ? "Cadastrando…" : "Cadastrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
