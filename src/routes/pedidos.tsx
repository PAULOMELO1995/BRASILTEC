import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import { getMyOrderTimeline, getMyOrders, getSessionData } from "@/lib/auth-server";

type OrderStatus = "pending" | "approved" | "declined" | "refunded";

type Order = {
  id: string;
  productId: string;
  productName: string;
  amountCents: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

type TimelineEvent = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

export const Route = createFileRoute("/pedidos")({
  component: PedidosPage,
});

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function statusLabel(status: OrderStatus): string {
  if (status === "approved") return "Aprovado";
  if (status === "declined") return "Recusado";
  if (status === "refunded") return "Estornado";
  return "Pendente";
}

function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [productFilter, setProductFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [productOptions, setProductOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fromIso = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).toISOString() : undefined;
    const toIso = toDate ? new Date(`${toDate}T23:59:59.999Z`).toISOString() : undefined;

    setLoading(true);
    setError(null);
    getSessionData()
      .then(() =>
        getMyOrders({
          data: {
            status: statusFilter === "all" ? undefined : statusFilter,
            productId: productFilter === "all" ? undefined : productFilter,
            fromCreatedAt: fromIso,
            toCreatedAt: toIso,
          },
        }),
      )
      .then((items) => {
        if (!cancelled) {
          setOrders(items as Order[]);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes("Sessão")) {
          window.location.assign("/login");
          return;
        }
        if (!cancelled) {
          setError("Não foi possível carregar seus pedidos.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fromDate, productFilter, statusFilter, toDate]);

  useEffect(() => {
    getSessionData()
      .then(() => getMyOrders({ data: {} }))
      .then((items) => {
        const typed = items as Order[];
        const unique = new Map<string, string>();
        for (const order of typed) {
          if (!unique.has(order.productId)) {
            unique.set(order.productId, order.productName);
          }
        }
        setProductOptions(Array.from(unique.entries()).map(([id, name]) => ({ id, name })));
      })
      .catch(() => {
        setProductOptions([]);
      });
  }, []);

  const filteredOrders = useMemo(() => orders, [orders]);

  async function handleSelectOrder(orderId: string) {
    setSelectedOrderId(orderId);
    setTimelineLoading(true);
    setTimelineError(null);
    try {
      const events = await getMyOrderTimeline({ data: { orderId } });
      setTimeline(events as TimelineEvent[]);
    } catch {
      setTimeline([]);
      setTimelineError("Não foi possível carregar a timeline deste pedido.");
    } finally {
      setTimelineLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated mx-auto max-w-5xl p-7 md:p-9">
          <span className="eyebrow">Pedidos</span>
          <h1 className="mt-2 text-3xl">Histórico de compras</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acompanhe o status dos seus pedidos e a linha do tempo de eventos.</p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="field-label" htmlFor="status-filter">Filtrar por status</label>
            <select
              id="status-filter"
              className="field-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="declined">Recusado</option>
              <option value="refunded">Estornado</option>
            </select>

            <label className="field-label" htmlFor="product-filter">Filtrar por produto</label>
            <select
              id="product-filter"
              className="field-input"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
            >
              <option value="all">Todos os produtos</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <label className="field-label" htmlFor="from-date">Data inicial</label>
            <input
              id="from-date"
              type="date"
              className="field-input"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />

            <label className="field-label" htmlFor="to-date">Data final</label>
            <input
              id="to-date"
              type="date"
              className="field-input"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn-base btn-ghost"
              onClick={() => {
                setStatusFilter("all");
                setProductFilter("all");
                setFromDate("");
                setToDate("");
              }}
            >
              Limpar filtros
            </button>
          </div>

          {loading ? <StatusNotice variant="loading" message="Carregando pedidos..." className="mt-6" /> : null}
          {error ? <StatusNotice variant="error" message={error} className="mt-6" /> : null}
          {!loading && !error && filteredOrders.length > 0 ? (
            <StatusNotice
              variant="success"
              message={`${filteredOrders.length} pedido(s) encontrado(s) com os filtros atuais.`}
              className="mt-6"
            />
          ) : null}

          {!loading && !error && filteredOrders.length === 0 ? (
            <StatusNotice variant="empty" message="Nenhum pedido encontrado com o filtro atual." className="mt-6" />
          ) : null}

          {!loading && !error && filteredOrders.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="grid gap-3">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => void handleSelectOrder(order.id)}
                    className="panel w-full p-4 text-left"
                  >
                    <p className="font-medium text-foreground">{order.productName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{order.id}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span>{formatCurrency(order.amountCents)}</span>
                      <span className="text-muted-foreground">{order.paymentMethod}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs">{statusLabel(order.status)}</span>
                    </div>
                  </button>
                ))}
              </div>

              <aside className="panel p-4">
                <p className="text-sm font-medium">Timeline do pedido</p>
                {!selectedOrderId ? (
                  <StatusNotice variant="empty" message="Selecione um pedido para ver os eventos." className="mt-3" />
                ) : timelineLoading ? (
                  <StatusNotice variant="loading" message="Carregando eventos da timeline..." className="mt-3" />
                ) : timelineError ? (
                  <StatusNotice variant="error" message={timelineError} className="mt-3" />
                ) : timeline.length === 0 ? (
                  <StatusNotice variant="empty" message="Sem eventos disponíveis para este pedido." className="mt-3" />
                ) : (
                  <ol className="mt-3 grid gap-3">
                    {timeline.map((event) => (
                      <li key={event.id} className="rounded-xl border border-border/60 bg-background/70 p-3 text-sm">
                        <p className="font-medium">{statusLabel(event.status)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString("pt-BR")}</p>
                        {event.note ? <p className="mt-2 text-xs text-muted-foreground">{event.note}</p> : null}
                      </li>
                    ))}
                  </ol>
                )}
              </aside>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/marketplace" className="btn-base btn-ghost">
              Voltar ao marketplace
            </Link>
            <Link to="/painel" className="btn-base btn-primary">
              Ir para o painel
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
