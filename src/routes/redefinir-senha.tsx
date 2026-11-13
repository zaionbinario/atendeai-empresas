import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/auth-client";

export const Route = createFileRoute("/redefinir-senha")({ component: ResetPage });

function ResetPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setErro("Autenticação não configurada.");
      setVerificando(false);
      return;
    }
    const client = supabase;
    let ativo = true;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") || url.searchParams.get("error_description");
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const isRecovery = type === "recovery" || hash.get("type") === "recovery";
    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (ativo && event === "PASSWORD_RECOVERY") {
        setAutorizado(true);
        setErro("");
        setVerificando(false);
      }
    });

    async function verificar() {
      try {
        if (hashError) throw new Error("Link inválido ou expirado. Solicite outro e-mail.");
        if (tokenHash && type === "recovery") {
          const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (error) throw error;
          if (ativo) setAutorizado(true);
        } else if (code) {
          // O fluxo PKCE troca o código de uso único por uma sessão válida.
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (ativo) setAutorizado(true);
        } else if (isRecovery && accessToken && refreshToken) {
          // Compatibilidade com links antigos que usam tokens no fragmento.
          const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          if (ativo) setAutorizado(true);
        } else {
          throw new Error("Abra esta página pelo link enviado ao seu e-mail.");
        }
        // Retira credenciais da barra de endereço após validar o link.
        window.history.replaceState(window.history.state, "", "/redefinir-senha");
      } catch {
        if (ativo) {
          setAutorizado(false);
          setErro("Link de recuperação inválido, expirado ou já utilizado. Solicite um novo link.");
        }
      } finally {
        if (ativo) setVerificando(false);
      }
    }
    void verificar();
    return () => { ativo = false; subscription.unsubscribe(); };
  }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!autorizado || !supabase || ocupado) return;
    setErro("");
    if (senha.length < 6 || !/[a-z]/.test(senha) || !/[^A-Za-z0-9]/.test(senha)) {
      setErro("Use no mínimo 6 caracteres, uma letra minúscula e um caractere especial.");
      return;
    }
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    setOcupado(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setSucesso("Senha alterada com sucesso! Você já pode entrar com a nova senha.");
      setAutorizado(false);
      await supabase.auth.signOut();
    } catch {
      setErro("Não foi possível alterar a senha. O link pode ter expirado. Solicite um novo link.");
    } finally {
      setOcupado(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#071310] p-4 text-white">
    <form onSubmit={salvar} className="w-full max-w-md space-y-4 rounded-2xl border border-emerald-400/20 bg-[#0c201b] p-8">
      <h1 className="text-2xl font-bold">Nova senha — Zyon Chat</h1>
      {verificando ? <p role="status" className="text-slate-300">Validando link de recuperação...</p> :
        sucesso ? <><p role="status" className="text-emerald-300">{sucesso}</p><Link to="/login" className="block text-center font-semibold text-emerald-300 underline">Ir para o login</Link></> :
        !autorizado ? <><p role="alert" className="text-red-300">{erro}</p><Link to="/recuperar-senha" className="block text-center font-semibold text-emerald-300 underline">Solicitar novo link</Link></> :
        <>
          <label className="block">Nova senha<input type="password" autoComplete="new-password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)} className="mt-2 w-full rounded-xl bg-white/10 p-3" /></label>
          <p className="text-sm text-slate-400">Mínimo 6 caracteres, uma letra minúscula e um símbolo (@, #, !).</p>
          <label className="block">Confirmar nova senha<input type="password" autoComplete="new-password" required value={confirmar} onChange={e => setConfirmar(e.target.value)} className="mt-2 w-full rounded-xl bg-white/10 p-3" /></label>
          {erro && <p role="alert" className="text-red-300">{erro}</p>}
          <button type="submit" disabled={ocupado} className="w-full rounded-xl bg-emerald-400 p-3 font-bold text-black disabled:opacity-50">{ocupado ? "Salvando..." : "Salvar nova senha"}</button>
        </>
      }
    </form>
  </main>;
}
