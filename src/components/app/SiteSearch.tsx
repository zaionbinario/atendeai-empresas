import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Command as CommandIcon, Search, Package } from "lucide-react";
import { buscarPaginas, normalizarBusca } from "@/lib/busca";
import { useStore } from "@/lib/store";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandShortcut,
} from "@/components/ui/command";

/**
 * Busca por páginas do painel, sem acessar dados de clientes.
 * Abrir uma página não substitui as verificações de permissão da própria rota.
 */
export function SiteSearch() {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const navegar = useNavigate();
  const { produtos } = useStore();
  const resultados = buscarPaginas(termo);
  const palavras = normalizarBusca(termo).split(" ").filter(Boolean);
  const produtosEncontrados = palavras.length
    ? produtos.filter(p => {
        const conteudo = normalizarBusca([p.nome, p.categoria, p.descricao].join(" "));
        return palavras.every(palavra => conteudo.includes(palavra));
      }).slice(0, 12)
    : [];

  useEffect(() => {
    const tecla = (evento: KeyboardEvent) => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        setAberto((atual) => !atual);
      }
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, []);

  const mudarAbertura = (valor: boolean) => {
    setAberto(valor);
    if (!valor) setTermo("");
  };

  const selecionar = (destino: (typeof resultados)[number]) => {
    mudarAbertura(false);
    void navegar({ to: destino.to });
  };

  const selecionarProduto = (nome: string) => {
    try { sessionStorage.setItem("zyon-busca-produto-pendente", nome); } catch {}
    mudarAbertura(false);
    void navegar({ to: "/produtos" });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => mudarAbertura(true)}
        aria-label="Buscar no sistema"
        aria-keyshortcuts="Control+K Meta+K"
        title="Buscar no sistema (Ctrl + K)"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-2.5 sm:justify-start sm:px-4 text-left text-sm text-slate-500 transition-colors hover:border-emerald-400/50 hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500 light:hover:text-slate-900"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden min-w-0 flex-1 truncate sm:block">Buscar no sistema...</span>
        <span className="hidden items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] sm:inline-flex light:border-slate-200">
          <CommandIcon className="h-3 w-3" /> K
        </span>
      </button>
      <CommandDialog open={aberto} onOpenChange={mudarAbertura} shouldFilter={false}>
        <CommandInput
          value={termo}
          onValueChange={setTermo}
          aria-label="Pesquisar páginas do Zyon Chat"
          placeholder="Busque notificações, histórico, empresas..."
        />
        <CommandList className="max-h-[min(60vh,400px)]">
          {resultados.length === 0 && produtosEncontrados.length === 0 ? (
            <CommandEmpty>Nenhuma página encontrada. Tente outra palavra.</CommandEmpty>
          ) : (
            <CommandGroup heading={termo.trim() ? "Páginas encontradas" : "Páginas do Zyon Chat"}>
              {resultados.map((destino) => (
                <CommandItem
                  key={destino.to}
                  value={destino.to}
                  onSelect={() => selecionar(destino)}
                  className="flex min-h-14 items-center gap-3 px-3 py-2"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{destino.titulo}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{destino.descricao}</span>
                  </span>
                  <CommandShortcut><ArrowRight className="h-3.5 w-3.5" /></CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {produtosEncontrados.length > 0 && (
            <CommandGroup heading="Produtos encontrados">
              {produtosEncontrados.map((produto) => (
                <CommandItem
                  key={"produto-" + produto.id}
                  value={"produto-" + produto.id}
                  onSelect={() => selecionarProduto(produto.nome)}
                  className="flex min-h-14 items-center gap-3 px-3 py-2"
                >
                  <Package className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{produto.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">Produto · {produto.categoria} · {produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </span>
                  <CommandShortcut><ArrowRight className="h-3.5 w-3.5" /></CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          Use as setas para escolher, Enter para abrir e Esc para fechar.
        </div>
      </CommandDialog>
    </>
  );
}
