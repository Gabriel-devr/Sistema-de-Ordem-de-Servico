export type Client = {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  documento: string;
  empresa: string;
  observacoes: string;
};

export const PRODUTO_CATEGORIAS = [
  { value: "vestuario", label: "Vestuário" },
  { value: "outros", label: "Outros" },
] as const;
export type ProdutoCategoria = (typeof PRODUTO_CATEGORIAS)[number]["value"];

export const PRODUTO_TIPOS = [
  { value: "bone", label: "Boné", categoria: "vestuario" },
  { value: "avental", label: "Avental", categoria: "vestuario" },
  { value: "camiseta", label: "Camiseta", categoria: "vestuario" },
  { value: "moletom", label: "Moletom", categoria: "vestuario" },
  { value: "polo", label: "Polo", categoria: "vestuario" },
  { value: "body", label: "Body", categoria: "vestuario" },
  { value: "samba-cancao", label: "Samba Canção", categoria: "outros" },
  { value: "short-dool", label: "Short Dool", categoria: "outros" },
  { value: "almofada", label: "Almofada", categoria: "outros" },
  { value: "caneca", label: "Caneca", categoria: "outros" },
  { value: "squeeze", label: "Squeeze", categoria: "outros" },
  { value: "botom", label: "Botom", categoria: "outros" },
  { value: "chaveiro", label: "Chaveiro", categoria: "outros" },
  { value: "sacochila", label: "Sacochila", categoria: "outros" },
  { value: "ecobag", label: "Ecobag", categoria: "outros" },
  { value: "bandeira", label: "Bandeira", categoria: "outros" },
  { value: "bandana-pet", label: "Bandana Pet", categoria: "outros" },
  { value: "bandana", label: "Bandana", categoria: "outros" },
  { value: "quadro-mdf", label: "Quadro MDF", categoria: "outros" },
  { value: "copo-termico", label: "Copo Térmico", categoria: "outros" },
] as const;
export type ProdutoTipo = (typeof PRODUTO_TIPOS)[number]["value"];

export function produtoTipoLabel(tipo: ProdutoTipo): string {
  return PRODUTO_TIPOS.find((option) => option.value === tipo)?.label ?? tipo;
}

export const CAMISETA_MODELOS = [
  "Básica",
  "Manga Longa",
  "Regata",
  "Masculina",
  "Baby Look",
  "Infantil",
] as const;

// Bolso e Fechamento do moletom são escolhas exclusivas, tratadas à parte (ver BOLSO_OPCOES / FECHAMENTO_OPCOES).
export const MOLETOM_MODELOS = ["Touca", "Forro da Touca"] as const;

export const BOLSO_OPCOES = ["Faca", "Canguru"] as const;

// "Aberto" foi removido: um moletom fechado com zíper não faz sentido, por isso são exclusivos entre si.
export const FECHAMENTO_OPCOES = ["Fechado", "Zíper"] as const;

export const TECIDO_OPCOES = [
  "Algodão",
  "Malha Fria",
  "Dry Fit",
  "Poliamida",
  "+50 UV",
] as const;

export const MODELOS_POR_TIPO: Partial<Record<ProdutoTipo, readonly string[]>> = {
  camiseta: CAMISETA_MODELOS,
  polo: CAMISETA_MODELOS,
  body: CAMISETA_MODELOS,
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

export const TIPOS_COM_TAMANHO: ProdutoTipo[] = ["camiseta", "moletom", "polo", "body"];

// Tecido só se aplica às peças de malha/vestuário que compartilham as opções da camiseta.
export const TIPOS_COM_TECIDO: ProdutoTipo[] = ["camiseta", "polo", "body"];

export const PERSONALIZACAO_TIPOS = [
  "DTF",
  "DTG",
  "Silk Screen",
  "Sublimação",
  "Bordado",
  "Laser",
  "Transfer",
  "Outros",
] as const;

export const PERSONALIZACAO_LOCAIS = [
  "Frente",
  "Costas",
  "Peito Esquerdo",
  "Peito Direito",
  "Manga Direita",
  "Manga Esquerda",
  "Barra",
  "Outros",
] as const;

export type PersonalizacaoCampos = {
  tipo: boolean;
  tipoOpcoes: readonly string[];
  local: boolean;
  observacoes: boolean;
};

const PERSONALIZACAO_CAMPOS_PADRAO: PersonalizacaoCampos = {
  tipo: true,
  tipoOpcoes: PERSONALIZACAO_TIPOS,
  local: true,
  observacoes: true,
};

// Boné só é personalizado por bordado, e avental não tem tipo de personalização
// (só local e observações) — os demais tipos usam o padrão completo.
const PERSONALIZACAO_CAMPOS_POR_TIPO: Partial<
  Record<ProdutoTipo, PersonalizacaoCampos>
> = {
  bone: {
    tipo: true,
    tipoOpcoes: ["Bordado"],
    local: false,
    observacoes: false,
  },
  avental: {
    tipo: false,
    tipoOpcoes: PERSONALIZACAO_TIPOS,
    local: true,
    observacoes: true,
  },
};

export function personalizacaoCamposDoTipo(
  tipo: ProdutoTipo
): PersonalizacaoCampos {
  return PERSONALIZACAO_CAMPOS_POR_TIPO[tipo] ?? PERSONALIZACAO_CAMPOS_PADRAO;
}

// Esteira de produção: estações físicas pelas quais cada produto passa, em
// ordem. Cada produto avança independentemente dos demais no mesmo pedido.
export const PRODUCTION_SUBSTAGES = ["Corte", "Costura", "Impressão"] as const;
export type ProductionSubStage = (typeof PRODUCTION_SUBSTAGES)[number];

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
  descritivo: string;
  quantidade: number;
  modelos: string[];
  bolso?: (typeof BOLSO_OPCOES)[number];
  fechamento?: (typeof FECHAMENTO_OPCOES)[number];
  tecido?: (typeof TECIDO_OPCOES)[number];
  tamanho?: string;
  personalizacaoTipo?: (typeof PERSONALIZACAO_TIPOS)[number];
  personalizacaoLocais: string[];
  personalizacaoObservacoes: string;
  cores: string[];
  subStage: ProductionSubStage;
  arte?: string;
};
