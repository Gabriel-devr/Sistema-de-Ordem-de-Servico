"use client";

import { Dispatch, SetStateAction, useState, FormEvent } from "react";
import {
  Client,
  Produto,
  ProdutoTipo,
  PRODUTO_CATEGORIAS,
  PRODUTO_TIPOS,
  produtoTipoLabel,
  MODELOS_POR_TIPO,
  BOLSO_OPCOES,
  FECHAMENTO_OPCOES,
  TECIDO_OPCOES,
  PERSONALIZACAO_LOCAIS,
  personalizacaoCamposDoTipo,
  CORES,
  TAMANHOS_GRUPOS,
  TIPOS_COM_TAMANHO,
  TIPOS_COM_TECIDO,
} from "@/types/venda";

const inputClass =
  "rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800";
const textareaClass = `${inputClass} resize-y`;

const CLIENTE_VAZIO: Omit<Client, "id"> = {
  nome: "",
  telefone: "",
  whatsapp: "",
  documento: "",
  empresa: "",
  observacoes: "",
};

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

// Campos de cliente reutilizados tanto no cadastro (ClienteForm) quanto na
// edição de um pedido já existente (EditOrderForm).
function ClienteFields({
  value,
  onChange,
}: {
  value: Omit<Client, "id">;
  onChange: (value: Omit<Client, "id">) => void;
}) {
  return (
    <>
      <input
        placeholder="Nome"
        value={value.nome}
        onChange={(e) => onChange({ ...value, nome: e.target.value })}
        className={inputClass}
      />
      <input
        placeholder="Telefone"
        value={value.telefone}
        onChange={(e) => onChange({ ...value, telefone: e.target.value })}
        className={inputClass}
      />
      <input
        placeholder="Whatsapp"
        value={value.whatsapp}
        onChange={(e) => onChange({ ...value, whatsapp: e.target.value })}
        className={inputClass}
      />
      <input
        placeholder="CPF/CNPJ"
        value={value.documento}
        onChange={(e) => onChange({ ...value, documento: e.target.value })}
        className={inputClass}
      />
      <input
        placeholder="Empresa"
        value={value.empresa}
        onChange={(e) => onChange({ ...value, empresa: e.target.value })}
        className={`${inputClass} sm:col-span-2`}
      />
      <textarea
        placeholder="Observações"
        value={value.observacoes}
        onChange={(e) => onChange({ ...value, observacoes: e.target.value })}
        rows={2}
        className={`${textareaClass} sm:col-span-2`}
      />
    </>
  );
}

// Etapa "Cliente" do Kanban: só cadastra o cliente, sem produtos ainda.
// Reutilizado também para editar os dados de um cliente já cadastrado.
export function ClienteForm({
  initialValue,
  submitLabel = "+ Cadastrar cliente",
  onSubmit,
}: {
  initialValue?: Omit<Client, "id">;
  submitLabel?: string;
  onSubmit: (cliente: Omit<Client, "id">) => void;
}) {
  const [clienteForm, setClienteForm] = useState(
    initialValue ?? CLIENTE_VAZIO
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!clienteForm.nome.trim()) return;
    onSubmit(clienteForm);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      <ClienteFields value={clienteForm} onChange={setClienteForm} />
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 sm:col-span-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        {submitLabel}
      </button>
    </form>
  );
}

