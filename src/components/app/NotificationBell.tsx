import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useStore } from "@/lib/store";

export function NotificationBell() {
  const { notificacoes } = useStore();
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <Link
      to="/notificacoes"
      aria-label={`Abrir notificações, ${naoLidas} não lidas`}
      title="Abrir central de notificações"
      className="relative inline-flex items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900"
    >
      <Bell className="h-5 w-5" />
      {naoLidas > 0 && (
        <span
          aria-live="polite"
          className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
        >
          {naoLidas > 99 ? "99+" : naoLidas}
        </span>
      )}
    </Link>
  );
}
