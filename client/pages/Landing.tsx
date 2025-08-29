import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Crie emails HTML com confiança
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          MailForge AI acelera a produção de campanhas com um editor claro e
          componentes reutilizáveis. Sem firulas — só o que importa.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link to="/cadastro">Começar agora</Link>
          </Button>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
            asChild
          >
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
        <div id="features" className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-left">
            <p className="text-sm font-semibold">Design consistente</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Baseado em tokens e componentes do Style Guide.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left">
            <p className="text-sm font-semibold">Fluxo ágil</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Do rascunho ao envio com clareza e foco.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left">
            <p className="text-sm font-semibold">Controle</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sem excesso visual. Só utilidade.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
