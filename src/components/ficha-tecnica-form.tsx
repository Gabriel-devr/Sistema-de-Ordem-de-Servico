import { Order, formatOS } from "@/types/pipe";
import { produtoTipoLabel } from "@/types/venda";

const infoBoxClass =
  "space-y-0.5 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300";
const sectionTitleClass =
  "mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100";

// Disponível pelo botão "Ficha técnica" no card a partir de "Pedido
// Confirmado": um espaço somente leitura, detalhado, do cliente, do pedido
// e de cada produto — reúne tudo que já foi informado ao longo do fluxo
// (no cadastro do cliente e no orçamento de cada produto) para conferência.
// Cada produto tem seu próprio detalhamento de produção (arte, textos/
// nomes/números, grade de tamanhos e dimensões da personalização), já que
// um mesmo pedido pode ter produtos diferentes com especificações
// diferentes.
export function FichaTecnicaForm({ order }: { order: Order }) {
  const produtos = order.produtos ?? [];
  const cliente = order.clienteInfo;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Resumo de tudo que já foi informado ao longo do fluxo — use para
        conferir se o pedido está correto antes da produção.
      </p>

      <div>
        <h3 className={sectionTitleClass}>Pedido</h3>
        <div className={infoBoxClass}>
          <p>OS: {order.numero !== undefined ? formatOS(order.numero) : "Sem OS"}</p>
          <p>Quantidade total: {order.quantidade}</p>
          <p>Prazo combinado: {order.prazo || "—"}</p>
          <p>
            Informações importantes: {order.informacoesImportantes || "—"}
          </p>
        </div>
      </div>

      <div>
        <h3 className={sectionTitleClass}>Cliente</h3>
        <div className={infoBoxClass}>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {cliente?.nome ?? order.cliente}
          </p>
          <p>
            Telefone: {cliente?.telefone || "—"} · WhatsApp:{" "}
            {cliente?.whatsapp || "—"}
          </p>
          <p>CPF/CNPJ: {cliente?.documento || "—"}</p>
          {cliente?.empresa && <p>Empresa: {cliente.empresa}</p>}
          {cliente?.observacoes && <p>Observações: {cliente.observacoes}</p>}
        </div>
      </div>

      <div>
        <h3 className={sectionTitleClass}>Produtos</h3>
        <div className="space-y-2">
          {produtos.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Nenhum produto cadastrado ainda.
            </p>
          )}
          {produtos.map((produto) => (
            <div key={produto.id} className={infoBoxClass}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {produtoTipoLabel(produto.tipo)}{" "}
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    (qtd: {produto.quantidade})
                  </span>
                </p>
                {produto.arte && (
                  /* eslint-disable-next-line @next/next/no-img-element -- data URL preview, next/image doesn't support this */
                  <img
                    src={produto.arte}
                    alt="Prévia da arte"
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                )}
              </div>
              {produto.descritivo && <p>Descritivo: {produto.descritivo}</p>}
              <p>
                Modelo:{" "}
                {[...produto.modelos, produto.bolso, produto.fechamento]
                  .filter(Boolean)
                  .join(", ") || "—"}{" "}
                · Cor: {produto.cores.join(", ") || "—"}
                {produto.tecido && ` · Tecido: ${produto.tecido}`}
                {produto.tamanho && ` · Tamanho: ${produto.tamanho}`}
              </p>
              <p>
                Personalização: {produto.personalizacaoTipo || "—"}
                {produto.personalizacaoLocais.length > 0 &&
                  ` · Local: ${produto.personalizacaoLocais.join(", ")}`}
              </p>
              {produto.personalizacaoObservacoes && (
                <p>
                  Obs. personalização: {produto.personalizacaoObservacoes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
