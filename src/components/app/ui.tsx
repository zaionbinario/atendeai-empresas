import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Bot, Clock3, CircleHelp, Package, Play, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickAccess() {
  const links = [
    { to: "/empresas", label: "Empresas", desc: "Gerencie seus negócios", icon: Building2, color: "bg-sky-500/10 text-sky-600" },
    { to: "/produtos", label: "Produtos", desc: "Atualize preços e descrições", icon: Package, color: "bg-violet-500/10 text-violet-600" },
    { to: "/horarios", label: "Horários", desc: "Configure dias e expediente", icon: Clock3, color: "bg-amber-500/10 text-amber-600" },
    { to: "/perguntas", label: "Perguntas frequentes", desc: "Ensine respostas à IA", icon: CircleHelp, color: "bg-emerald-500/10 text-emerald-600" },
    { to: "/atendente", label: "Atendente virtual", desc: "Personalize o comportamento", icon: Bot, color: "bg-indigo-500/10 text-indigo-600" },
    { to: "/simulador", label: "Testar atendimento", desc: "Simule uma conversa", icon: Play, color: "bg-rose-500/10 text-rose-600" },
  ];
  return <section className="mt-6">
    <div className="mb-3 flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-bold">Acesso rápido</h2></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {links.map(({ to, label, desc, icon: Icon, color }) => <Link key={to} to={to} className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", color)}><Icon className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span></span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>)}
    </div>
  </section>;
}
export function PageHeader({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-1 text-muted-foreground">{desc}</p></div>
      {action}
    </div>
  );
}
export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>{children}</div>
);
export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const v = { primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft", ghost: "border bg-card hover:bg-accent", danger: "text-destructive hover:bg-destructive/10" }[variant];
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50", v, className)} />;
}
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>
);
const base = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(base, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(base, "min-h-24", p.className)} />;
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-primary" : "bg-muted-foreground/30")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all", on ? "left-5" : "left-0.5")} />
    </button>
  );
}
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>{children}
      </div>
    </div>
  );
}
