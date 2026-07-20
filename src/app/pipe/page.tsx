"use client";

import { useState } from "react";
import {
  STAGES,
  STAGE_LABELS,
  PRODUCTION_SUBSTAGES,
  Order,
  ProductionSubStage,
} from "@/types/pipe";
import { Client, Produto } from "@/types/venda";
import { Modal } from "@/components/modal";
import { VendaForm } from "@/components/venda-form";

const SEED_ORDERS: Order[] = [
  {
    id: crypto.randomUUID(),
    cliente: "João Silva",
    pedido: "50 camisetas personalizadas",
    quantidade: 50,
    stage: "venda",
    subStage: "DTF",
  },
  {
    id: crypto.randomUUID(),
    cliente: "Studio Fit",
    pedido: "Arte para uniforme de time",
    quantidade: 30,
    stage: "design",
    subStage: "DTF",
  },
  {
    id: crypto.randomUUID(),
    cliente: "Loja Bella",
    pedido: "Bordado em jaquetas",
    quantidade: 20,
    stage: "producao",
    subStage: "Bordado",
  },
  {
    id: crypto.randomUUID(),
    cliente: "Academia Vigor",
    pedido: "Regatas sublimadas",
    quantidade: 100,
    stage: "producao",
    subStage: "Sublimação",
  },
  {
    id: crypto.randomUUID(),
    cliente: "Maria Souza",
    pedido: "10 vestidos sob medida",
    quantidade: 10,
    stage: "entrega",
    subStage: "Expedição",
  },
];

export default function PipePage() {
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [clients, setClients] = useState<Client[]>([]);
  const [isVendaOpen, setIsVendaOpen] = useState(false);

  function moveStage(id: string, direction: 1 | -1) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const currentIndex = STAGES.indexOf(order.stage);
        const nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= STAGES.length) return order;
        return { ...order, stage: STAGES[nextIndex] };
      })
    );
  }

  function updateSubStage(id: string, subStage: ProductionSubStage) {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, subStage } : order))
    );
  }

  function removeOrder(id: string) {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }

  function handleAddClient(client: Client) {
    setClients((prev) => [...prev, client]);
  }

  function handleCreatePedido(cliente: Client, produtos: Produto[]) {
    setOrders((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        cliente: cliente.nome,
        pedido: produtos
          .map((p) => `${p.quantidade}x ${p.nome}`)
          .join(", "),
        quantidade: produtos.reduce((sum, p) => sum + p.quantidade, 0),
        stage: "venda",
        subStage: "DTF",
        produtos,
      },
    ]);
    setIsVendaOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Pipe de Produção
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fábrica de costura — acompanhamento de pedidos
            </p>
          </div>
          <button
            onClick={() => setIsVendaOpen(true)}
            className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            + Novo pedido
          </button>
        </div>

        {isVendaOpen && (
          <Modal title="Novo pedido" onClose={() => setIsVendaOpen(false)}>
            <VendaForm
              clients={clients}
              onAddClient={handleAddClient}
              onCreatePedido={handleCreatePedido}
            />
          </Modal>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {STAGES.map((stage, stageIndex) => {
            const stageOrders = orders.filter((o) => o.stage === stage);
            return (
              <div
                key={stage}
                className="flex flex-col rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-neutral-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {STAGE_LABELS[stage]}
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                    {stageOrders.length}
                  </span>
                </div>
                <div className="flex min-h-[160px] flex-col gap-3 p-3">
                  {stageOrders.length === 0 && (
                    <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600">
                      Nenhum pedido
                    </p>
                  )}
                  {stageOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      canMoveBack={stageIndex > 0}
                      canMoveForward={stageIndex < STAGES.length - 1}
                      onMove={moveStage}
                      onSubStageChange={updateSubStage}
                      onRemove={removeOrder}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  canMoveBack,
  canMoveForward,
  onMove,
  onSubStageChange,
  onRemove,
}: {
  order: Order;
  canMoveBack: boolean;
  canMoveForward: boolean;
  onMove: (id: string, direction: 1 | -1) => void;
  onSubStageChange: (id: string, subStage: ProductionSubStage) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {order.cliente}
        </p>
        <button
          onClick={() => onRemove(order.id)}
          aria-label="Remover pedido"
          className="text-gray-400 hover:text-red-500"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{order.pedido}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Qtd: {order.quantidade}
      </p>
      {order.produtos && order.produtos.length > 0 && (
        <ul className="space-y-0.5 border-l-2 border-gray-200 pl-2 text-[11px] text-gray-500 dark:border-neutral-700 dark:text-gray-400">
          {order.produtos.map((produto) => (
            <li key={produto.id}>
              {produto.tipo} ·{" "}
              {[...produto.modelos, produto.bolso, produto.fechamento]
                .filter(Boolean)
                .join("/") || "—"}{" "}
              · Cor: {produto.cores.join("/") || "—"}
              {produto.tamanho && ` · Tam: ${produto.tamanho}`}
              {(produto.frente || produto.costa) &&
                ` · Estampa: ${[produto.frente && "Frente", produto.costa && "Costa"]
                  .filter(Boolean)
                  .join("/")}`}
            </li>
          ))}
        </ul>
      )}

      {order.stage === "producao" && (
        <select
          value={order.subStage}
          onChange={(e) =>
            onSubStageChange(order.id, e.target.value as ProductionSubStage)
          }
          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-900"
        >
          {PRODUCTION_SUBSTAGES.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onMove(order.id, -1)}
          disabled={!canMoveBack}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-700"
        >
          ← Voltar
        </button>
        <button
          onClick={() => onMove(order.id, 1)}
          disabled={!canMoveForward}
          className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          Avançar →
        </button>
      </div>
    </div>
  );
}
