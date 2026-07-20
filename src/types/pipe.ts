import { Produto } from "./venda";

export const STAGES = ["venda", "design", "producao", "entrega"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  venda: "Venda",
  design: "Design",
  producao: "Produção",
  entrega: "Entrega",
};

export const PRODUCTION_SUBSTAGES = [
  "DTF",
  "DTG",
  "Corte",
  "Sublimação",
  "Silk",
  "Laser",
  "Bordado",
  "Costura",
  "Expedição",
] as const;
export type ProductionSubStage = (typeof PRODUCTION_SUBSTAGES)[number];

export type Order = {
  id: string;
  cliente: string;
  pedido: string;
  quantidade: number;
  stage: Stage;
  subStage: ProductionSubStage;
  produtos?: Produto[];
};