// Formulário de "adicionar produto" + carrinho, compartilhado entre o
// orçamento inicial (ProdutoForm) e a edição de um pedido (EditOrderForm).
function ProdutoBuilder({
  clienteId,
  cart,
  setCart,
}: {
  clienteId: string;
  cart: Produto[];
  setCart: Dispatch<SetStateAction<Produto[]>>;
}) {
  const [tipo, setTipo] = useState<ProdutoTipo>("camiseta");
  const [modelos, setModelos] = useState<string[]>([]);
  const [bolso, setBolso] = useState<Produto["bolso"]>(undefined);
  const [fechamento, setFechamento] = useState<Produto["fechamento"]>(undefined);
  const [tecido, setTecido] = useState<Produto["tecido"]>(undefined);
  const [tamanhoGrupo, setTamanhoGrupo] = useState<string | undefined>(
    undefined
  );
  const [tamanhoValor, setTamanhoValor] = useState<string | undefined>(
    undefined
  );
  const [personalizacaoTipo, setPersonalizacaoTipo] =
    useState<Produto["personalizacaoTipo"]>(undefined);
  const [personalizacaoLocais, setPersonalizacaoLocais] = useState<string[]>(
    []
  );
  const [personalizacaoObservacoes, setPersonalizacaoObservacoes] =
    useState("");
  const [cores, setCores] = useState<string[]>([]);
  const [descritivo, setDescritivo] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  const modeloOptions = MODELOS_POR_TIPO[tipo] ?? [];
  const showTamanho = TIPOS_COM_TAMANHO.includes(tipo);
  const showTecido = TIPOS_COM_TECIDO.includes(tipo);
  const tamanhoOpcoes =
    TAMANHOS_GRUPOS.find((g) => g.grupo === tamanhoGrupo)?.opcoes ?? [];
  const personalizacaoCampos = personalizacaoCamposDoTipo(tipo);

  function handleTipoChange(value: ProdutoTipo) {
    setTipo(value);
    setModelos([]);
    setBolso(undefined);
    setFechamento(undefined);
    setTecido(undefined);
    setTamanhoGrupo(undefined);
    setTamanhoValor(undefined);
    setPersonalizacaoTipo(undefined);
    setPersonalizacaoLocais([]);
    setPersonalizacaoObservacoes("");
  }

  function handleAddProduto(event: FormEvent) {
    event.preventDefault();
    const novoProduto: Produto = {
      id: crypto.randomUUID(),
      clienteId,
      tipo,
      descritivo: descritivo.trim(),
      quantidade,
      modelos,
      bolso,
      fechamento,
      tecido,
      tamanho:
        tamanhoGrupo && tamanhoValor
          ? `${tamanhoGrupo}: ${tamanhoValor}`
          : undefined,
      personalizacaoTipo,
      personalizacaoLocais,
      personalizacaoObservacoes: personalizacaoObservacoes.trim(),
      cores,
      subStage: "Corte",
    };
    setCart((prev) => [...prev, novoProduto]);
    setModelos([]);
    setBolso(undefined);
    setFechamento(undefined);
    setTecido(undefined);
    setTamanhoGrupo(undefined);
    setTamanhoValor(undefined);
    setPersonalizacaoTipo(undefined);
    setPersonalizacaoLocais([]);
    setPersonalizacaoObservacoes("");
    setCores([]);
    setDescritivo("");
    setQuantidade(1);
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <form onSubmit={handleAddProduto} className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            Tipo de produto
          </p>
          <select
            value={tipo}
            onChange={(e) => handleTipoChange(e.target.value as ProdutoTipo)}
            className={inputClass}
          >
            {PRODUTO_CATEGORIAS.map((categoria) => (
              <optgroup key={categoria.value} label={categoria.label}>
                {PRODUTO_TIPOS.filter(
                  (option) => option.categoria === categoria.value
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
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

        {showTecido && (
          <RadioGroup
            label="Tecido"
            options={TECIDO_OPCOES}
            selected={tecido}
            onSelect={(value) => setTecido(value as Produto["tecido"])}
          />
        )}

        {tipo === "moletom" && (
          <>
            <RadioGroup
              label="Bolso"
              options={BOLSO_OPCOES}
              selected={bolso}
              onSelect={(value) => setBolso(value as Produto["bolso"])}
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

        {personalizacaoCampos.tipo && (
          <RadioGroup
            label="Tipo de personalização"
            options={personalizacaoCampos.tipoOpcoes}
            selected={personalizacaoTipo}
            onSelect={(value) =>
              setPersonalizacaoTipo(value as Produto["personalizacaoTipo"])
            }
          />
        )}

        {personalizacaoCampos.local && (
          <CheckboxGroup
            label="Local da personalização"
            options={PERSONALIZACAO_LOCAIS}
            selected={personalizacaoLocais}
            onToggle={(value) =>
              setPersonalizacaoLocais((prev) => toggleInArray(prev, value))
            }
          />
        )}

        {personalizacaoCampos.observacoes && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Observações da personalização
            </label>
            <textarea
              value={personalizacaoObservacoes}
              onChange={(e) => setPersonalizacaoObservacoes(e.target.value)}
              rows={2}
              className={`${textareaClass} w-full`}
            />
          </div>
        )}

        <CheckboxGroup
          label="Cor"
          options={CORES}
          selected={cores}
          onToggle={(value) => setCores((prev) => toggleInArray(prev, value))}
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          + Adicionar produto
        </button>
      </form>

      {cart.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Carrinho
          </h3>
          <div className="space-y-2">
            {cart.map((produto) => (
              <div
                key={produto.id}
                className="flex items-start justify-between rounded-md border border-gray-200 bg-gray-50 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {produtoTipoLabel(produto.tipo)}{" "}
                    <span className="font-normal text-gray-500 dark:text-gray-400">
                      (qtd: {produto.quantidade})
                    </span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Modelo:{" "}
                    {[...produto.modelos, produto.bolso, produto.fechamento]
                      .filter(Boolean)
                      .join(", ") || "—"}{" "}
                    · Cor: {produto.cores.join(", ") || "—"}
                    {produto.tecido && ` · Tecido: ${produto.tecido}`}
                    {produto.tamanho && ` · Tamanho: ${produto.tamanho}`}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {produto.personalizacaoTipo &&
                      `Personalização: ${produto.personalizacaoTipo}`}
                    {produto.personalizacaoLocais.length > 0 &&
                      ` · Local: ${produto.personalizacaoLocais.join(", ")}`}
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
    </>
  );
}

// Etapa "Orçamento" do Kanban: monta o carrinho de produtos de um cliente já
// cadastrado. Ao confirmar, o pedido avança de Cliente para Orçamento.
export function ProdutoForm({
  clienteId,
  clienteNome,
  initialProdutos = [],
  initialPrazo,
  initialInformacoesImportantes,
  confirmLabel = "Confirmar orçamento",
  onConfirm,
}: {
  clienteId: string;
  clienteNome: string;
  initialProdutos?: Produto[];
  initialPrazo?: string;
  initialInformacoesImportantes?: string;
  confirmLabel?: string;
  onConfirm: (
    produtos: Produto[],
    prazo: string | undefined,
    informacoesImportantes: string | undefined
  ) => void;
}) {
  const [cart, setCart] = useState<Produto[]>(initialProdutos);
  const [prazo, setPrazo] = useState(initialPrazo ?? "");
  const [informacoesImportantes, setInformacoesImportantes] = useState(
    initialInformacoesImportantes ?? ""
  );

  function handleConfirmar() {
    if (cart.length === 0) return;
    onConfirm(cart, prazo || undefined, informacoesImportantes.trim() || undefined);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Cliente:{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {clienteNome}
        </span>
      </p>

      <ProdutoBuilder clienteId={clienteId} cart={cart} setCart={setCart} />

      {cart.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Prazo
          </label>
          <input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {cart.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Informações importantes
          </label>
          <textarea
            value={informacoesImportantes}
            onChange={(e) => setInformacoesImportantes(e.target.value)}
            rows={2}
            className={`${textareaClass} w-full`}
          />
        </div>
      )}

      <button
        onClick={handleConfirmar}
        disabled={cart.length === 0}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        {confirmLabel} ({cart.length} {cart.length === 1 ? "item" : "itens"})
      </button>
    </div>
  );
}

// Edição de um pedido já existente, disponível em qualquer etapa: permite
// corrigir os dados do cliente e ajustar os produtos/prazo sem mudar de fase.
export function EditOrderForm({
  clienteId,
  clienteInicial,
  produtosIniciais,
  prazoInicial,
  informacoesImportantesInicial,
  onSave,
}: {
  clienteId: string;
  clienteInicial: Omit<Client, "id">;
  produtosIniciais: Produto[];
  prazoInicial: string | undefined;
  informacoesImportantesInicial: string | undefined;
  onSave: (
    cliente: Omit<Client, "id">,
    produtos: Produto[],
    prazo: string | undefined,
    informacoesImportantes: string | undefined
  ) => void;
}) {
  const [clienteForm, setClienteForm] = useState(clienteInicial);
  const [cart, setCart] = useState<Produto[]>(produtosIniciais);
  const [prazo, setPrazo] = useState(prazoInicial ?? "");
  const [informacoesImportantes, setInformacoesImportantes] = useState(
    informacoesImportantesInicial ?? ""
  );

  function handleSalvar() {
    onSave(
      clienteForm,
      cart,
      prazo || undefined,
      informacoesImportantes.trim() || undefined
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Cliente
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ClienteFields value={clienteForm} onChange={setClienteForm} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Produtos
        </h3>
        <ProdutoBuilder clienteId={clienteId} cart={cart} setCart={setCart} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          Prazo
        </label>
        <input
          type="date"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          Informações importantes
        </label>
        <textarea
          value={informacoesImportantes}
          onChange={(e) => setInformacoesImportantes(e.target.value)}
          rows={2}
          className={`${textareaClass} w-full`}
        />
      </div>

      <button
        onClick={handleSalvar}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        Salvar alterações
      </button>
    </div>
  );
}
