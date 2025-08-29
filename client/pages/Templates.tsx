import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Template = {
  id: string;
  user_id: string;
  name: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export default function Templates() {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("id, user_id, name, content, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Template[];
    },
  });

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
      toast.success("Template deletado com sucesso");
      query.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao deletar template");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus templates de email.
          </p>
        </div>
        <Button onClick={() => navigate("/templates/novo")}>
          Criar Novo Template
        </Button>
      </div>

      {query.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <div className="mt-2">
                  <Skeleton className="h-4 w-60" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter className="gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {query.isError && (
        <div className="text-sm text-destructive">
          Erro ao carregar templates.
        </div>
      )}

      {query.isSuccess && query.data.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum template encontrado</CardTitle>
            <CardDescription>Que tal criar o primeiro?</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/templates/novo")}>
              Criar Novo Template
            </Button>
          </CardFooter>
        </Card>
      )}

      {query.isSuccess && query.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {query.data.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription>
                  Atualizado em {new Date(t.updated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded border bg-muted p-3 text-xs text-muted-foreground line-clamp-3">
                  {t.content || "Sem conteúdo"}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                  onClick={() => navigate(`/templates/${t.id}/editar`)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(t.id)}
                >
                  Deletar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
