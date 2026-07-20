"use client";

import { useState, FormEvent } from "react";
import {
  Client,
  Produto,
  ProdutoTipo,
  PRODUTO_TIPOS,
  MODELOS_POR_TIPO,
  BOLSO_OPCOES,
  FECHAMENTO_OPCOES,
  CORES,
  TAMANHOS_GRUPOS,
  TIPOS_COM_TAMANHO,
} from "@/types/venda";

const inputClass =
  "rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800";

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function RadioGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  selected: string | undefined;
  onSelect: (value: string | undefined) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            checked={!selected}
            onChange={() => onSelect(undefined)}
          />
          Nenhum
        </label>
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"
          >
            <input
              type="radio"
              checked={selected === option}
              onChange={() => onSelect(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export function VendaForm({
  clients,
  onAddClient,
  onCreatePedido,
}: {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onCreatePedido: (cliente: Client, produtos: Produto[]) => void;
}) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    null
  );
  const [clienteForm, setClienteForm] = useState({
    nome: "",
    telefone: "",
    documento: "",
    endereco: "",
    email: "",
  });

  // Carrinho por cliente: cada cliente mantém seus próprios produtos
  // pendentes, então trocar de cliente no meio do cadastro não perde nada.
  const [carts, setCarts] = useState<Record<string, Produto[]>>({});

  const [tipo, setTipo] = useState<ProdutoTipo>("camiseta");
  const [modelos, setModelos] = useState<string[]>([]);
  const [bolso, setBolso] = useState<Produto["bolso"]>(undefined);
  const [fechamento, setFechamento] = useState<Produto["fechamento"]>(undefined);
  const [tamanhoGrupo, setTamanhoGrupo] = useState<string | undefined>(
    undefined
  );
  const [tamanhoValor, setTamanhoValor] = useState<string | undefined>(
    undefined
  );
  const [frente, setFrente] = useState(false);
  const [costa, setCosta] = useState(false);
  const [cores, setCores] = useState<string[]>([]);
  const [nomeProduto, setNomeProduto] = useState("");
  const [descritivo, setDescritivo] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  const modeloOptions = MODELOS_POR_TIPO[tipo] ?? [];
  const showTamanho = TIPOS_COM_TAMANHO.includes(tipo);
  const tamanhoOpcoes =
    TAMANHOS_GRUPOS.find((g) => g.grupo === tamanhoGrupo)?.opcoes ?? [];
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const cart = selectedClientId ? carts[selectedClientId] ?? [] : [];

  function handleTipoChange(value: ProdutoTipo) {
    setTipo(value);
    setModelos([]);
    setBolso(undefined);
    setFechamento(undefined);
    setTamanhoGrupo(undefined);
    setTamanhoValor(undefined);
  }

  function handleAddClient(event: FormEvent) {
    event.preventDefault();
    if (!clienteForm.nome.trim()) return;
    const newClient: Client = { id: crypto.randomUUID(), ...clienteForm };
    onAddClient(newClient);
    setSelectedClientId(newClient.id);
    setClienteForm({
      nome: "",
      telefone: "",
      documento: "",
      endereco: "",
      email: "",
    });
  }

  function handleAddProduto(event: FormEvent) {
    event.preventDefault();
    if (!selectedClientId || !nomeProduto.trim()) return;
    const novoProduto: Produto = {
      id: crypto.randomUUID(),
      clienteId: selectedClientId,
      tipo,
      nome: nomeProduto.trim(),
      descritivo: descritivo.trim(),
      quantidade,
      modelos,
      bolso,
      fechamento,
      tamanho:
        tamanhoGrupo && tamanhoValor
          ? `${tamanhoGrupo}: ${tamanhoValor}`
          : undefined,
      frente,
      costa,
      cores,
    };
    setCarts((prev) => ({
      ...prev,
      [selectedClientId]: [...(prev[selectedClientId] ?? []), novoProduto],
    }));
    setModelos([]);
    setBolso(undefined);
    setFechamento(undefined);
    setTamanhoGrupo(undefined);
    setTamanhoValor(undefined);
    setFrente(false);
    setCosta(false);
    setCores([]);
    setNomeProduto("");
    setDescritivo("");
    setQuantidade(1);
  }

  function removeFromCart(id: string) {
    if (!selectedClientId) return;
    setCarts((prev) => ({
      ...prev,
      [selectedClientId]: (prev[selectedClientId] ?? []).filter(
        (p) => p.id !== id
      ),
    }));
  }

  function handleCriarPedido() {
    if (!selectedClient || cart.length === 0) return;
    onCreatePedido(selectedClient, cart);
    setCarts((prev) => ({ ...prev, [selectedClient.id]: [] }));
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Cliente
        </h3>
        {clients.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {clients.map((client) => {
              const count = carts[client.id]?.length ?? 0;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`rounded-md px-2 py-1 text-xs ${
                    selectedClientId === client.id
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {client.nome}
                  {count > 0 && ` (${count})`}
                </button>
              );
            })}
          </div>
        )}

        {!selectedClient && (
          <form
            onSubmit={handleAddClient}
            className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-2 dark:border-neutral-800"
          >
            <input
              placeholder="Nome"
              value={clienteForm.nome}
              onChange={(e) =>
                setClienteForm({ ...clienteForm, nome: e.target.value })
              }
              className={inputClass}
            />
            <input
              placeholder="Telefone"
              value={clienteForm.telefone}
              onChange={(e) =>
                setClienteForm({ ...clienteForm, telefone: e.target.value })
              }
              className={inputClass}
            />
            <input
              placeholder="CPF ou CNPJ"
              value={clienteForm.documento}
              onChange={(e) =>
                setClienteForm({ ...clienteForm, documento: e.target.value })
              }
              className={inputClass}
            />
            <input
              placeholder="Endereço"
              value={clienteForm.endereco}
              onChange={(e) =>
                setClienteForm({ ...clienteForm, endereco: e.target.value })
              }
              className={inputClass}
            />
            <input
              placeholder="Email"
              value={clienteForm.email}
              onChange={(e) =>
                setClienteForm({ ...clienteForm, email: e.target.value })
              }
              className={`${inputClass} sm:col-span-2`}
            />
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 sm:col-span-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              + Cadastrar cliente
            </button>
          </form>
        )}
      </div>

      {selectedClient && (
        <>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Produto
            </h3>
            <form onSubmit={handleAddProduto} className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Tipo de produto
                </p>
                <select
                  value={tipo}
                  onChange={(e) =>
                    handleTipoChange(e.target.value as ProdutoTipo)
                  }
                  className={inputClass}
                >
                  {PRODUTO_TIPOS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {modeloOptions.length > 0 && (
                <CheckboxGroup
                  label="Modelo"
                  options={modeloOptions}
                  selected={modelos}
                  onToggle={(value) =>
                    setModelos((prev) => toggleInArray(prev, value))
                  }
                />
              )}

              {tipo === "moletom" && (
                <>
                  <RadioGroup
                    label="Bolso"
                    options={BOLSO_OPCOES}
                    selected={bolso}
                    onSelect={(value) =>
                      setBolso(value as Produto["bolso"])
                    }
                  />
                  <RadioGroup
                    label="Fechamento"
                    options={FECHAMENTO_OPCOES}
                    selected={fechamento}
                    onSelect={(value) =>
                      setFechamento(value as Produto["fechamento"])
                    }
                  />
                </>
              )}

              {showTamanho && (
                <>
                  <RadioGroup
                    label="Categoria de tamanho"
                    options={TAMANHOS_GRUPOS.map((g) => g.grupo)}
                    selected={tamanhoGrupo}
                    onSelect={(value) => {
                      setTamanhoGrupo(value);
                      setTamanhoValor(undefined);
                    }}
                  />
                  {tamanhoGrupo && (
                    <RadioGroup
                      label="Tamanho"
                      options={tamanhoOpcoes}
                      selected={tamanhoValor}
                      onSelect={(value) => setTamanhoValor(value)}
                    />
                  )}
                </>
              )}

              <div>
                <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Estampa
                </p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={frente}
                      onChange={() => setFrente(!frente)}
                    />
                    Frente
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={costa}
                      onChange={() => setCosta(!costa)}
                    />
                    Costa
                  </label>
                </div>
              </div>

              <CheckboxGroup
                label="Cor"
                options={CORES}
                selected={cores}
                onToggle={(value) =>
                  setCores((prev) => toggleInArray(prev, value))
                }
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  placeholder="Nome do produto"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Descritivo"
                  value={descritivo}
                  onChange={(e) => setDescritivo(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
              >
                + Adicionar produto ao pedido
              </button>
            </form>
          </div>

          {cart.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Carrinho de {selectedClient.nome}
              </h3>
              <div className="space-y-2">
                {cart.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex items-start justify-between rounded-md border border-gray-200 bg-gray-50 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {produto.nome}{" "}
                        <span className="font-normal text-gray-500 dark:text-gray-400">
                          ({produto.tipo}, qtd: {produto.quantidade})
                        </span>
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Modelo:{" "}
                        {[...produto.modelos, produto.bolso, produto.fechamento]
                          .filter(Boolean)
                          .join(", ") || "—"}{" "}
                        · Cor: {produto.cores.join(", ") || "—"}
                        {produto.tamanho && ` · Tamanho: ${produto.tamanho}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(produto.id)}
                      aria-label="Remover produto"
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCriarPedido}
            disabled={cart.length === 0}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Criar pedido ({cart.length} {cart.length === 1 ? "item" : "itens"})
          </button>
        </>
      )}
    </div>
  );
}
