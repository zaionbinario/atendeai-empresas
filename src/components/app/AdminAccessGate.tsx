import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { KeyRound, LockKeyhole, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { Btn, Card, Field, Input, PageHeader } from "@/components/app/ui";
import {
  CHAVE_CREDENCIAL_ADMIN,
  conferirSenhaAdmin,
  criarCredencialAdmin,
  credencialAdminValida,
  senhaAdminValida,
  type CredencialAdmin,
} from "@/lib/admin-password";

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [credencial, setCredencial] = useState<CredencialAdmin | null>(null);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNova, setConfirmarNova] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [erroAlterar, setErroAlterar] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_CREDENCIAL_ADMIN);
      if (salvo) {
        const analisado: unknown = JSON.parse(salvo);
        if (!credencialAdminValida(analisado)) {
          setErro("Os dados da senha local estão inválidos. Não é possível entrar neste navegador.");
        } else {
          setCredencial(analisado);
        }
      }
    } catch {
      setErro("Não foi possível carregar a senha neste navegador.");
    }
    setCarregando(false);
  }, []);

  const entrarOuCriar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (ocupado) return;
    if (erro.includes("inválidos") || erro.includes("carregar")) return;
    setErro("");
    setOcupado(true);
    try {
      if (!credencial) {
        if (!senhaAdminValida(senha)) {
          setErro("Escolha uma senha com pelo menos 12 caracteres.");
          return;
        }
        if (senha !== confirmacao) {
          setErro("As duas senhas precisam ser iguais.");
          return;
        }
        const novaCredencial = await criarCredencialAdmin(senha);
        localStorage.setItem(CHAVE_CREDENCIAL_ADMIN, JSON.stringify(novaCredencial));
        setCredencial(novaCredencial);
      } else {
        if (!await conferirSenhaAdmin(senha, credencial)) {
          setErro("Senha incorreta.");
          return;
        }
      }
      setDesbloqueado(true);
      setSenha("");
      setConfirmacao("");
    } catch {
      setErro("Não foi possível proteger o acesso neste navegador. Verifique se o site usa HTTPS e permite armazenamento local.");
    } finally {
      setOcupado(false);
    }
  };

  const alterarSenha = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (ocupado || !credencial || !desbloqueado) return;
    setErroAlterar("");
    setAviso("");
    setOcupado(true);
    try {
      if (!await conferirSenhaAdmin(senhaAtual, credencial)) {
        setErroAlterar("A senha atual está incorreta.");
        return;
      }
      if (!senhaAdminValida(novaSenha)) {
        setErroAlterar("A nova senha precisa ter pelo menos 12 caracteres.");
        return;
      }
      if (novaSenha !== confirmarNova) {
        setErroAlterar("A confirmação da nova senha não confere.");
        return;
      }
      const novaCredencial = await criarCredencialAdmin(novaSenha);
      localStorage.setItem(CHAVE_CREDENCIAL_ADMIN, JSON.stringify(novaCredencial));
      setCredencial(novaCredencial);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNova("");
      setAviso("Senha local alterada com sucesso.");
    } catch {
      setErroAlterar("Não foi possível alterar a senha neste navegador.");
    } finally {
      setOcupado(false);
    }
  };

  if (carregando) {
    return <Card className="py-12 text-center text-sm text-muted-foreground">Verificando acesso à administração...</Card>;
  }

  if (!desbloqueado) {
    const configurar = credencial === null;
    return (
      <div className="mx-auto w-full max-w-xl space-y-5">
        <PageHeader
          title="Administração"
          desc={configurar ? "Crie uma senha para liberar a área administrativa neste navegador." : "Digite sua senha para abrir a área administrativa."}
        />
        <Card className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-semibold">{configurar ? "Definir senha administrativa" : "Acesso com senha"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {configurar
                  ? "Escolha uma senha de pelo menos 12 caracteres. Não envie sua senha no chat."
                  : "A administração fica bloqueada sempre que você sai desta página ou recarrega o site."}
              </p>
            </div>
          </div>
          <form onSubmit={entrarOuCriar} className="space-y-4">
            <Field label={configurar ? "Criar senha" : "Senha administrativa"}>
              <Input
                type="password"
                value={senha}
                onChange={(event) => { setSenha(event.target.value); setErro(""); }}
                minLength={configurar ? 12 : undefined}
                autoComplete={configurar ? "new-password" : "current-password"}
                required
              />
            </Field>
            {configurar && (
              <Field label="Confirmar senha">
                <Input type="password" value={confirmacao}
                  onChange={(event) => { setConfirmacao(event.target.value); setErro(""); }}
                  minLength={12} autoComplete="new-password" required />
              </Field>
            )}
            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
            <Btn type="submit" disabled={ocupado || !senha || (configurar && !confirmacao)} className="w-full">
              <KeyRound className="h-4 w-4" /> {ocupado ? "Verificando..." : configurar ? "Criar senha e entrar" : "Entrar na administração"}
            </Btn>
          </form>
        </Card>
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/5 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Atenção: proteção de demonstração.</strong> Essa senha vale somente neste navegador e não garante privacidade entre empresas.
            Para acesso exclusivo de administrador de verdade, ainda precisamos de login e permissões verificados no servidor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Área administrativa desbloqueada neste navegador
        </span>
        <Btn type="button" variant="ghost"
          onClick={() => { setDesbloqueado(false); setSenha(""); setAviso(""); }}>
          <LogOut className="h-4 w-4" /> Bloquear administração
        </Btn>
      </div>
      {children}
      <Card className="space-y-3">
        <details>
          <summary className="cursor-pointer text-sm font-semibold">Alterar minha senha administrativa</summary>
          <form className="mt-4 space-y-3" onSubmit={alterarSenha}>
            <Field label="Senha atual">
              <Input type="password" value={senhaAtual} autoComplete="current-password" required
                onChange={(event) => setSenhaAtual(event.target.value)} />
            </Field>
            <Field label="Nova senha">
              <Input type="password" value={novaSenha} autoComplete="new-password" minLength={12} required
                onChange={(event) => setNovaSenha(event.target.value)} />
            </Field>
            <Field label="Confirmar nova senha">
              <Input type="password" value={confirmarNova} autoComplete="new-password" minLength={12} required
                onChange={(event) => setConfirmarNova(event.target.value)} />
            </Field>
            {erroAlterar && <p role="alert" className="text-sm text-destructive">{erroAlterar}</p>}
            {aviso && <p role="status" className="text-sm text-emerald-600">{aviso}</p>}
            <Btn type="submit" disabled={ocupado}>Salvar nova senha</Btn>
          </form>
        </details>
      </Card>
    </div>
  );
}
