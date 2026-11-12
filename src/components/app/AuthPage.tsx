import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bot, Eye, EyeOff, LockKeyhole, Mail, UserRound, ArrowRight } from "lucide-react";
import { authConfigured, supabase } from "@/lib/auth-client";

type Mode = "login" | "cadastro" | "recuperar";
const errors: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Já existe uma conta com este e-mail.",
  "Password should be at least 6 characters": "Sua senha é muito curta.",
};
export function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const titulo = mode === "cadastro" ? "Crie sua conta" : mode === "recuperar" ? "Recuperar senha" : "Bem-vindo de volta";
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(""); setSucesso("");
    if (!supabase) { setErro("Autenticação ainda não configurada. Configure as variáveis do Supabase."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErro("Informe um e-mail válido."); return; }
    if (mode === "cadastro" && nome.trim().length < 3) { setErro("Informe seu nome completo."); return; }
    if (mode !== "recuperar" && senha.length < 8) { setErro("A senha deve ter pelo menos 8 caracteres."); return; }
    if (mode === "cadastro" && senha !== confirmacao) { setErro("As senhas não coincidem."); return; }
    setEnviando(true);
    try {
      if (mode === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/redefinir-senha" });
        if (error) throw error;
        setSucesso("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
      } else if (mode === "cadastro") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha, options: { data: { full_name: nome.trim() }, emailRedirectTo: window.location.origin + "/" } });
        if (error) throw error;
        if (data.session) await navigate({ to: "/" });
        else setSucesso("Cadastro enviado! Confira seu e-mail para confirmar sua conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) throw error;
        await navigate({ to: "/" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível concluir a operação.";
      setErro(errors[msg] || msg);
    } finally { setEnviando(false); }
  }
  return <main className="min-h-screen bg-[#071310] text-white flex items-center justify-center p-4 sm:p-8">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,.15),transparent_55%)]" />
    <div className="relative w-full max-w-md rounded-3xl border border-emerald-400/20 bg-[#0c201b] p-6 shadow-2xl shadow-black/30 sm:p-9">
      <div className="mb-7 flex items-center justify-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Bot /></span><span className="font-display text-2xl font-bold">Zyon <span className="text-emerald-400">Chat</span></span></div>
      <h1 className="text-center font-display text-2xl font-bold">{titulo}</h1>
      <p className="mt-2 mb-7 text-center text-sm text-slate-400">{mode === "cadastro" ? "Comece a transformar seu atendimento." : mode === "recuperar" ? "Enviaremos um link para seu e-mail." : "Acesse seu painel de atendimento."}</p>
      {!authConfigured && <p role="alert" className="mb-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente do site para ativar o login.</p>}
      <form onSubmit={enviar} className="space-y-4">
        {mode === "cadastro" && <label className="block text-sm font-medium">Nome completo<div className="relative mt-2"><UserRound className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input autoComplete="name" required minLength={3} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome completo" className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-3 outline-none focus:border-emerald-400"/></div></label>}
        <label className="block text-sm font-medium">E-mail<div className="relative mt-2"><Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com" className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-3 outline-none focus:border-emerald-400"/></div></label>
        {mode !== "recuperar" && <label className="block text-sm font-medium">Senha<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><input type={mostrar ? "text" : "password"} autoComplete={mode === "cadastro" ? "new-password" : "current-password"} required minLength={8} value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mínimo de 8 caracteres" className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-12 outline-none focus:border-emerald-400"/><button type="button" onClick={()=>setMostrar(!mostrar)} aria-label={mostrar?"Ocultar senha":"Mostrar senha"} className="absolute right-3 top-3 text-slate-400">{mostrar?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}</button></div></label>}
        {mode === "cadastro" && <label className="block text-sm font-medium">Confirmar senha<input type={mostrar?"text":"password"} autoComplete="new-password" required minLength={8} value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} placeholder="Repita sua senha" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-emerald-400"/></label>}
        {erro && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{erro}</p>}
        {sucesso && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{sucesso}</p>}
        <button disabled={enviando || !authConfigured} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-bold text-[#06251d] transition hover:bg-emerald-300 disabled:opacity-50">{enviando?"Aguarde...":mode==="cadastro"?"Criar conta":mode==="recuperar"?"Enviar link":"Entrar"}<ArrowRight className="h-4 w-4"/></button>
      </form>
      <div className="mt-6 space-y-3 text-center text-sm text-slate-400">
        {mode==="login" && <><Link to="/recuperar-senha" className="block text-emerald-300 hover:underline">Esqueci minha senha</Link><p>Não tem conta? <Link to="/cadastro" className="font-semibold text-emerald-300 hover:underline">Criar uma conta</Link></p></>}
        {mode==="cadastro" && <p>Já tem uma conta? <Link to="/login" className="font-semibold text-emerald-300 hover:underline">Entrar</Link></p>}
        {mode==="recuperar" && <Link to="/login" className="text-emerald-300 hover:underline">Voltar ao login</Link>}
      </div>
    </div>
  </main>;
}
