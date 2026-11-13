import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./auth-client";

type AuthState = { session: Session | null; loading: boolean };
const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    // A sessão local pode ser lida sem depender de uma requisição de rede
    // antes de mostrar a tela. O Supabase continua validando os tokens e
    // as políticas RLS protegem os dados no servidor.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });

    // Evita que uma chamada de autenticação ou armazenamento indisponível
    // deixe a aplicação presa eternamente em "Carregando sessão...".
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (!error) setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
