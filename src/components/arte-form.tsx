"use client";

import { useState, ChangeEvent } from "react";
import { Order } from "@/types/pipe";
import { Produto, produtoTipoLabel } from "@/types/venda";

// Etapa "Arte Anexada" do Kanban: exige anexar a arte final de cada produto
// do pedido antes de liberar a etapa seguinte. É o único lugar do fluxo
// onde a arte é anexada.
export function ArteForm({
  order,
  onConfirm,
}: {
  order: Order;
  onConfirm: (produtos: Produto[]) => void;
}) {
  const [produtos, setProdutos] = useState<Produto[]>(order.produtos ?? []);
  const podeConfirmar =
    produtos.length > 0 && produtos.every((produto) => produto.arte);

  function handleFileChange(
    produtoId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const arte = reader.result as string;
      setProdutos((prev) =>
        prev.map((produto) =>
          produto.id === produtoId ? { ...produto, arte } : produto
        )
      );
    };
    reader.readAsDataURL(file);
  }

  function removeArte(produtoId: string) {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === produtoId ? { ...produto, arte: undefined } : produto
      )
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Anexe a arte final de cada produto do pedido para avançar.
      </p>

      <div className="space-y-2">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {produtoTipoLabel(produto.tipo)}{" "}
              <span className="font-normal text-gray-500 dark:text-gray-400">
                (qtd: {produto.quantidade})
              </span>
            </p>
            <div className="flex items-center gap-2">
              {produto.arte && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview, next/image doesn't support this */}
                  <img
                    src={produto.arte}
                    alt="Prévia da arte"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeArte(produto.id)}
                    aria-label="Remover arte"
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Remover
                  </button>
                </>
              )}
              <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800">
                {produto.arte ? "Trocar arte" : "+ Anexar arte"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(produto.id, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onConfirm(produtos)}
        disabled={!podeConfirmar}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        Confirmar arte e avançar
      </button>
    </div>
  );
}
