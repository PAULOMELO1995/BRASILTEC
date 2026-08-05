import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import { getAffiliateData, getSessionData, requestAffiliateAccess } from "@/lib/auth-server";

type AffiliateData = {
  id: string;
  status: "pending" | "approved" | "rejected";
  referralCode: string;
  referralLink: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export const Route = createFileRoute("/afiliados")({
  component: AfiliadosPage,
});

function statusLabel(status: AffiliateData["status"]): string {
  if (status === "approved") return "Aprovado";
  if (status === "rejected") return "Rejeitado";
  return "Em análise";
}

function AfiliadosPage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const current = await getAffiliateData();
      setData((current as AffiliateData | null) ?? null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSessionData()
      .then(() => load())
      .catch(() => window.location.assign("/login"));
  }, []);

  async function handleRequestAffiliate() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const created = (await requestAffiliateAccess()) as AffiliateData;
      setData(created);
      setSuccess("Solicitação de afiliação registrada com sucesso.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível solicitar afiliação.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (!data?.referralLink) return;
    const fullLink = `${window.location.origin}${data.referralLink}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setSuccess("Link de afiliado copiado para a área de transferência.");
      setError(null);
    } catch {
      setError("Não foi possível copiar o link automaticamente. Copie manualmente abaixo.");
    }
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated p-7 md:p-9">
          <span className="eyebrow">Afiliados</span>
          <h1 className="mt-2 text-3xl">Programa de afiliação</h1>
          <p className="mt-2 text-sm text-muted-foreground">Solicite afiliação e use seu link de indicação para divulgar produtos no marketplace.</p>

          {loading ? <StatusNotice variant="loading" message="Carregando status de afiliado..." className="mt-6" /> : null}
          {error ? <StatusNotice variant="error" message={error} className="mt-6" /> : null}
          {success ? <StatusNotice variant="success" message={success} className="mt-6" /> : null}

          {!loading && !data ? (
            <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
              <StatusNotice variant="empty" message="Você ainda não solicitou afiliação." />
              <button type="button" className="btn-base btn-primary mt-4" onClick={handleRequestAffiliate} disabled={submitting}>
                {submitting ? "Enviando..." : "Solicitar afiliação"}
              </button>
            </div>
          ) : null}

          {!loading && data ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <article className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-2 text-2xl font-semibold">{statusLabel(data.status)}</p>
                {data.note ? <p className="mt-2 text-sm text-muted-foreground">{data.note}</p> : null}
                <p className="mt-3 text-xs text-muted-foreground">Atualizado em {new Date(data.updatedAt).toLocaleString("pt-BR")}</p>
              </article>

              <article className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-sm text-muted-foreground">Código de afiliado</p>
                <p className="mt-2 text-2xl font-semibold tracking-wide">{data.referralCode}</p>
                <p className="mt-3 text-sm text-muted-foreground">Link de indicação</p>
                <input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${data.referralLink}`}
                  className="field-input mt-2"
                />
                <button type="button" className="btn-base btn-ghost mt-3" onClick={handleCopyLink}>
                  Copiar link
                </button>
              </article>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/marketplace" className="btn-base btn-ghost">
              Ir ao marketplace
            </Link>
            <Link to="/painel" className="btn-base btn-primary">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
