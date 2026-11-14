import { useEffect, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";

const KEY = "zyon-chat-aparencia";
const colors = [
  { name: "Azul", value: "oklch(0.67 0.18 255)", hex: "#3b82f6" },
  { name: "Roxo", value: "oklch(0.68 0.20 300)", hex: "#a855f7" },
  { name: "Rosa", value: "oklch(0.72 0.19 350)", hex: "#ec4899" },
  { name: "Vermelho", value: "oklch(0.65 0.22 25)", hex: "#ef4444" },
  { name: "Branco", value: "oklch(0.95 0 0)", hex: "#f5f5f5" },
] as const;
export type Appearance = { color: string; fontSize: number; font: string };
export const defaultAppearance: Appearance = { color: "oklch(0.67 0.18 255)", fontSize: 100, font: "Figtree" };
const fonts = ["Figtree", "Outfit", "Arial", "Georgia"] as const;
export function applyAppearance(settings: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const color = colors.some(c => c.value === settings.color) ? settings.color : defaultAppearance.color;
  const size = Math.max(85, Math.min(125, Number(settings.fontSize) || 100));
  const font = fonts.includes(settings.font as typeof fonts[number]) ? settings.font : defaultAppearance.font;
  root.dataset["zyonAccent"] = "custom";
  root.style.setProperty("--zyon-accent", color);
  // Fundos discretamente tingidos na cor escolhida, preservando contraste.
  const selectedColor = colors.find(c => c.value === color);
  const hue = selectedColor?.name === "Roxo" ? 300
    : selectedColor?.name === "Rosa" ? 350
    : selectedColor?.name === "Vermelho" ? 25
    : selectedColor?.name === "Branco" ? 0 : 255;
  const chroma = selectedColor?.name === "Branco" ? 0 : 0.018;
  const tint = (lightness: number) => `oklch(${lightness} ${chroma} ${hue})`;
  const isLight = root.classList.contains("light");
  root.style.setProperty("--background", tint(isLight ? 0.98 : 0.12));
  root.style.setProperty("--card", tint(isLight ? 1 : 0.17));
  root.style.setProperty("--popover", tint(isLight ? 1 : 0.17));
  root.style.setProperty("--secondary", tint(isLight ? 0.94 : 0.23));
  root.style.setProperty("--muted", tint(isLight ? 0.95 : 0.20));
  root.style.setProperty("--sidebar", tint(isLight ? 1 : 0.105));
  root.style.setProperty("--sidebar-accent", tint(isLight ? 0.94 : 0.20));
  root.style.setProperty("--zyon-surface", tint(isLight ? 1 : 0.105));
  root.style.setProperty("--primary", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--ring", color);
  root.style.setProperty("--chart-1", color);
  root.style.setProperty("font-size", size + "%");
  root.style.setProperty("--zyon-font", '"' + font + '", system-ui, sans-serif');
  root.style.setProperty("--font-sans", '"' + font + '", system-ui, sans-serif');
  root.style.setProperty("--font-display", '"' + font + '", system-ui, sans-serif');
}
export function loadAppearance(): Appearance {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { ...defaultAppearance, ...parsed };
  } catch { return defaultAppearance; }
}
export function AppearanceSettings() {
  const [settings, setSettings] = useState<Appearance>(defaultAppearance);
  useEffect(() => { const current = loadAppearance(); setSettings(current); applyAppearance(current); }, []);
  const update = (patch: Partial<Appearance>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applyAppearance(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Preview remains active. */ }
  };
  return (
    <section className="rounded-2xl border border-border bg-card p-5 space-y-6" aria-labelledby="appearance-title">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-muted p-3"><Palette className="h-5 w-5 text-primary" /></div>
        <div><h2 id="appearance-title" className="font-semibold">Personalização do painel</h2><p className="text-sm text-muted-foreground">Escolha cores, tamanho e estilo das letras. Alterações aparecem na hora.</p></div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium">Cor de destaque</p>
        <div className="flex flex-wrap gap-3">
          {colors.map(c => <button key={c.name} type="button" onClick={() => update({ color: c.value })} aria-label={"Selecionar " + c.name} aria-pressed={settings.color === c.value} title={c.name} className={"flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition " + (settings.color === c.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted")}>
            <span className="h-5 w-5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />{c.name}
          </button>)}
        </div>
      </div>
      <div>
        <label htmlFor="zyon-font-size" className="mb-2 block text-sm font-medium">Tamanho das letras: {settings.fontSize}%</label>
        <input id="zyon-font-size" className="w-full accent-current" type="range" min="85" max="125" step="5" value={settings.fontSize} onChange={e => update({ fontSize: Number(e.target.value) })} />
        <div className="flex justify-between text-xs text-muted-foreground"><span>Menor</span><span>Padrão (100%)</span><span>Maior</span></div>
      </div>
      <div>
        <label htmlFor="zyon-font-family" className="mb-2 block text-sm font-medium">Fonte das letras</label>
        <select id="zyon-font-family" value={settings.font} onChange={e => update({ font: e.target.value })} className="w-full max-w-sm rounded-xl border border-input bg-background px-3 py-2 text-foreground">
          {fonts.map(font => <option key={font} value={font}>{font}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground">Prévia</p>
        <p className="mt-2 text-lg font-semibold text-primary">Seu Zyon Chat, do seu jeito</p>
        <p className="mt-1 text-sm">Personalize o painel sem alterar as configurações dos outros usuários.</p>
      </div>
      <button type="button" onClick={() => update(defaultAppearance)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><RotateCcw className="h-4 w-4" />Restaurar aparência padrão</button>
      <p className="text-xs text-muted-foreground">A aparência é salva automaticamente neste navegador. Não é sincronizada entre dispositivos.</p>
    </section>
  );
}
