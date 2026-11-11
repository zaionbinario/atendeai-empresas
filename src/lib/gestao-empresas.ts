import type { Empresa } from "./types";

export type FiltroStatusEmpresa = "todas" | "ativas" | "inativas";

const normalizar = (valor: string) => valor.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function resumoEmpresas(empresas: Empresa[]) {
  const ativas = empresas.filter((empresa) => empresa.ativa).length;
  return { total: empresas.length, ativas, inativas: empresas.length - ativas };
}

export function filtrarEmpresas(
  empresas: Empresa[],
  busca: string,
  status: FiltroStatusEmpresa,
): Empresa[] {
  const termo = normalizar(busca.trim());
  return empresas.filter((empresa) => {
    if (status === "ativas" && !empresa.ativa) return false;
    if (status === "inativas" && empresa.ativa) return false;
    if (!termo) return true;
    return [empresa.nome, empresa.segmento, empresa.telefone, empresa.cidade]
      .some((valor) => normalizar(valor).includes(termo));
  });
}

export function dadosEmpresaValidos(empresa: Empresa) {
  return empresa.nome.trim().length > 0;
}
