import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import { getMyNotificationsData, getSessionData, readAllMyNotifications, readMyNotification } from "@/lib/auth-server";

type NotificationItem = {
  id: string;
  userId: string;
  type: "order_approved" | "withdrawal_requested" | "affiliate_pending";
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export const Route = createFileRoute("/notificacoes")({
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  async function load() {
    setLoading(true);
    try {
      const notifications = (await getMyNotificationsData()) as NotificationItem[];
      setItems(notifications);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar notificações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSessionData()
      .then(() => load())
      .catch(() => window.location.assign("/login"));
  }, []);

  async function handleRead(item: NotificationItem) {
    if (submitting || item.readAt) return;
    setSubmitting(true);
    try {
      await readMyNotification({ data: { notificationId: item.id } });
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)));
      setSuccess("Notificação marcada como lida.");
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível marcar como lida.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReadAll() {
    if (submitting || unreadCount === 0) return;
    setSubmitting(true);
    try {
      await readAllMyNotifications();
      const now = new Date().toISOString();
      setItems((current) => current.map((entry) => (entry.readAt ? entry : { ...entry, readAt: now })));
      setSuccess("Todas as notificações foram marcadas como lidas.");
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a ação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated p-7 md:p-9">
          <span className="eyebrow">Notificações</span>
          <h1 className="mt-2 text-3xl">Central de notificações</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acompanhe eventos importantes da sua conta e entre rapidamente no fluxo relacionado.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground">
              Não lidas: <strong className="text-foreground">{unreadCount}</strong>
            </span>
            <button type="button" className="btn-base btn-ghost" onClick={handleReadAll} disabled={submitting || unreadCount === 0}>
              Marcar todas como lidas
            </button>
          </div>

          {loading ? <StatusNotice variant="loading" message="Carregando notificações..." className="mt-6" /> : null}
          {error ? <StatusNotice variant="error" message={error} className="mt-6" /> : null}
          {success ? <StatusNotice variant="success" message={success} className="mt-6" /> : null}

          {!loading && items.length === 0 ? <StatusNotice variant="empty" message="Você ainda não possui notificações." className="mt-6" /> : null}

          <div className="mt-6 grid gap-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.readAt ? "bg-surface-2 text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {item.readAt ? "Lida" : "Nova"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!item.readAt ? (
                    <button type="button" className="btn-base btn-ghost" onClick={() => handleRead(item)} disabled={submitting}>
                      Marcar como lida
                    </button>
                  ) : null}

                  {item.link ? (
                    <Link to={item.link} className="btn-base btn-primary">
                      Abrir destino
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/painel" className="btn-base btn-ghost">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
