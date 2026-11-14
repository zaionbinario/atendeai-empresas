import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bot, Eye, EyeOff, LockKeyhole, Mail, UserRound, ArrowRight } from "lucide-react";
import { authConfigured, getRememberMe, setRememberMe, supabase } from "@/lib/auth-client";

type Mode = "login" | "cadastro" | "recuperar";
const validarSenha = (valor: string) => valor.length >= 6 && /[a-z]/.test(valor) && /[^A-Za-z0-9]/.test(valor);
const errors: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Já existe uma conta com este e-mail.",
  "Password should be at least 6 characters": "Sua senha é muito curta.",
  "email rate limit exceeded": "O serviço de e-mail atingiu o limite de envios. Aguarde antes de tentar novamente. Se persistir, o administrador precisa configurar SMTP no Supabase.",
};
export function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [lembrar, setLembrar] = useState(() => typeof window !== "undefined" && getRememberMe());
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const titulo = mode === "cadastro" ? "Crie sua conta" : mode === "recuperar" ? "Recuperar senha" : "Bem-vindo de volta";
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    setErro(""); setSucesso("");
    if (!supabase) { setErro("Autenticação ainda não configurada. Configure as variáveis do Supabase."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErro("Informe um e-mail válido."); return; }
    if (mode === "cadastro" && nome.trim().length < 3) { setErro("Informe seu nome completo."); return; }
    if (mode === "cadastro" && !validarSenha(senha)) { setErro("A senha precisa ter no mínimo 6 caracteres, uma letra minúscula e um caractere especial."); return; }
    if (mode === "cadastro" && senha !== confirmacao) { setErro("As senhas não coincidem."); return; }
    setEnviando(true);
    try {
      if (mode === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/redefinir-senha" });
        if (error) throw error;
        setSucesso("Solicitação recebida! Verifique sua caixa de entrada e a pasta de spam. Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
      } else if (mode === "cadastro") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha, options: { data: { full_name: nome.trim() }, emailRedirectTo: window.location.origin + "/" } });
        if (error) throw error;
        if (data.session) await navigate({ to: "/" });
        else setSucesso("Se este e-mail puder ser cadastrado, você receberá uma confirmação. Se já possui conta, entre pelo login ou recupere sua senha.");
      } else {
        setRememberMe(lembrar);
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) throw error;
        await navigate({ to: "/" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível concluir a operação.";
      const rateLimited = /rate.limit|too.many.requests|429/i.test(msg);
      setErro(rateLimited ? "Limite de envio de e-mails atingido. Aguarde antes de tentar novamente. Se persistir, o administrador deve configurar SMTP no Supabase." : mode === "cadastro" && (msg === "User already registered" || msg.toLowerCase().includes("already registered")) ? "Este e-mail pode já ter uma conta. Tente entrar ou recuperar sua senha." : (errors[msg] || msg));
    } finally { setEnviando(false); }
  }
  return <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#030611] px-4 py-12 text-white sm:px-8">
    {/* Ambient futuristic background: decorative only, never blocks form interactions. */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_42%,rgba(16,35,113,.55),transparent_60%),linear-gradient(145deg,#02030b_0%,#060b24_56%,#02030a_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[min(115vw,920px)] w-[min(115vw,920px)] -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-[#168cff] opacity-80 shadow-[0_0_40px_rgba(18,132,255,.55),inset_0_0_30px_rgba(18,132,255,.15)] sm:border-[14px]" />
      <div className="absolute left-[-30%] top-[68%] h-px w-[160%] -rotate-[34deg] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,.65)_100%)]" />
      {/* Stylized robot inspired by the provided reference, drawn as SVG to avoid external assets. */}
      <svg className="zyon-robot-float absolute bottom-[2%] right-[-110px] h-[280px] w-[280px] opacity-50 sm:bottom-[4%] sm:right-[1%] sm:h-[370px] sm:w-[370px] sm:opacity-80 lg:right-[5%] lg:h-[430px] lg:w-[430px]" viewBox="0 0 400 430" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="zyonRobotMetal" x1="50" y1="40" x2="340" y2="390" gradientUnits="userSpaceOnUse"><stop stopColor="#F0F8FF"/><stop offset=".45" stopColor="#8295B4"/><stop offset="1" stopColor="#283E60"/></linearGradient>
          <linearGradient id="zyonRobotBody" x1="160" y1="215" x2="250" y2="395" gradientUnits="userSpaceOnUse"><stop stopColor="#E2ECFF"/><stop offset="1" stopColor="#546B8B"/></linearGradient>
          <filter id="zyonRobotGlow"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>
        <ellipse cx="200" cy="402" rx="90" ry="11" fill="#008DFF" opacity=".25" filter="url(#zyonRobotGlow)"/>
        <path d="M93 95C53 55 52 158 104 178L118 129Z" fill="url(#zyonRobotMetal)" stroke="#94B6DA" strokeWidth="2"/>
        <path d="M307 95C347 55 348 158 296 178L282 129Z" fill="url(#zyonRobotMetal)" stroke="#94B6DA" strokeWidth="2"/>
        <g className="zyon-robot-head"><rect x="89" y="39" width="222" height="178" rx="83" fill="url(#zyonRobotMetal)" stroke="#C3D8EF" strokeWidth="3"/>
        <path d="M113 123C113 88 140 75 171 75H230C265 75 288 89 288 124V150C288 181 268 193 235 193H165C133 193 113 177 113 150V123Z" fill="#030817" stroke="#78A9DA" strokeWidth="3"/>
        <ellipse cx="161" cy="137" rx="21" ry="27" transform="rotate(-13 161 137)" fill="#62E8FF"/>
        <ellipse cx="239" cy="137" rx="21" ry="27" transform="rotate(13 239 137)" fill="#62E8FF"/>
        <ellipse cx="161" cy="137" rx="26" ry="32" fill="#36DFFF" opacity=".5" filter="url(#zyonRobotGlow)"/>
        <ellipse cx="239" cy="137" rx="26" ry="32" fill="#36DFFF" opacity=".5" filter="url(#zyonRobotGlow)"/></g>
        <path d="M143 226C159 212 240 212 257 226C274 241 277 322 255 362C239 392 217 403 200 403C183 403 161 392 145 362C123 322 126 241 143 226Z" fill="url(#zyonRobotBody)" stroke="#BCD2EC" strokeWidth="3"/>
        <path d="M142 328C181 355 218 355 258 328" stroke="#60E6FF" strokeWidth="3" opacity=".9"/>
        <rect className="zyon-robot-arm-left" x="77" y="239" width="57" height="100" rx="28" transform="rotate(17 77 239)" fill="url(#zyonRobotMetal)" stroke="#A3C4E3" strokeWidth="3"/>
        <rect className="zyon-robot-arm-right" x="267" y="256" width="57" height="100" rx="28" transform="rotate(-17 267 256)" fill="url(#zyonRobotMetal)" stroke="#A3C4E3" strokeWidth="3"/>
        <path d="M88 312L126 324M275 324L312 312" stroke="#6FEAFF" strokeWidth="3"/>
      </svg>
      <div className="absolute left-[8%] top-[12%] h-24 w-24 rounded-full bg-blue-500/15 blur-3xl" />
    </div>
    <div className="relative z-10 w-full max-w-[440px] rounded-[24px] border border-white/20 bg-[#070e2a]/65 px-6 py-8 shadow-[0_25px_90px_rgba(0,0,0,.65),0_0_60px_rgba(25,82,225,.16)] backdrop-blur-2xl sm:px-10 sm:py-10">
      <div className="mb-6 flex items-center justify-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-sky-300/40 bg-sky-400/10 text-sky-300 shadow-[0_0_25px_rgba(56,189,248,.18)]"><Bot className="h-6 w-6" /></span>
        <span className="font-display text-2xl font-bold tracking-tight">ZYON <span className="text-sky-300">CHAT</span></span>
      </div>
      <h1 className="text-center font-display text-[28px] font-bold tracking-tight">{mode === "login" ? "Login" : titulo}</h1>
      <p className="mb-7 mt-2 text-center text-sm text-slate-300">{mode === "cadastro" ? "Comece a transformar seu atendimento." : mode === "recuperar" ? "Enviaremos um link para seu e-mail." : "Bem-vindo de volta ao futuro do atendimento."}</p>
      {!authConfigured && <p role="alert" className="mb-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o login.</p>}
      <form onSubmit={enviar} className="space-y-4">
        {mode === "cadastro" && <label className="block text-sm font-medium text-slate-200">Nome completo<div className="relative mt-2"><UserRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-400"/><input autoComplete="name" required minLength={3} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome completo" className="w-full rounded-full border border-blue-300/30 bg-blue-950/25 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"/></div></label>}
        <label className="block text-sm font-medium text-slate-200">E-mail<div className="relative mt-2"><Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400"/><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com" className="w-full rounded-full border border-blue-300/30 bg-blue-950/25 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"/></div></label>
        {mode !== "recuperar" && <label className="block text-sm font-medium text-slate-200">Senha<div className="relative mt-2"><LockKeyhole className="absolute left-4 top-3.5 h-5 w-5 text-slate-400"/><input type={mostrar ? "text" : "password"} autoComplete={mode === "cadastro" ? "new-password" : "current-password"} required minLength={mode === "cadastro" ? 6 : undefined} value={senha} onChange={e=>setSenha(e.target.value)} placeholder={mode === "cadastro" ? "Mínimo 6, minúscula e símbolo" : "Sua senha"} className="w-full rounded-full border border-blue-300/30 bg-blue-950/25 py-3 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"/><button type="button" onClick={()=>setMostrar(!mostrar)} aria-label={mostrar?"Ocultar senha":"Mostrar senha"} className="absolute right-4 top-3.5 text-slate-300 hover:text-sky-300">{mostrar?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}</button></div></label>}
        {mode === "cadastro" && <p className="text-xs text-slate-300">Use pelo menos 6 caracteres, uma letra minúscula e um símbolo.</p>}
        {mode === "cadastro" && <label className="block text-sm font-medium text-slate-200">Confirmar senha<input type={mostrar?"text":"password"} autoComplete="new-password" required minLength={6} value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} placeholder="Repita sua senha" className="mt-2 w-full rounded-full border border-blue-300/30 bg-blue-950/25 px-4 py-3 text-white outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"/></label>}
        {erro && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{erro}</p>}
        {sucesso && <p role="status" className="rounded-xl bg-sky-500/10 p-3 text-sm text-sky-300">{sucesso}</p>}
        {mode === "cadastro" && (sucesso || erro.toLowerCase().includes("já ter uma conta")) && <div className="flex flex-wrap gap-4 text-sm"><Link to="/login" className="font-semibold text-sky-300 underline">Fazer login</Link><Link to="/recuperar-senha" className="text-sky-300 underline">Esqueci minha senha</Link></div>}
        {mode === "login" && <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-200">
            <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} className="h-4 w-4 cursor-pointer rounded border-blue-300/40 accent-sky-400" />
            Lembrar de mim
          </label>
          <Link to="/recuperar-senha" className="text-sky-300 hover:underline">Esqueceu a senha?</Link>
        </div>}
        <button disabled={enviando || !authConfigured} className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-bold text-[#071124] shadow-[0_8px_30px_rgba(255,255,255,.12)] transition hover:bg-sky-100 disabled:opacity-50">{enviando?"Aguarde...":mode==="cadastro"?"Criar conta":mode==="recuperar"?"Enviar link":"Entrar"}<ArrowRight className="h-4 w-4"/></button>
      </form>
      <div className="mt-6 space-y-3 text-center text-sm text-slate-300">
        {mode==="login" && <><p>Não tem uma conta? <Link to="/cadastro" className="font-semibold text-white hover:text-sky-300">Cadastre-se</Link></p></>}
        {mode==="cadastro" && <p>Já tem uma conta? <Link to="/login" className="font-semibold text-sky-300 hover:underline">Entrar</Link></p>}
        {mode==="recuperar" && <Link to="/login" className="text-sky-300 hover:underline">Voltar ao login</Link>}
      </div>
    </div>
  </main>;
}
