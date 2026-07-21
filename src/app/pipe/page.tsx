"use client";

import { useRef, useState } from "react";
import {
  STAGES,
  STAGE_LABELS,
  PRODUCTION_SUBSTAGES,
  PAGAMENTO_STATUS,
  CONFERENCIA_STATUS,
  Order,
  Stage,
  ProductionSubStage,
  PagamentoStatus,
  ConferenciaStatus,
  PrazoUrgencia,
  formatOS,
  formatPrazo,
  prazoUrgencia,
} from "@/types/pipe";
import { Client, Produto, produtoTipoLabel } from "@/types/venda";
import { Modal } from "@/components/modal";
import { ClienteForm, ProdutoForm, EditOrderForm } from "@/components/venda-form";
import { ArteForm } from "@/components/arte-form";
import { FichaTecnicaForm } from "@/components/ficha-tecnica-form";
import { PagamentoForm, PagamentoData } from "@/components/pagamento-form";

function formatPedidoResumo(produtos: Produto[]): string {
  return produtos
    .map((p) => {
      const descricao =
        p.modelos.length > 0
          ? `${produtoTipoLabel(p.tipo)} ${p.modelos.join(", ")}`
          : produtoTipoLabel(p.tipo);
      return `${descricao} · ${p.quantidade} un`;
    })
    .join(", ");
}

// IDs determinísticos para os dados de seed: gerados com crypto.randomUUID()
// eles diferem entre a renderização no servidor e a hidratação no cliente,
// causando mismatch. Como é dado fixo, um contador simples resolve.
let seedIdCounter = 0;
function seedId(prefix: string): string {
  seedIdCounter += 1;
  return `seed-${prefix}-${seedIdCounter}`;
}

// clienteId é preenchido depois, em mockOrder — aqui não importa o valor.
function mockProduto(
  tipo: Produto["tipo"],
  quantidade: number,
  extra: Partial<Produto> = {}
): Produto {
  return {
    id: seedId("produto"),
    clienteId: "",
    tipo,
    descritivo: "",
    quantidade,
    modelos: [],
    personalizacaoLocais: [],
    personalizacaoObservacoes: "",
    cores: [],
    subStage: "Corte",
    ...extra,
  };
}

function mockCliente(
  nome: string,
  telefone: string,
  extra: Partial<Omit<Client, "id" | "nome" | "telefone">> = {}
): Client {
  return {
    id: seedId("cliente"),
    nome,
    telefone,
    whatsapp: telefone,
    documento: "",
    empresa: "",
    observacoes: "",
    ...extra,
  };
}

// PNG transparente 1x1 — só para simular que uma arte foi anexada.
const MOCK_ARTE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function mockOrder(
  cliente: Client,
  stage: Stage,
  overrides: Partial<Order> = {}
): Order {
  const produtos = (overrides.produtos ?? []).map((p) => ({
    ...p,
    clienteId: cliente.id,
  }));
  return {
    id: seedId("order"),
    clienteId: cliente.id,
    cliente: cliente.nome,
    clienteInfo: cliente,
    pedido: produtos.length > 0 ? formatPedidoResumo(produtos) : "",
    quantidade: produtos.reduce((sum, p) => sum + p.quantidade, 0),
    stage,
    pagamento: "Pendente",
    ...overrides,
    produtos,
  };
}

let mockNumero = 0;
function proximoNumero(): number {
  mockNumero += 1;
  return mockNumero;
}

