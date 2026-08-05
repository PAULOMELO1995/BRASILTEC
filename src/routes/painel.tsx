import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { getDashboardData, getSessionData, logoutUser } from "@/lib/auth-server";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel | Brasiltec" },
      { name: "description", content: "Resumo inicial da sua conta Brasiltec após o login." },
      { property: "og:title", content: "Painel Brasiltec" },
      { property: "og:description", content: "Resumo da conta após entrar na plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const [email, setEmail] = useState("Carregando...");
  const [name, setName] = useState("Carregando...");
  const [businessType, setBusinessType] = useState("Carregando...");
  const [storageMode, setStorageMode] = useState<"postgres" | "sqlite" | "local-file">("local-file");
  const [dashboardWarning, setDashboardWarning] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionsExpiringSoon, setSessionsExpiringSoon] = useState(0);
  const [byBusiness, setByBusiness] = useState<Record<string, number>>({});
  const [latestUsers, setLatestUsers] = useState<Array<{ name: string; email: string; businessType: string; createdAt: string }>>([]);

  useEffect(() => {
    getSessionData()
      .then((session) => {
        setName(session.user.name);
        setEmail(session.user.email);
        setBusinessType(session.user.businessType);
      })
      .catch(() => {
        window.location.assign("/login");
      });

    getDashboardData()
      .then((dashboard) => {
        setUserCount(dashboard.userCount);
        setSessionCount(dashboard.sessionCount);
        setSessionsExpiringSoon(dashboard.sessionsExpiringSoon);
        setStorageMode(dashboard.storageMode === "postgres" || dashboard.storageMode === "sqlite" ? dashboard.storageMode : "local-file");
        setByBusiness(dashboard.byBusiness);
        setLatestUsers(dashboard.latestUsers);
      })
      .catch(() => {
        setDashboardWarning("Não foi possível carregar todas as métricas agora. Atualize em instantes.");
      });
  }, []);

  function handleLogout() {
    logoutUser().finally(() => {
      window.location.assign("/login");
    });
  }

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <div className="panel-elevated w-full max-w-3xl p-8 md:p-12">
          <span className="eyebrow">Painel</span>
          <h1 className="mt-4 text-3xl md:text-4xl">Você avançou para o painel</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            O login agora lê a sessão, mostra os dados do banco e mantém a navegação fora da URL.
          </p>

          <div className="mt-8 grid gap-4 rounded-3xl border border-border/60 bg-background/70 p-5 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p className="mt-1 font-medium text-foreground">{name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="mt-1 font-medium text-foreground">{email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo de negócio</p>
              <p className="mt-1 font-medium text-foreground">{businessType}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="panel p-5">
              <p className="text-sm text-muted-foreground">Usuários cadastrados</p>
              <p className="mt-2 text-3xl font-semibold">{userCount}</p>
            </div>
            <div className="panel p-5">
              <p className="text-sm text-muted-foreground">Sessões ativas</p>
              <p className="mt-2 text-3xl font-semibold">{sessionCount}</p>
            </div>
            <div className="panel p-5">
              <p className="text-sm text-muted-foreground">Banco protegido</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">Senhas com scrypt + sessões com expiração de 8h e token hasheado.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Persistência: {storageMode === "postgres" ? "PostgreSQL" : storageMode === "sqlite" ? "SQLite" : "Arquivo local (.data)"}
              </p>
            </div>
          </div>

          {dashboardWarning ? (
            <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
              {dashboardWarning}
            </p>
          ) : null}

          <div className="mt-4 panel p-5">
            <p className="text-sm text-muted-foreground">Sessões expirando em até 1h</p>
            <p className="mt-2 text-2xl font-semibold">{sessionsExpiringSoon}</p>
          </div>

          <div className="mt-4 panel p-5">
            <p className="text-sm text-muted-foreground">Usuários por tipo de negócio</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(byBusiness).map(([kind, count]) => (
                <div key={kind} className="rounded-2xl border border-border/60 bg-background/80 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{kind}</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-border/60 bg-background/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Últimos cadastros</p>
                <p className="mt-1 text-lg font-medium text-foreground">Gerenciamento do banco</p>
              </div>
              <button type="button" className="btn-base btn-ghost" onClick={handleLogout}>
                Sair
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {latestUsers.map((user) => (
                <article key={user.email} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-primary">{user.businessType}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/produtos/novo" className="btn-base btn-primary">
              Criar produto
            </Link>
            <Link to="/produtos" className="btn-base btn-ghost">
              Gerenciar produtos
            </Link>
            <Link to="/marketplace" className="btn-base btn-ghost">
              Ir ao marketplace
            </Link>
            <Link to="/pedidos" className="btn-base btn-ghost">
              Meus pedidos
            </Link>
            <Link to="/membros" className="btn-base btn-ghost">
              Área de membros
            </Link>
            <Link to="/financeiro" className="btn-base btn-ghost">
              Financeiro
            </Link>
            <Link to="/afiliados" className="btn-base btn-ghost">
              Afiliados
            </Link>
            <Link to="/notificacoes" className="btn-base btn-ghost">
              Notificações
            </Link>
            <Link to="/admin" className="btn-base btn-ghost">
              Admin
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
