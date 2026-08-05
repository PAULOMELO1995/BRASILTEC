import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import { createWithdrawalRequest, getFinanceData, getSessionData } from "@/lib/auth-server";

export const Route = createFileRoute("/financeiro")({
  component: FinanceiroPage,
});

type FinanceData = {
  grossSalesCents: number;
  platformFeeRate: number;
  platformFeeCents: number;
  netSalesCents: number;
  withdrawApprovedCents: number;
  withdrawRequestedCents: number;
  reservedWithdrawCents: number;
  availableBalanceCents: number;
  recentWithdrawals: Array<{
    id: string;
    amountCents: number;
    method: string;
    status: string;
    createdAt: string;
  }>;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function FinanceiroPage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const finance = await getFinanceData();
      setData(finance as FinanceData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSessionData()
      .then(() => load())
      .catch(() => window.location.assign("/login"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const amount = Number(String(form.get("amount") ?? "0").replace(",", "."));
    const method = String(form.get("method") ?? "PIX");

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Informe um valor válido para saque.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createWithdrawalRequest({ data: { amountCents: Math.round(amount * 100), method } });
      await load();
      setSuccess("Solicitação de saque enviada com sucesso.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível solicitar saque.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated p-7 md:p-9">
          <span className="eyebrow">Financeiro</span>
          <h1 className="mt-2 text-3xl">Saldo e saques</h1>

          {loading ? <StatusNotice variant="loading" message="Carregando dados financeiros..." className="mt-4" /> : null}
          {error ? <StatusNotice variant="error" message={error} className="mt-4" /> : null}
          {success ? <StatusNotice variant="success" message={success} className="mt-4" /> : null}

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Receita bruta</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.grossSalesCents ?? 0)}</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Taxa da plataforma</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.platformFeeCents ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{Math.round((data?.platformFeeRate ?? 0) * 100)}%</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Receita líquida</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.netSalesCents ?? 0)}</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Saldo disponível</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.availableBalanceCents ?? 0)}</p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Saques solicitados</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.withdrawRequestedCents ?? 0)}</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Saques aprovados</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.withdrawApprovedCents ?? 0)}</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm text-muted-foreground">Valor reservado</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(data?.reservedWithdrawCents ?? 0)}</p>
            </article>
          </div>

          <form className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5" onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold">Solicitar saque</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="amount">Valor (BRL)</label>
                <input id="amount" name="amount" type="number" step="0.01" min="1" className="field-input" placeholder="1000.00" />
              </div>
              <div>
                <label className="field-label" htmlFor="method">Método</label>
                <select id="method" name="method" className="field-input" defaultValue="PIX">
                  <option>PIX</option>
                  <option>Cartão</option>
                  <option>Transferência</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-base btn-primary mt-5" disabled={submitting}>
              {submitting ? "Enviando..." : "Solicitar saque"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
            <h2 className="text-lg font-semibold">Últimas solicitações</h2>
            <div className="mt-4 grid gap-3">
              {(data?.recentWithdrawals ?? []).length === 0 ? (
                <StatusNotice variant="empty" message="Nenhuma solicitação registrada." />
              ) : null}

              {(data?.recentWithdrawals ?? []).map((item) => (
                <article key={item.id} className="rounded-xl border border-border/50 bg-background/80 p-3 text-sm">
                  <p className="font-medium">{formatCurrency(item.amountCents)}</p>
                  <p className="text-muted-foreground">{item.method} • {item.status}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/painel" className="btn-base btn-ghost">Voltar ao painel</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
