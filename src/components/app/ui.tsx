import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-1 text-muted-foreground">{desc}</p></div>
      {action}
    </div>
  );
}
export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("rounded-2xl border bg-card/70 p-5 shadow-soft backdrop-blur-md transition-colors hover:border-primary/30", className)}>{children}</div>
);
export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const v = { primary: "bg-gradient-brand text-primary-foreground shadow-glow hover:brightness-110", ghost: "border bg-card/60 hover:border-primary/40 hover:bg-accent", danger: "text-destructive hover:bg-destructive/10" }[variant];
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50", v, className)} />;
}
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>
);
const base = "w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-colors";
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(base, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(base, "min-h-24", p.className)} />;
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-gradient-brand" : "bg-muted-foreground/30")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all", on ? "left-5" : "left-0.5")} />
    </button>
  );
}
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg animate-rise rounded-2xl border bg-card p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>{children}
      </div>
    </div>
  );
}