const SEED_ORDERS: Order[] = [
  // Cliente — leads recém-cadastrados, ainda sem produtos nem OS.
  mockOrder(
    mockCliente("Ana Beatriz Souza", "(11) 98888-1010", {
      observacoes: "Ainda decidindo modelo e quantidade.",
    }),
    "cliente"
  ),
  mockOrder(mockCliente("Rafael Torres", "(11) 98888-1011"), "cliente"),

  // Orçamento — produtos já montados no carrinho, aguardando confirmação.
  mockOrder(
    mockCliente("Carlos Eduardo Lima", "(11) 97777-2020", {
      empresa: "CrossFit Union",
    }),
    "orcamento",
    {
      produtos: [
        mockProduto("camiseta", 25, {
          modelos: ["Regata"],
          tecido: "Dry Fit",
          tamanho: "Adulto: G",
          personalizacaoTipo: "Sublimação",
          personalizacaoLocais: ["Frente", "Costas"],
          cores: ["Preto"],
        }),
      ],
      prazo: "2026-08-10",
    }
  ),
  mockOrder(mockCliente("Pet Shop Amigo Fiel", "(11) 97777-2021"), "orcamento", {
    produtos: [
      mockProduto("bandana-pet", 15, {
        personalizacaoTipo: "Bordado",
        cores: ["Azul"],
      }),
    ],
    prazo: "2026-08-12",
  }),

  // Pedido Confirmado — OS já gerada, aguardando arte.
  mockOrder(
    mockCliente("Studio Fit", "(11) 96666-3030", {
      documento: "12.345.678/0001-90",
      empresa: "Studio Fit Academia",
    }),
    "pedido-confirmado",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("moletom", 30, {
          bolso: "Canguru",
          fechamento: "Fechado",
          tamanho: "Adulto: M",
          personalizacaoTipo: "Bordado",
          personalizacaoLocais: ["Peito Esquerdo"],
          cores: ["Cinza"],
        }),
      ],
      prazo: "2026-08-05",
    }
  ),
  mockOrder(
    mockCliente("Empório Grão & Cia", "(11) 96666-3031", {
      documento: "13.456.789/0001-45",
      empresa: "Empório Grão & Cia",
    }),
    "pedido-confirmado",
    {
      numero: proximoNumero(),
      produtos: [mockProduto("avental", 25, { cores: ["Verde"] })],
      prazo: "2026-08-07",
    }
  ),

  // Arte Anexada — arte já enviada, aguardando ir para pagamento.
  mockOrder(
    mockCliente("Loja Bella", "(11) 95555-4040", {
      documento: "23.456.789/0001-01",
      empresa: "Loja Bella Confecções",
    }),
    "arte-anexada",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("polo", 20, {
          modelos: ["Básica"],
          tecido: "Algodão",
          tamanho: "Adulto: G",
          personalizacaoTipo: "Bordado",
          personalizacaoLocais: ["Peito Direito"],
          cores: ["Azul"],
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-08-01",
    }
  ),
  mockOrder(
    mockCliente("Auto Peças Rodão", "(11) 95555-4041", {
      documento: "24.567.890/0001-02",
      empresa: "Auto Peças Rodão",
    }),
    "arte-anexada",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("polo", 40, {
          modelos: ["Masculina"],
          tecido: "Algodão",
          tamanho: "Adulto: GG",
          personalizacaoTipo: "Bordado",
          personalizacaoLocais: ["Peito Esquerdo"],
          cores: ["Cinza"],
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-08-03",
    }
  ),

  // Pagamento — em cobrança, aguardando quitação para seguir à produção.
  mockOrder(
    mockCliente("Academia Vigor", "(11) 94444-5050", {
      documento: "34.567.890/0001-12",
      empresa: "Academia Vigor",
    }),
    "pagamento",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("camiseta", 100, {
          modelos: ["Regata"],
          tecido: "Dry Fit",
          tamanho: "Adulto: GG",
          personalizacaoTipo: "Sublimação",
          personalizacaoLocais: ["Frente"],
          cores: ["Vermelho"],
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-07-30",
      pagamento: "Parcial",
    }
  ),
  mockOrder(
    mockCliente("Salão Beleza Rara", "(11) 94444-5051", {
      documento: "35.678.901/0001-13",
      empresa: "Salão Beleza Rara",
    }),
    "pagamento",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("caneca", 30, {
          personalizacaoTipo: "Sublimação",
          arte: MOCK_ARTE,
        }),
        mockProduto("chaveiro", 30, {
          personalizacaoTipo: "Laser",
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-08-02",
      pagamento: "Pendente",
    }
  ),

  // Produção — na esteira (Corte → Costura → Impressão).
  mockOrder(
    mockCliente("Restaurante Sabor Caseiro", "(11) 93333-6060", {
      documento: "45.678.901/0001-23",
      empresa: "Sabor Caseiro Ltda",
      observacoes: "Uniforme da equipe de cozinha.",
    }),
    "producao",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("avental", 20, {
          cores: ["Preto"],
          personalizacaoLocais: ["Frente"],
          personalizacaoObservacoes: "Logo centralizado",
          subStage: "Costura",
          arte: MOCK_ARTE,
        }),
        mockProduto("bone", 15, {
          cores: ["Preto"],
          personalizacaoTipo: "Bordado",
          subStage: "Corte",
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-07-28",
      pagamento: "Parcial",
    }
  ),
  mockOrder(
    mockCliente("Padaria Pão Dourado", "(11) 93333-6061", {
      documento: "46.789.012/0001-24",
      empresa: "Padaria Pão Dourado",
    }),
    "producao",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("avental", 12, {
          cores: ["Branco"],
          personalizacaoTipo: "DTF",
          personalizacaoLocais: ["Frente"],
          subStage: "Corte",
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-07-29",
      pagamento: "Pago",
    }
  ),

  // Conferência — checagem final antes da retirada/entrega.
  mockOrder(
    mockCliente("Escola Nova Geração", "(11) 92222-7070", {
      documento: "56.789.012/0001-34",
      empresa: "Escola Nova Geração",
    }),
    "conferencia",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("camiseta", 60, {
          modelos: ["Infantil"],
          tecido: "Malha Fria",
          tamanho: "Infantil: 8",
          personalizacaoTipo: "DTF",
          personalizacaoLocais: ["Frente"],
          cores: ["Amarelo"],
          subStage: "Impressão",
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-07-26",
      pagamento: "Pago",
    }
  ),
  mockOrder(
    mockCliente("Condomínio Jardim das Flores", "(11) 92222-7071", {
      documento: "57.890.123/0001-35",
      empresa: "Condomínio Jardim das Flores",
    }),
    "conferencia",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("bandeira", 8, {
          cores: ["Verde"],
          personalizacaoTipo: "Silk Screen",
          subStage: "Impressão",
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-07-27",
      pagamento: "Parcial",
    }
  ),

  // Pronto para Retirada — aguardando o cliente buscar ou o transporte sair.
  mockOrder(
    mockCliente("Maria Fernanda Costa", "(11) 91111-8080", {
      observacoes: "Brinde corporativo.",
    }),
    "pronto-retirada",
    {
      numero: proximoNumero(),
      produtos: [
        mockProduto("copo-termico", 50, {
          cores: ["Branco"],
          personalizacaoTipo: "Laser",
          subStage: "Impressão",
          arte: MOCK_ARTE,
        }),
        mockProduto("squeeze", 50, {
          cores: ["Azul"],
          personalizacaoTipo: "Laser",
          subStage: "Impressão",
          arte: MOCK_ARTE,
        }),
      ],
      prazo: "2026-07-24",
      pagamento: "Pago",
    }
  ),
  mockOrder(mockCliente("Livraria Página Viva", "(11) 91111-8081"), "pronto-retirada", {
    numero: proximoNumero(),
    produtos: [
      mockProduto("sacochila", 30, {
        cores: ["Amarelo"],
        personalizacaoTipo: "Silk Screen",
        subStage: "Impressão",
        arte: MOCK_ARTE,
      }),
    ],
    prazo: "2026-07-25",
    pagamento: "Pago",
  }),

  // Entrega — a caminho do cliente.
  mockOrder(mockCliente("João Pedro Alves", "(11) 90000-9090"), "entrega", {
    numero: proximoNumero(),
    produtos: [
      mockProduto("ecobag", 40, {
        personalizacaoTipo: "Silk Screen",
        personalizacaoLocais: ["Frente"],
        cores: ["Verde"],
        subStage: "Impressão",
        arte: MOCK_ARTE,
      }),
    ],
    prazo: "2026-07-22",
    pagamento: "Pago",
  }),
  mockOrder(mockCliente("Farmácia Vida Saudável", "(11) 90000-9091"), "entrega", {
    numero: proximoNumero(),
    produtos: [
      mockProduto("avental", 10, {
        cores: ["Branco"],
        personalizacaoTipo: "DTF",
        subStage: "Impressão",
        arte: MOCK_ARTE,
      }),
    ],
    prazo: "2026-07-23",
    pagamento: "Pago",
  }),

  // Finalizado — pedidos concluídos.
  mockOrder(mockCliente("Maria Souza", "(11) 98888-0101"), "finalizado", {
    numero: proximoNumero(),
    produtos: [
      mockProduto("body", 10, {
        cores: ["Rosa"],
        personalizacaoTipo: "Bordado",
        personalizacaoLocais: ["Peito Esquerdo"],
        subStage: "Impressão",
        arte: MOCK_ARTE,
      }),
    ],
    prazo: "2026-07-20",
    pagamento: "Pago",
  }),
  mockOrder(mockCliente("Buffet Doce Sabor", "(11) 98888-0102"), "finalizado", {
    numero: proximoNumero(),
    produtos: [
      mockProduto("quadro-mdf", 5, {
        personalizacaoTipo: "Laser",
        subStage: "Impressão",
        arte: MOCK_ARTE,
      }),
    ],
    prazo: "2026-07-19",
    pagamento: "Pago",
  }),
];

const SEEDED_OS_COUNT = mockNumero;

export default function PipePage() {
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [produtoModalOrder, setProdutoModalOrder] = useState<Order | null>(
    null
  );
  const [fichaModalOrder, setFichaModalOrder] = useState<Order | null>(null);
  const [arteModalOrder, setArteModalOrder] = useState<Order | null>(null);
  const [pagamentoModalOrder, setPagamentoModalOrder] = useState<Order | null>(
    null
  );
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const nextNumeroRef = useRef(SEEDED_OS_COUNT);

  function moveStage(id: string, direction: 1 | -1) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const currentIndex = STAGES.indexOf(order.stage);
        const nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= STAGES.length) return order;
        const nextStage = STAGES[nextIndex];
        // A OS só é gerada quando o pedido é confirmado, nunca antes.
        const numero =
          direction === 1 &&
          nextStage === "pedido-confirmado" &&
          order.numero === undefined
            ? ++nextNumeroRef.current
            : order.numero;
        return { ...order, stage: nextStage, numero };
      })
    );
  }

  // Avançar de "Cliente" abre o orçamento (produtos); avançar de "Pedido
  // Confirmado" exige anexar a arte final de cada produto — é o único
  // ponto do fluxo onde a arte é anexada; avançar de "Arte Anexada" exige
  // preencher os dados de pagamento antes de liberar a etapa seguinte. A
  // ficha técnica fica disponível a qualquer momento pelo botão dedicado
  // no card a partir de "Pedido Confirmado", sem depender de avançar de
  // etapa. Em "Produção", cada produto percorre a esteira (Corte → Costura
  // → Impressão) de forma independente, clicando diretamente na estação
  // desejada.
  function handleAdvance(order: Order) {
    if (order.stage === "cliente") {
      setProdutoModalOrder(order);
      return;
    }
    if (order.stage === "pedido-confirmado") {
      setArteModalOrder(order);
      return;
    }
    if (order.stage === "arte-anexada") {
      setPagamentoModalOrder(order);
      return;
    }
    moveStage(order.id, 1);
  }

  function handleBack(order: Order) {
    moveStage(order.id, -1);
  }

  function updateSubStage(
    orderId: string,
    produtoId: string,
    subStage: ProductionSubStage
  ) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              produtos: (order.produtos ?? []).map((produto) =>
                produto.id === produtoId ? { ...produto, subStage } : produto
              ),
            }
          : order
      )
    );
  }

  function updatePagamento(id: string, pagamento: PagamentoStatus) {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, pagamento } : order))
    );
  }

  function setParado(id: string, parado: boolean) {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, parado } : order))
    );
  }

  function updateConferenciaStatus(
    id: string,
    conferenciaStatus: ConferenciaStatus | undefined
  ) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, conferenciaStatus } : order
      )
    );
  }

  function updateConferenciaObservacoes(id: string, conferenciaObservacoes: string) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, conferenciaObservacoes } : order
      )
    );
  }

  function removeOrder(id: string) {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }

  function handleCreateCliente(clienteData: Omit<Client, "id">) {
    const newClient: Client = { id: crypto.randomUUID(), ...clienteData };
    setOrders((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        clienteId: newClient.id,
        cliente: newClient.nome,
        clienteInfo: newClient,
        pedido: "",
        quantidade: 0,
        stage: "cliente",
        subStage: "Corte",
        produtos: [],
        pagamento: "Pendente",
      },
    ]);
    setIsClienteModalOpen(false);
  }

  function handleSaveEdit(
    orderId: string,
    clienteData: Omit<Client, "id">,
    produtos: Produto[],
    prazo: string | undefined,
    informacoesImportantes: string | undefined
  ) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          cliente: clienteData.nome,
          clienteInfo: { id: order.clienteId ?? order.id, ...clienteData },
          produtos,
          pedido: formatPedidoResumo(produtos),
          quantidade: produtos.reduce((sum, p) => sum + p.quantidade, 0),
          prazo,
          informacoesImportantes,
        };
      })
    );
    setEditOrder(null);
  }

  function handleConfirmArte(orderId: string, produtos: Produto[]) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, produtos, stage: "arte-anexada" }
          : order
      )
    );
    setArteModalOrder(null);
  }

  function handleConfirmPagamento(orderId: string, data: PagamentoData) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...data,
              stage: "pagamento",
            }
          : order
      )
    );
    setPagamentoModalOrder(null);
  }

  function handleConfirmProdutos(
    orderId: string,
    produtos: Produto[],
    prazo: string | undefined,
    informacoesImportantes: string | undefined
  ) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              produtos,
              pedido: formatPedidoResumo(produtos),
              quantidade: produtos.reduce((sum, p) => sum + p.quantidade, 0),
              prazo,
              informacoesImportantes,
              stage: "orcamento",
            }
          : order
      )
    );
    setProdutoModalOrder(null);
  }

  return (
    <div className="min-h-screen bg-gray-200 p-6 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Pipe de Produção
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fábrica de costura — acompanhamento de pedidos
          </p>
        </div>

        {isClienteModalOpen && (
          <Modal
            title="Novo cliente"
            onClose={() => setIsClienteModalOpen(false)}
          >
            <ClienteForm onSubmit={handleCreateCliente} />
          </Modal>
        )}

        {produtoModalOrder && (
          <Modal
            title={`Orçamento — ${produtoModalOrder.cliente}`}
            onClose={() => setProdutoModalOrder(null)}
          >
            <ProdutoForm
              clienteId={produtoModalOrder.clienteId ?? produtoModalOrder.id}
              clienteNome={produtoModalOrder.cliente}
              onConfirm={(produtos, prazo, informacoesImportantes) =>
                handleConfirmProdutos(
                  produtoModalOrder.id,
                  produtos,
                  prazo,
                  informacoesImportantes
                )
              }
            />
          </Modal>
        )}

        {fichaModalOrder && (
          <Modal
            title={`Ficha técnica — ${fichaModalOrder.cliente}`}
            onClose={() => setFichaModalOrder(null)}
          >
            <FichaTecnicaForm order={fichaModalOrder} />
          </Modal>
        )}

        {arteModalOrder && (
          <Modal
            title={`Arte — ${arteModalOrder.cliente}`}
            onClose={() => setArteModalOrder(null)}
          >
            <ArteForm
              order={arteModalOrder}
              onConfirm={(produtos) =>
                handleConfirmArte(arteModalOrder.id, produtos)
              }
            />
          </Modal>
        )}

        {pagamentoModalOrder && (
          <Modal
            title={`Pagamento — ${pagamentoModalOrder.cliente}`}
            onClose={() => setPagamentoModalOrder(null)}
          >
            <PagamentoForm
              onConfirm={(data) =>
                handleConfirmPagamento(pagamentoModalOrder.id, data)
              }
            />
          </Modal>
        )}

        {editOrder && (
          <Modal
            title={`Editar pedido — ${editOrder.cliente}`}
            onClose={() => setEditOrder(null)}
          >
            <EditOrderForm
              clienteId={editOrder.clienteId ?? editOrder.id}
              clienteInicial={
                editOrder.clienteInfo ?? {
                  nome: editOrder.cliente,
                  telefone: "",
                  whatsapp: "",
                  documento: "",
                  empresa: "",
                  observacoes: "",
                }
              }
              produtosIniciais={editOrder.produtos ?? []}
              prazoInicial={editOrder.prazo}
              informacoesImportantesInicial={editOrder.informacoesImportantes}
              onSave={(clienteData, produtos, prazo, informacoesImportantes) =>
                handleSaveEdit(
                  editOrder.id,
                  clienteData,
                  produtos,
                  prazo,
                  informacoesImportantes
                )
              }
            />
          </Modal>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2">
          {STAGES.map((stage, stageIndex) => {
            const stageOrders = orders.filter((o) => o.stage === stage);
            return (
              <div
                key={stage}
                className="flex w-72 shrink-0 flex-col rounded-lg border border-gray-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3 dark:border-neutral-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {STAGE_LABELS[stage]}
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                    {stageOrders.length}
                  </span>
                </div>
                <div className="flex min-h-[160px] flex-col gap-3 p-3">
                  {stage === "cliente" && (
                    <button
                      onClick={() => setIsClienteModalOpen(true)}
                      className="rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                    >
                      + Novo cliente
                    </button>
                  )}
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
                      onMoveBack={handleBack}
                      onAdvance={handleAdvance}
                      onEdit={setEditOrder}
                      onOpenFicha={setFichaModalOrder}
                      onSubStageChange={updateSubStage}
                      onPagamentoChange={updatePagamento}
                      onParadoChange={setParado}
                      onConferenciaStatusChange={updateConferenciaStatus}
                      onConferenciaObservacoesChange={
                        updateConferenciaObservacoes
                      }
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

// Esteira de produção: Corte → Costura → Impressão. Cada estação é clicável
// para marcar o pedido como tendo chegado ali (permite avançar e voltar).
function ProducaoEsteira({
  atual,
  onChange,
}: {
  atual: ProductionSubStage;
  onChange: (subStage: ProductionSubStage) => void;
}) {
  const indiceAtual = PRODUCTION_SUBSTAGES.indexOf(atual);

  return (
    <div className="flex items-start">
      {PRODUCTION_SUBSTAGES.map((sub, index) => (
        <div key={sub} className="flex flex-1 items-center last:flex-none">
          <button
            type="button"
            onClick={() => onChange(sub)}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-semibold ${
                index < indiceAtual
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : index === indiceAtual
                    ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                    : "border-gray-300 text-gray-300 dark:border-neutral-700 dark:text-neutral-700"
              }`}
            >
              {index < indiceAtual ? "✓" : index + 1}
            </span>
            <span
              className={`text-center text-[10px] leading-tight ${
                index <= indiceAtual
                  ? "font-medium text-gray-900 dark:text-gray-100"
                  : "text-gray-400 dark:text-gray-600"
              }`}
            >
              {sub}
            </span>
          </button>
          {index < PRODUCTION_SUBSTAGES.length - 1 && (
            <div
              className={`mb-3.5 h-0.5 flex-1 ${
                index < indiceAtual
                  ? "bg-gray-900 dark:bg-gray-100"
                  : "bg-gray-300 dark:bg-neutral-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const PAGAMENTO_CLASSES: Record<PagamentoStatus, string> = {
  Pendente:
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Parcial:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Pago: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const PRAZO_CLASSES: Record<PrazoUrgencia, string> = {
  atrasado: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  proximo:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "no-prazo":
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  parado: "bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-gray-300",
};
const PRAZO_SEM_DATA_CLASSES =
  "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400";

// Aplica a mesma urgência do prazo ao card inteiro (borda + fundo), não só
// ao rótulo do prazo.
const CARD_PRAZO_CLASSES: Record<PrazoUrgencia, string> = {
  atrasado:
    "border-red-500 bg-red-100 dark:border-red-700 dark:bg-red-950/70",
  proximo:
    "border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40",
  "no-prazo":
    "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/40",
  parado:
    "border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800",
};
const CARD_SEM_PRAZO_CLASSES =
  "border-gray-300 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900";

const CONFERENCIA_CLASSES: Record<ConferenciaStatus, string> = {
  Aprovado: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Reprovado: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "Voltar para produção":
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};
const CONFERENCIA_SEM_STATUS_CLASSES =
  "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400";

function OrderCard({
  order,
  canMoveBack,
  canMoveForward,
  onMoveBack,
  onAdvance,
  onEdit,
  onOpenFicha,
  onSubStageChange,
  onPagamentoChange,
  onParadoChange,
  onConferenciaStatusChange,
  onConferenciaObservacoesChange,
  onRemove,
}: {
  order: Order;
  canMoveBack: boolean;
  canMoveForward: boolean;
  onMoveBack: (order: Order) => void;
  onAdvance: (order: Order) => void;
  onEdit: (order: Order) => void;
  onOpenFicha: (order: Order) => void;
  onSubStageChange: (
    orderId: string,
    produtoId: string,
    subStage: ProductionSubStage
  ) => void;
  onPagamentoChange: (id: string, pagamento: PagamentoStatus) => void;
  onParadoChange: (id: string, parado: boolean) => void;
  onConferenciaStatusChange: (
    id: string,
    status: ConferenciaStatus | undefined
  ) => void;
  onConferenciaObservacoesChange: (id: string, observacoes: string) => void;
  onRemove: (id: string) => void;
}) {
  const showPagamento = STAGES.indexOf(order.stage) >= STAGES.indexOf("pagamento");
  const showFicha =
    STAGES.indexOf(order.stage) >= STAGES.indexOf("pedido-confirmado");
  const showConferencia = order.stage === "conferencia";
  const urgencia = prazoUrgencia(order);
  const prazoLabel = order.parado
    ? "Parado"
    : order.prazo
      ? `Prazo ${formatPrazo(order.prazo)}`
      : "Sem prazo";
  const prazoClassName = urgencia
    ? PRAZO_CLASSES[urgencia]
    : PRAZO_SEM_DATA_CLASSES;
  const cardClassName = urgencia
    ? CARD_PRAZO_CLASSES[urgencia]
    : CARD_SEM_PRAZO_CLASSES;

  return (
    <div className={`space-y-2 rounded-lg border p-3 shadow-sm ${cardClassName}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {order.numero !== undefined ? formatOS(order.numero) : "Sem OS"}
        </span>
        <div className="flex items-center gap-2">
          {showFicha && (
            <button
              onClick={() => onOpenFicha(order)}
              className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Ficha técnica
            </button>
          )}
          <button
            onClick={() => onEdit(order)}
            className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Editar
          </button>
          <button
            onClick={() => onRemove(order.id)}
            aria-label="Remover pedido"
            className="text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {order.cliente}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400">{order.pedido}</p>

      {order.produtos && order.produtos.length > 0 && (
        <div className="space-y-2">
          {order.produtos.map((produto) => (
            <div key={produto.id} className="space-y-1">
              {(produto.personalizacaoTipo ||
                produto.personalizacaoLocais.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {produtoTipoLabel(produto.tipo)}
                  </span>
                  {produto.personalizacaoTipo && (
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                      {produto.personalizacaoTipo}
                    </span>
                  )}
                  {produto.personalizacaoLocais.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {produto.personalizacaoLocais.join(", ")}
                    </span>
                  )}
                </div>
              )}

              {order.stage === "producao" && (
                <ProducaoEsteira
                  atual={produto.subStage}
                  onChange={(subStage) =>
                    onSubStageChange(order.id, produto.id, subStage)
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {showConferencia && (
        <div className="space-y-2 border-t border-gray-100 pt-2 dark:border-neutral-800">
          <select
            value={order.conferenciaStatus ?? ""}
            onChange={(e) =>
              onConferenciaStatusChange(
                order.id,
                (e.target.value || undefined) as
                  | ConferenciaStatus
                  | undefined
              )
            }
            className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${
              order.conferenciaStatus
                ? CONFERENCIA_CLASSES[order.conferenciaStatus]
                : CONFERENCIA_SEM_STATUS_CLASSES
            }`}
          >
            <option value="">Selecionar status</option>
            {CONFERENCIA_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <textarea
            value={order.conferenciaObservacoes ?? ""}
            onChange={(e) =>
              onConferenciaObservacoesChange(order.id, e.target.value)
            }
            placeholder="Observações"
            rows={2}
            className="w-full resize-y rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-neutral-800">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${prazoClassName}`}
        >
          {prazoLabel}
        </span>
        {showPagamento && (
          <select
            value={order.pagamento}
            onChange={(e) =>
              onPagamentoChange(order.id, e.target.value as PagamentoStatus)
            }
            className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${PAGAMENTO_CLASSES[order.pagamento]}`}
          >
            {PAGAMENTO_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
      </div>

      {order.stage === "producao" && (
        <div className="flex items-center gap-3 pt-1">
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name={`impedimento-${order.id}`}
              checked={!order.parado}
              onChange={() => onParadoChange(order.id, false)}
            />
            Sem impedimento
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name={`impedimento-${order.id}`}
              checked={!!order.parado}
              onChange={() => onParadoChange(order.id, true)}
            />
            Com impedimento
          </label>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onMoveBack(order)}
          disabled={!canMoveBack}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-700"
        >
          ← Voltar
        </button>
        <button
          onClick={() => onAdvance(order)}
          disabled={!canMoveForward}
          className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          Avançar →
        </button>
      </div>
    </div>
  );
}
