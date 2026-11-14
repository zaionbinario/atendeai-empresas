import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  useRouterState,
  Navigate,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/auth-client";

import { Toaster } from "sonner";
import { AppShell } from "../components/app/AppShell";
import { StoreProvider } from "../lib/store";
import { AuthProvider, useAuth } from "../lib/auth-context";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zyon Chat — Atendimento automatizado com IA" },
      { name: "description", content: "Atendimento automatizado com inteligência artificial para pequenas empresas e lojas." },
      
      { property: "og:title", content: "Zyon Chat — Atendimento automatizado com IA" },
      { property: "og:description", content: "Atendimento automatizado com inteligência artificial para pequenas empresas e lojas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Figtree:wght@400;500;600&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

type AccessState = "loading" | "admin" | "active" | "pending" | "suspended" | "none" | "error";

function CompanyAccess({ children, path, userId }: { children: ReactNode; path: string; userId: string }) {
  const [access, setAccess] = useState<AccessState>("loading");
  const [companyName, setCompanyName] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      setAccess("loading");
      if (!supabase) { setAccess("error"); return; }
      const admin = await supabase.from("admins_plataforma").select("usuario_id").eq("usuario_id", userId).maybeSingle();
      if (cancelled) return;
      if (admin.error) { setAccess("error"); return; }
      if (admin.data) { setAccess("admin"); return; }
      const membership = await supabase.from("empresa_usuarios").select("empresa_id").eq("usuario_id", userId);
      if (cancelled) return;
      if (membership.error) { setAccess("error"); return; }
      if (!membership.data?.length) { setAccess("none"); return; }
      const ids = membership.data.map((m) => m.empresa_id);
      const companies = await supabase.from("empresas").select("id,nome,status").in("id", ids);
      if (cancelled) return;
      if (companies.error) { setAccess("error"); return; }
      const selected = companies.data?.find((e) => e.status === "ativa") ?? companies.data?.[0];
      if (!selected) { setAccess("error"); return; }
      setCompanyName(selected.nome);
      setAccess(selected.status === "ativa" ? "active" : selected.status === "suspensa" ? "suspended" : "pending");
    }
    void check();
    return () => { cancelled = true; };
  }, [userId, retry, path]);

  if (access === "admin" || access === "active" || (path === "/empresas" && access === "none")) return <>{children}</>;
  const messages: Record<Exclude<AccessState, "admin" | "active">, string> = {
    loading: "Verificando sua empresa no Supabase...",
    pending: "Sua empresa ainda aguarda aprovação do administrador.",
    suspended: "O acesso desta empresa está suspenso. Entre em contato com o administrador.",
    none: "Você ainda não possui uma empresa vinculada à sua conta.",
    error: "Não foi possível verificar sua empresa. Por segurança, o painel está temporariamente bloqueado.",
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#030611] px-4 text-white">
    <div className="w-full max-w-lg space-y-5 rounded-2xl border border-sky-500/25 bg-[#0b1430] p-8 text-center shadow-2xl">
      <h1 className="text-2xl font-bold">Zyon Chat — Acesso à empresa</h1>
      {companyName && <p className="font-semibold text-sky-300">{companyName}</p>}
      <p role="status" className="text-slate-300">{messages[access]}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {access === "none" && <Link to="/empresas" className="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-slate-950">Cadastrar empresa</Link>}
        <button type="button" onClick={() => setRetry((n) => n + 1)} className="rounded-xl border border-sky-400/40 px-4 py-2">Verificar novamente</button>
        <button type="button" onClick={() => void supabase?.auth.signOut()} className="rounded-xl border border-white/20 px-4 py-2">Sair da conta</button>
      </div>
    </div>
  </main>;
}

function ProtectedContent() {
  const path = useRouterState({ select: s => s.location.pathname });
  const { session, loading } = useAuth();
  const publicRoute = ["/login", "/cadastro", "/recuperar-senha", "/redefinir-senha"].includes(path);
  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#07111F] text-sky-300">Carregando sessão...</main>;
  if (publicRoute) {
    if (session && path !== "/redefinir-senha") return <Navigate to="/" replace />;
    return <Outlet />;
  }
  if (!session) return <Navigate to="/login" replace />;
  return <CompanyAccess userId={session.user.id} path={path}><StoreProvider><AppShell><Outlet /></AppShell></StoreProvider></CompanyAccess>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProtectedContent />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
