export type Client = {
  id: string;
  nome: string;
  telefone: string;
  documento: string;
  endereco: string;
  email: string;
};

export const PRODUTO_TIPOS = [
  { value: "camiseta", label: "Camiseta" },
  { value: "moletom", label: "Moletom" },
  { value: "polo", label: "Polo" },
  { value: "caneca", label: "Caneca" },
  { value: "copo-termico", label: "Copo Térmico" },
  { value: "squeeze", label: "Squeeze" },
  { value: "avental", label: "Avental" },
  { value: "ecobag", label: "Ecobag" },
  { value: "botton", label: "Botton" },
] as const;
export type ProdutoTipo = (typeof PRODUTO_TIPOS)[number]["value"];

export const CAMISETA_MODELOS = [
  "Oversized",
  "Feminina",
  "Babylook Feminina",
  "Manga Longa",
  "Camiseta Básica",
  "Regata Fitness",
  "Regata Comum",
  "Regata Machão",
] as const;

// Bolso e Fechamento do moletom são escolhas exclusivas, tratadas à parte (ver BOLSO_OPCOES / FECHAMENTO_OPCOES).
export const MOLETOM_MODELOS = ["Touca", "Forro da Touca"] as const;

export const BOLSO_OPCOES = ["Faca", "Canguru"] as const;

// "Aberto" foi removido: um moletom fechado com zíper não faz sentido, por isso são exclusivos entre si.
export const FECHAMENTO_OPCOES = ["Fechado", "Zíper"] as const;

export const MODELOS_POR_TIPO: Partial<Record<ProdutoTipo, readonly string[]>> = {
  camiseta: CAMISETA_MODELOS,
  moletom: MOLETOM_MODELOS,
};

// Tamanho só se aplica a camiseta e moletom. Grupos como Adulto e Baby Look
// repetem rótulos (ex: "P"), por isso o grupo faz parte do valor armazenado.
export const TAMANHOS_GRUPOS = [
  { grupo: "Infantil", opcoes: ["2", "4", "6", "8", "10", "12"] },
  { grupo: "Adulto", opcoes: ["14", "PP", "P", "M", "G", "GG"] },
  { grupo: "Especiais Adulto", opcoes: ["XLL", "XXL", "XXXL"] },
  { grupo: "Baby Look Feminina", opcoes: ["P", "M", "G", "GG"] },
  { grupo: "Especial Baby Look Feminina", opcoes: ["XL", "XXL"] },
] as const;

export const TIPOS_COM_TAMANHO: ProdutoTipo[] = ["camiseta", "moletom"];

export const CORES = [
  "Branco",
  "Preto",
  "Cinza",
  "Azul",
  "Vermelho",
  "Verde",
  "Amarelo",
  "Rosa",
] as const;

export type Produto = {
  id: string;
  clienteId: string;
  tipo: ProdutoTipo;
  nome: string;
  descritivo: string;
  quantidade: number;
  modelos: string[];
  bolso?: (typeof BOLSO_OPCOES)[number];
  fechamento?: (typeof FECHAMENTO_OPCOES)[number];
  tamanho?: string;
  frente: boolean;
  costa: boolean;
  cores: string[];
};
