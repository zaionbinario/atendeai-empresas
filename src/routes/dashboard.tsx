import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, UserRound, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Zyon Chat" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { session } = useAuth();
  const nome = typeof session?.user.user_metadata?.["full_name"] === "string"
    ? session.user.user_metadata["full_name"] : "";
  return <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
    <header className="rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-[#062d25] to-[#087b50] p-7 text-white">
      <div className="mb-3 flex items-center gap-2 text-emerald-200"><LayoutDashboard className="h-5 w-5" /> Área privada</div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-white/80">Bem-vindo{nome ? ", " + nome : ""}! Sua sessão está ativa.</p>
    </header>
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <UserRound className="mb-3 h-6 w-6 text-emerald-400" />
        <h2 className="text-lg font-semibold">Minha conta</h2>
        <p className="mt-2 break-all text-sm text-muted-foreground">{session?.user.email}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <ShieldCheck className="mb-3 h-6 w-6 text-emerald-400" />
        <h2 className="text-lg font-semibold">Acesso autenticado</h2>
        <p className="mt-2 text-sm text-muted-foreground">Esta página exige uma sessão do Supabase.</p>
      </div>
    </section>
    <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white">Abrir painel <ArrowRight className="h-4 w-4" /></Link>
  </main>;
}
