import { describe, expect, it } from "vitest";
import { dadosEmpresaValidos, filtrarEmpresas, resumoEmpresas } from "@/lib/gestao-empresas";
import type { Empresa } from "@/lib/types";

const empresas: Empresa[] = [
  { id: "1", nome: "Café São João", segmento: "Alimentação", cidade: "Goiânia", telefone: "(62) 99999-0000", ativa: true },
  { id: "2", nome: "Pet Mais", segmento: "Pet", cidade: "Brasília", telefone: "(61) 88888-0000", ativa: false },
  { id: "3", nome: "Moda Bela", segmento: "Vestuário", cidade: "Goiânia", telefone: "(62) 77777-0000", ativa: true },
];

describe("gestão administrativa de empresas", () => {
  it("calcula totais e situação das empresas", () => {
    expect(resumoEmpresas(empresas)).toEqual({ total: 3, ativas: 2, inativas: 1 });
  });
  it("busca sem diferenciar acentos nem maiúsculas", () => {
    expect(filtrarEmpresas(empresas, "cafe sao", "todas").map((e) => e.id)).toEqual(["1"]);
    expect(filtrarEmpresas(empresas, "brasilia", "inativas").map((e) => e.id)).toEqual(["2"]);
  });
  it("filtra por status", () => {
    expect(filtrarEmpresas(empresas, "", "ativas").map((e) => e.id)).toEqual(["1", "3"]);
    expect(filtrarEmpresas(empresas, "", "inativas").map((e) => e.id)).toEqual(["2"]);
  });
  it("rejeita nomes vazios", () => {
    const empresa = empresas[0];
    if (!empresa) throw new Error("Empresa de teste ausente");
    expect(dadosEmpresaValidos({ ...empresa, nome: "  " })).toBe(false);
    expect(dadosEmpresaValidos(empresa)).toBe(true);
  });
});
