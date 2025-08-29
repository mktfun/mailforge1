import { Link, NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
            <span className="inline-block h-5 w-5 rounded-sm bg-primary" />
            <span className="font-semibold">MailForge AI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/templates">Templates</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/configuracoes">Configurações</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          {user ? (
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
                asChild
                size="sm"
              >
                <Link to="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="ml-2 text-sm text-muted-foreground">Área logada</div>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
