import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Horario } from "@/lib/types";
import { Btn, Card, Input, PageHeader, QuickAccess, Toggle } from "@/components/app/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/horarios")({
  head: () => ({ meta: [{ title: "Horários de funcionamento — Zyon Chat" }, { name: "description", content: "Defina os dias e horários de funcionamento da sua empresa." }, { property: "og:title", content: "Horários de funcionamento — Zyon Chat" }, { property: "og:description", content: "Defina os dias e horários de funcionamento da sua empresa." }] }),
  component: Horarios,
});
function Horarios() {
  const { horarios, salvarHorarios } = useStore();
  const [rascunho, setRascunho] = useState<Horario[]>(horarios);
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (!alterado) setRascunho(horarios);
  }, [horarios, alterado]);
  const upd = (i: number, v: Partial<Horario>) => {
    setRascunho(atuais => atuais.map((h, j) => i === j ? { ...h, ...v } : h));
    setAlterado(true);
  };
  const salvar = async () => {
    setSalvando(true);
    try {
      const ok = await salvarHorarios(rascunho);
      if (ok) setAlterado(false);
    } finally { setSalvando(false); }
  };
  return (<>
    <PageHeader title="Horários de funcionamento" desc="O atendente informa aos clientes quando a loja está aberta." action={<Btn onClick={() => void salvar()} disabled={!alterado || salvando}>{salvando ? "Salvando..." : alterado ? "Salvar horários" : "Horários salvos"}</Btn>} />
    <Card className="max-w-2xl p-0"><ul className="divide-y">{rascunho.map((h, i) => (
      <li key={h.dia} className="flex flex-wrap items-center gap-4 p-4">
        <Toggle label={h.dia} on={h.aberto} onChange={(v) => upd(i, { aberto: v })} />
        <span className="w-32 font-semibold">{h.dia}</span>
        {h.aberto ? (<div className="flex items-center gap-2"><Input type="time" className="w-28" value={h.abre} onChange={(e) => upd(i, { abre: e.target.value })} /><span className="text-muted-foreground">às</span>
          <Input type="time" className="w-28" value={h.fecha} onChange={(e) => upd(i, { fecha: e.target.value })} /></div>)
          : <span className="text-sm text-muted-foreground">Fechado</span>}
      </li>))}</ul></Card>
    <QuickAccess />
  </>);
}
