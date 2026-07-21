"use client";

import { useState } from "react";
import {
  FORMA_PAGAMENTO,
  FormaPagamento,
  PAGAMENTO_STATUS,
  PagamentoStatus,
} from "@/types/pipe";

const inputClass =
  "rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export type PagamentoData = {
  valorTotal: number;
  entrada: number;
  saldo: number;
  formaPagamento: FormaPagamento;
  pagamento: PagamentoStatus;
};

// Etapa "Pagamento" do Kanban: registra valor total, entrada, forma de
// pagamento e situação financeira antes de liberar o pedido para produção.
export function PagamentoForm({
  onConfirm,
}: {
  onConfirm: (data: PagamentoData) => void;
}) {
  const [valorTotal, setValorTotal] = useState("");
  const [entrada, setEntrada] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<
    FormaPagamento | undefined
  >(undefined);
  const [situacao, setSituacao] = useState<PagamentoStatus>("Pendente");

  const valorTotalNum = Number(valorTotal) || 0;
  const entradaNum = Number(entrada) || 0;
  const saldo = Math.max(valorTotalNum - entradaNum, 0);

  const podeConfirmar = valorTotalNum > 0 && !!formaPagamento;

  function handleConfirmar() {
    if (!podeConfirmar || !formaPagamento) return;
    onConfirm({
      valorTotal: valorTotalNum,
      entrada: entradaNum,
      saldo,
      formaPagamento,
      pagamento: situacao,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Valor total
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Entrada
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Saldo
          </label>
          <input
            type="text"
            readOnly
            value={saldo.toFixed(2)}
            className={`${inputClass} w-full bg-gray-100 dark:bg-neutral-900`}
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
          Forma de pagamento
        </p>
        <div className="flex flex-wrap gap-3">
          {FORMA_PAGAMENTO.map((opcao) => (
            <label
              key={opcao}
              className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"
            >
              <input
                type="radio"
                checked={formaPagamento === opcao}
                onChange={() => setFormaPagamento(opcao)}
              />
              {opcao}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
          Situação financeira
        </p>
        <div className="flex flex-wrap gap-3">
          {PAGAMENTO_STATUS.map((status) => (
            <label
              key={status}
              className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"
            >
              <input
                type="radio"
                checked={situacao === status}
                onChange={() => setSituacao(status)}
              />
              {status}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirmar}
        disabled={!podeConfirmar}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        Confirmar pagamento e avançar
      </button>
    </div>
  );
}
