/**
 * Demonstração de senha local: um hash PBKDF2 protege contra leitura direta da senha,
 * mas NÃO constitui autenticação nem autorização no servidor.
 * Um visitante com acesso ao armazenamento do navegador pode manipular os dados.
 */
export type CredencialAdmin = {
  versao: 1;
  algoritmo: "PBKDF2-SHA256";
  iteracoes: number;
  salt: string;
  hash: string;
};

export const CHAVE_CREDENCIAL_ADMIN = "zyon-admin-credencial-local-v1";
const ITERACOES = 250_000;

export function senhaAdminValida(senha: string): boolean {
  return senha.length >= 12 && senha.trim().length >= 12;
}

export function credencialAdminValida(dado: unknown): dado is CredencialAdmin {
  if (!dado || typeof dado !== "object") return false;
  const item = dado as Partial<CredencialAdmin>;
  return item.versao === 1 &&
    item.algoritmo === "PBKDF2-SHA256" &&
    item.iteracoes === ITERACOES &&
    typeof item.salt === "string" &&
    typeof item.hash === "string" &&
    item.salt.length > 10 &&
    item.hash.length > 10;
}

function codificarBase64(dados: Uint8Array): string {
  let caracteres = "";
  for (const byte of dados) caracteres += String.fromCharCode(byte);
  return btoa(caracteres);
}

function decodificarBase64(texto: string): Uint8Array {
  const caracteres = atob(texto);
  return Uint8Array.from(caracteres, (caractere) => caractere.charCodeAt(0));
}

async function criarHash(senha: string, salt: Uint8Array, iteracoes: number): Promise<string> {
  if (!crypto?.subtle) throw new Error("Este navegador não permite criptografia segura.");
  const chaveBase = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(senha),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations: iteracoes, hash: "SHA-256" },
    chaveBase,
    256,
  );
  return codificarBase64(new Uint8Array(bits));
}

export async function criarCredencialAdmin(senha: string): Promise<CredencialAdmin> {
  if (!senhaAdminValida(senha)) throw new Error("Use uma senha com pelo menos 12 caracteres.");
  if (!crypto?.getRandomValues) throw new Error("Este navegador não permite gerar uma senha segura.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    versao: 1,
    algoritmo: "PBKDF2-SHA256",
    iteracoes: ITERACOES,
    salt: codificarBase64(salt),
    hash: await criarHash(senha, salt, ITERACOES),
  };
}

export async function conferirSenhaAdmin(senha: string, credencial: CredencialAdmin): Promise<boolean> {
  const informado = await criarHash(senha, decodificarBase64(credencial.salt), credencial.iteracoes);
  if (informado.length !== credencial.hash.length) return false;
  let diferenca = 0;
  for (let i = 0; i < informado.length; i++) {
    diferenca |= informado.charCodeAt(i) ^ credencial.hash.charCodeAt(i);
  }
  return diferenca === 0;
}
