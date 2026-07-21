import { Client, Produto } from "./venda";

export { PRODUCTION_SUBSTAGES } from "./venda";
export type { ProductionSubStage } from "./venda";

export const STAGES = [
  "cliente",
  "orcamento",
  "pedido-confirmado",
  "arte-anexada",
  "pagamento",
  "producao",
  "conferencia",
  "pronto-retirada",
  "entrega",
  "finalizado",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  cliente: "Cliente",
  orcamento: "Orçamento",
  "pedido-confirmado": "Pedido Confirmado",
  "arte-anexada": "Arte Anexada",
  pagamento: "Pagamento",
  producao: "Produção",
  conferencia: "Conferência",
  "pronto-retirada": "Pronto para Retirada",
  entrega: "Entrega",
  finalizado: "Finalizado",
};

export const PAGAMENTO_STATUS = ["Pendente", "Parcial", "Pago"] as const;
export type PagamentoStatus = (typeof PAGAMENTO_STATUS)[number];

export const FORMA_PAGAMENTO = ["Pix", "Dinheiro", "Cartão", "Boleto"] as const;
export type FormaPagamento = (typeof FORMA_PAGAMENTO)[number];

export const CONFERENCIA_STATUS = [
  "Aprovado",
  "Reprovado",
  "Voltar para produção",
] as const;
export type ConferenciaStatus = (typeof CONFERENCIA_STATUS)[number];

export type Order = {
  id: string;
  // Só existe a partir do avanço para "pedido-confirmado" — antes disso é
  // só um cliente/orçamento em andamento, sem OS gerada ainda.
  numero?: number;
  clienteId?: string;
  cliente: string;
  // Guarda os demais dados do cliente para permitir editar o pedido depois.
  clienteInfo?: Client;
  pedido: string;
  quantidade: number;
  stage: Stage;
  produtos?: Produto[];
  prazo?: string;
  pagamento: PagamentoStatus;
  valorTotal?: number;
  entrada?: number;
  saldo?: number;
  formaPagamento?: FormaPagamento;
  // Marcado manualmente pelo usuário quando o pedido está travado por
  // algum motivo externo — sobrepõe a urgência calculada pelo prazo.
  parado?: boolean;
  // Ficha técnica: observações gerais do pedido (o detalhamento de
  // produção — arte, textos/nomes/números, grade de tamanhos, dimensões —
  // é individualizado por produto, ver Produto em "./venda").
  informacoesImportantes?: string;
  // Resultado da checagem na etapa "Conferência".
  conferenciaStatus?: ConferenciaStatus;
  conferenciaObservacoes?: string;
};

export function formatOS(numero: number): string {
  return `OS${String(numero).padStart(6, "0")}`;
}

// order.prazo vem de um <input type="date"> no formato ISO (YYYY-MM-DD).
export function formatPrazo(prazo: string): string {
  const [, month, day] = prazo.split("-");
  return `${day}/${month}`;
}

export const PRAZO_URGENCIAS = ["atrasado", "proximo", "no-prazo", "parado"] as const;
export type PrazoUrgencia = (typeof PRAZO_URGENCIAS)[number];

// Vermelho: atrasado (passou da data). Laranja: vencendo em até 4 dias.
// Verde: dentro do prazo. Cinza: marcado manualmente como parado.
export function prazoUrgencia(
  order: Pick<Order, "prazo" | "parado">
): PrazoUrgencia | undefined {
  if (order.parado) return "parado";
  if (!order.prazo) return undefined;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [ano, mes, dia] = order.prazo.split("-").map(Number);
  const dataPrazo = new Date(ano, mes - 1, dia);
  const diffDias = Math.round(
    (dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDias < 0) return "atrasado";
  if (diffDias <= 4) return "proximo";
  return "no-prazo";
}
