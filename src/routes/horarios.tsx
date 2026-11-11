import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Btn, Card, Input, PageHeader, Toggle } from "@/components/app/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/horarios")({
  head: () => ({ meta: [{ title: "Horários de funcionamento — Zyon Desk" }, { name: "description", content: "Defina os dias e horários de funcionamento da sua empresa." }, { property: "og:title", content: "Horários de funcionamento — Zyon Desk" }, { property: "og:description", content: "Defina os dias e horários de funcionamento da sua empresa." }] }),
  component: Horarios,
});
function Horarios() {
  const { horarios, setHorarios } = useStore();
  const upd = (i: number, v: Partial<(typeof horarios)[number]>) => setHorarios(horarios.map((h, j) => (i === j ? { ...h, ...v } : h)));
  return (<>
    <PageHeader title="Horários de funcionamento" desc="O atendente informa aos clientes quando a loja está aberta." action={<Btn onClick={() => toast.success("Horários salvos!")}>Salvar horários</Btn>} />
    <Card className="max-w-2xl p-0"><ul className="divide-y">{horarios.map((h, i) => (
      <li key={h.dia} className="flex flex-wrap items-center gap-4 p-4">
        <Toggle label={h.dia} on={h.aberto} onChange={(v) => upd(i, { aberto: v })} />
        <span className="w-32 font-semibold">{h.dia}</span>
        {h.aberto ? (<div className="flex items-center gap-2"><Input type="time" className="w-28" value={h.abre} onChange={(e) => upd(i, { abre: e.target.value })} /><span className="text-muted-foreground">às</span>
          <Input type="time" className="w-28" value={h.fecha} onChange={(e) => upd(i, { fecha: e.target.value })} /></div>)
          : <span className="text-sm text-muted-foreground">Fechado</span>}
      </li>))}</ul></Card>
  </>);
}
