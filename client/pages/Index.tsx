import { useMemo } from "react";

const PALETTE = [
  {
    name: "Primária",
    role: "Ações principais, botões e links",
    hex: "#6366F1",
    className: "bg-primary text-primary-foreground",
    var: "--primary",
  },
  {
    name: "Secundária",
    role: "Elementos de suporte e ações secundárias",
    hex: "#64748B",
    className: "bg-secondary text-secondary-foreground",
    var: "--secondary",
  },
  {
    name: "Sucesso",
    role: "Mensagens de confirmação e estados positivos",
    hex: "#22C55E",
    className: "bg-success text-success-foreground",
    var: "--success",
  },
  {
    name: "Aviso",
    role: "Alertas e notificações não críticas",
    hex: "#F59E0B",
    className: "bg-warning text-warning-foreground",
    var: "--warning",
  },
  {
    name: "Erro",
    role: "Alertas de erro e ações destrutivas",
    hex: "#EF4444",
    className: "bg-destructive text-destructive-foreground",
    var: "--destructive",
  },
];

export default function Index() {
  const toneOfVoice = useMemo(
    () => [
      "Eficiente: comunicações enxutas que ajudam o usuário a concluir tarefas.",
      "Inteligente: linguagem clara com foco em resultado, sem jargões desnecessários.",
      "Confiável: consistente, profissional e transparente em cada microcópia.",
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <section className="container py-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
            Identidade Visual · MailForge AI
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Guia de Estilo Oficial
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Base visual coesa e profissional para o app SaaS focado em criação
            de HTML para email marketing com assistência de IA.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Paleta de Cores</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {PALETTE.map((c) => (
                <div
                  key={c.name}
                  className="overflow-hidden rounded-xl border bg-background"
                >
                  <div className={`h-20 ${c.className}`} />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.role}
                        </p>
                      </div>
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {c.hex}
                      </code>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Token CSS: <code>{c.var}</code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Anéis de foco e elementos ativos usam a cor primária.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Tipografia</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Primária — Interface
                </p>
                <h3 className="mt-2 text-3xl font-extrabold">Inter</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Títulos, parágrafos e botões. Legível, moderna e versátil.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Secundária — Código/Preview
                </p>
                <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
                  <code className="font-mono">
                    &lt;!-- JetBrains Mono --&gt;{"\n"}
                    &lt;table role="presentation" width="100%" cellspacing="0"
                    cellpadding="0"&gt;{"\n"}
                    &lt;tr&gt;{"\n"}
                    &lt;td style="font-family: 'JetBrains Mono', monospace;
                    font-size:14px;"&gt;CTA&lt;/td&gt;{"\n"}
                    &lt;/tr&gt;{"\n"}
                    &lt;/table&gt;
                  </code>
                </pre>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Tom de Voz</h2>
            <ul className="space-y-2">
              {toneOfVoice.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground">{t}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Logo Conceitual</h2>
            <p className="text-sm text-muted-foreground">
              Ícone que combine uma bigorna (forge) com um cursor de texto ou um
              símbolo de IA. Aplicar a cor primária para o ícone e utilizar
              contraste alto para o fundo. Evitar detalhes excessivos para boa
              legibilidade em tamanhos pequenos (favicon e componentes de UI).
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground">Fundo claro</p>
                <div className="mt-2 flex h-16 items-center justify-center">
                  <div className="h-10 w-10 rounded-md bg-primary" />
                </div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground">Fundo escuro</p>
                <div className="mt-2 flex h-16 items-center justify-center bg-foreground/90">
                  <div className="h-10 w-10 rounded-md bg-primary" />
                </div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground">Uso mínimo</p>
                <div className="mt-2 flex h-16 items-center justify-center">
                  <div className="h-8 w-8 rounded bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold">Tokens Técnicos</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Variáveis CSS e configuração do Tailwind mapeadas para o Design
            System. Utilize-as para garantir consistência.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {PALETTE.map((c) => (
              <div key={c.name} className="rounded-lg border p-4">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.var}</p>
                <p className="mt-2 text-xs">
                  Classe:{" "}
                  <code>
                    {c.className.split(" ")[0].replace("bg-", "text-")}
                  </code>
                </p>
                <div className={`mt-3 h-8 w-full rounded ${c.className}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
