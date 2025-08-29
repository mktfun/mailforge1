import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function TemplateNew() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nome é obrigatório");
      return;
    }
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      return navigate("/login");
    }
    const { error } = await supabase.from("templates").insert({
      user_id: user.id,
      name: trimmed,
      content,
    });
    if (error) {
      setError(error.message);
      toast.error(error.message || "Erro ao criar template");
      return;
    }
    toast.success("Template criado com sucesso!");
    startTransition(() => navigate("/templates"));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Novo Template</h1>
          <p className="text-sm text-muted-foreground">
            Defina o nome e o conteúdo HTML.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>Os campos abaixo são obrigatórios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Template</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Boas-vindas - Outubro"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conteúdo HTML</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="<table>...</table>"
              />
            </div>
            {(!name.trim() || error) && (
              <div className="text-sm text-destructive">
                {error || "Nome é obrigatório"}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending || !name.trim()}>
                Salvar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
                onClick={() => navigate("/templates")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
