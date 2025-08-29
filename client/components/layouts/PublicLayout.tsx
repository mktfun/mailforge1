import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold tracking-tight"
          >
            <span
              className="inline-block h-5 w-5 rounded-sm bg-primary"
              aria-hidden="true"
            />
            <span>MailForge AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground"
            >
              Preços
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
              asChild
            >
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Começar</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t">
        <div className="container flex h-14 items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} MailForge AI</span>
          <span>Construído com foco em clareza e confiança</span>
        </div>
      </footer>
    </div>
  );
}
