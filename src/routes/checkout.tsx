import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import {
  createMarketplaceCheckoutOrder,
  getMyOrders,
  getMarketplaceProducts,
  getSessionData,
  transitionMarketplaceOrderStatus,
} from "@/lib/auth-server";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
};

type PaymentMethod = "PIX" | "Cartão" | "Transferência" | "Boleto";
type CheckoutOutcome = "approved" | "declined";

const methods: PaymentMethod[] = ["PIX", "Cartão", "Boleto", "Transferência"];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("PIX");
  const [simulatedOutcome, setSimulatedOutcome] = useState<CheckoutOutcome>("approved");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<"idle" | "pending" | "approved" | "declined">("idle");
  const [gatewayPendingOrderId, setGatewayPendingOrderId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [gatewayCheckoutUrl, setGatewayCheckoutUrl] = useState<string | null>(null);

  const allowSimulation = import.meta.env.VITE_PAYMENT_GATEWAY_MODE !== "webhook";
  const isBrowser = typeof window !== "undefined";

  const selectedProduct = products.find((item) => item.id === selectedProductId) ?? null;

  useEffect(() => {
    if (!isBrowser) return;

    const fromQuery = new URLSearchParams(window.location.search).get("productId") ?? "";
    setSelectedProductId(fromQuery);
  }, [isBrowser]);

  useEffect(() => {
    setLoadingProducts(true);
    getSessionData()
      .then(() => getMarketplaceProducts())
      .then((list) => {
        setProducts(list as Product[]);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes("Sessão")) {
          if (isBrowser) {
            window.location.assign("/login");
          }
          return;
        }
        setLoadError("Não foi possível carregar os produtos do checkout.");
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  async function handleBuy() {
    if (!selectedProduct) {
      setError("Selecione um produto válido para continuar.");
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setOrderStatus("idle");
    setGatewayPendingOrderId(null);
    setPaymentReference(null);
    setGatewayCheckoutUrl(null);

    try {
      const order = await createMarketplaceCheckoutOrder({ data: { productId: selectedProduct.id, paymentMethod: selectedMethod } });
      setOrderStatus("pending");

      if ((order as { paymentProvider?: string }).paymentProvider === "gateway_webhook") {
        setGatewayPendingOrderId(order.orderId);
        setPaymentReference((order as { paymentReference?: string | null }).paymentReference ?? null);
        const checkoutUrl = (order as { providerCheckoutUrl?: string | null }).providerCheckoutUrl ?? null;
        setGatewayCheckoutUrl(checkoutUrl);
        if (checkoutUrl && isBrowser) {
          window.location.assign(checkoutUrl);
        }
        setSubmitting(false);
        return;
      }

      const result = await transitionMarketplaceOrderStatus({
        data: {
          orderId: order.orderId,
          status: simulatedOutcome,
        },
      });

      if (result.status === "approved") {
        setOrderStatus("approved");
        if (isBrowser) {
          window.location.assign("/membros");
        }
        return;
      }

      setOrderStatus("declined");
      setSubmitting(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível finalizar a compra.");
      setSubmitting(false);
    }
  }

  async function refreshGatewayPaymentStatus() {
    if (!gatewayPendingOrderId || refreshingStatus) return;

    setRefreshingStatus(true);
    setError(null);
    try {
      const orders = (await getMyOrders({ data: {} })) as Array<{ id: string; status: string }>;
      const order = orders.find((item) => item.id === gatewayPendingOrderId);
      if (!order) {
        throw new Error("Pedido não encontrado para atualização de status.");
      }

      if (order.status === "approved") {
        setOrderStatus("approved");
        if (isBrowser) {
          window.location.assign("/membros");
        }
        return;
      }

      if (order.status === "declined") {
        setOrderStatus("declined");
        setGatewayPendingOrderId(null);
        return;
      }

      setOrderStatus("pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o status do pedido.");
    } finally {
      setRefreshingStatus(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated mx-auto max-w-3xl p-7 md:p-9">
          <span className="eyebrow">Checkout</span>
          <h1 className="mt-2 text-3xl">Finalizar compra</h1>

          {loadingProducts ? (
            <StatusNotice variant="loading" message="Carregando dados do checkout..." className="mt-4" />
          ) : null}

          {loadError ? (
            <StatusNotice variant="error" message={loadError} className="mt-4" />
          ) : null}

          {!loadingProducts && !loadError && selectedProduct ? (
            <StatusNotice variant="success" message="Produto carregado. Você pode finalizar a compra." className="mt-4" />
          ) : null}

          {!selectedProduct ? (
            <StatusNotice
              variant={products.length === 0 ? "empty" : "info"}
              message={
                products.length === 0
                  ? "Nenhum produto publicado disponível para compra neste momento."
                  : "Produto não encontrado. Volte ao marketplace para selecionar um item."
              }
              className="mt-4"
            />
          ) : (
            <>
              <article className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{selectedProduct.description}</p>
                <p className="mt-3 text-sm uppercase tracking-wide text-muted-foreground">{selectedProduct.category}</p>
                <p className="mt-4 text-2xl font-semibold">{formatCurrency(selectedProduct.priceCents)}</p>
              </article>

              <div className="mt-6">
                <label className="field-label" htmlFor="method">Método de pagamento</label>
                <select
                  id="method"
                  className="field-input"
                  value={selectedMethod}
                  onChange={(event) => setSelectedMethod(event.target.value as PaymentMethod)}
                >
                  {methods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {allowSimulation ? (
                <div className="mt-4">
                  <label className="field-label" htmlFor="outcome">Resultado da simulação</label>
                  <select
                    id="outcome"
                    className="field-input"
                    value={simulatedOutcome}
                    onChange={(event) => setSimulatedOutcome(event.target.value as CheckoutOutcome)}
                  >
                    <option value="approved">Aprovar pagamento</option>
                    <option value="declined">Recusar pagamento</option>
                  </select>
                </div>
              ) : null}

              {orderStatus === "pending" ? (
                <StatusNotice
                  variant="info"
                  message="Pagamento em análise. Confirmando status do pedido..."
                  className="mt-4"
                />
              ) : null}

              {gatewayPendingOrderId ? (
                <StatusNotice
                  variant="info"
                  message={`Pagamento iniciado. Referência: ${paymentReference ?? "gerada"}. Assim que o gateway confirmar, seu acesso será liberado automaticamente.${gatewayCheckoutUrl ? " Você pode concluir o pagamento no link abaixo." : ""}`}
                  className="mt-4"
                />
              ) : null}

              {gatewayPendingOrderId && gatewayCheckoutUrl ? (
                <a href={gatewayCheckoutUrl} target="_blank" rel="noreferrer" className="btn-base btn-ghost mt-3 inline-flex">
                  Ir para pagamento Mercado Pago
                </a>
              ) : null}

              {orderStatus === "declined" ? (
                <StatusNotice
                  variant="error"
                  message="Pagamento recusado. Escolha outro método e tente novamente."
                  className="mt-4"
                />
              ) : null}

              {error ? (
                <StatusNotice variant="error" message={error} className="mt-4" />
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="btn-base btn-primary" onClick={handleBuy} disabled={submitting}>
                  {submitting ? "Processando..." : "Finalizar compra"}
                </button>
                {gatewayPendingOrderId ? (
                  <button
                    type="button"
                    className="btn-base btn-ghost"
                    onClick={refreshGatewayPaymentStatus}
                    disabled={refreshingStatus}
                  >
                    {refreshingStatus ? "Atualizando..." : "Atualizar status"}
                  </button>
                ) : null}
                <Link to="/marketplace" className="btn-base btn-ghost">
                  Voltar marketplace
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
