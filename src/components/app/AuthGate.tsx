import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setSession(data.session);
      setError(error?.message ?? "");
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) { setSession(nextSession); setLoading(false); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Não foi possível entrar. Confira seu e-mail e sua senha.");
    setBusy(false);
  }

  async function signInWithGoogle() {
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
    if (error) { setError("Não foi possível iniciar o login com Google."); setBusy(false); }
  }

  if (loading) return <div className="grid min-h-screen place-items-center bg-background text-foreground">Verificando sua sessão...</div>;
  if (session) return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-7 shadow-lg">
        <div><h1 className="font-display text-3xl font-bold">Zyon Chat</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre com sua conta para acessar o painel.</p></div>
        <form onSubmit={signIn} className="space-y-4">
          <label className="block text-sm font-medium">E-mail
            <input className="mt-1 w-full rounded-lg border bg-background p-3" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label className="block text-sm font-medium">Senha
            <input className="mt-1 w-full rounded-lg border bg-background p-3" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button className="w-full rounded-lg bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-50" disabled={busy} type="submit">Entrar</button>
        </form>
        <button className="w-full rounded-lg border p-3 font-semibold disabled:opacity-50" disabled={busy} onClick={signInWithGoogle} type="button">Continuar com Google</button>
        <p className="text-xs text-muted-foreground">O acesso à administração ainda exige autorização específica no banco de dados. Não use a senha local como controle de segurança.</p>
      </div>
    </main>
  );
}
