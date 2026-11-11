import { describe, expect, it } from "vitest";
import { credencialAdminValida, senhaAdminValida } from "@/lib/admin-password";

describe("validação da senha administrativa local", () => {
  it("exige ao menos 6 caracteres que não sejam apenas espaços", () => {
    expect(senhaAdminValida("12345")).toBe(false);
    expect(senhaAdminValida("     ")).toBe(false);
    expect(senhaAdminValida("123456")).toBe(true);
    expect(senhaAdminValida("MinhaSenhaSuperForte123!")).toBe(true);
  });
  it("rejeita estruturas de credenciais incompletas", () => {
    expect(credencialAdminValida(null)).toBe(false);
    expect(credencialAdminValida({ hash: "senha123" })).toBe(false);
  });
  it("reconhece o formato salvo com hash e salt", () => {
    expect(credencialAdminValida({
      versao: 1,
      algoritmo: "PBKDF2-SHA256",
      iteracoes: 250000,
      salt: "MDEyMzQ1Njc4OWFiY2RlZg==",
      hash: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    })).toBe(true);
  });
});
