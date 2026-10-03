import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { getSessionData } from "@/lib/auth-server";

export const Route = createFileRoute("/cadastro/confirmacao")({
  head: () => ({
    meta: [
      { title: "Cadastro concluído | Brasiltec" },
      {
        name: "description",
        content:
          "Seu cadastro foi recebido e a próxima etapa da conta está pronta para ser acessada.",
      },
      { property: "og:title", content: "Cadastro concluído na Brasiltec" },
      {
        property: "og:description",
        content: "Confirmação da criação da conta e próximos passos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CadastroConfirmacao,
});

function CadastroConfirmacao() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    businessType: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSessionData()
      .then(({ user }) => {
        if (active) setUser(user);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível verificar sua sessão.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <div className="panel-elevated w-full max-w-2xl p-8 md:p-12">
          {!user ? (
            <>
              <span className="eyebrow">Cadastro</span>
              <h1 className="mt-4 text-3xl md:text-4xl">
                {error
                  ? "Não foi possível confirmar sua sessão"
                  : "Verificando sua conta"}
              </h1>
              <p
                role={error ? "alert" : "status"}
                className="mt-3 text-sm text-muted-foreground"
              >
                {error ?? "Aguarde enquanto verificamos os dados registrados."}
              </p>
              {error ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/login" className="btn-base btn-primary">
                    Entrar na minha conta
                  </Link>
                  <Link to="/cadastro" className="btn-base btn-ghost">
                    Voltar ao cadastro
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <span className="eyebrow">Cadastro concluído</span>
              <h1 className="mt-4 text-3xl md:text-4xl">
                Sua conta foi criada com sucesso
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Seus dados foram registrados e sua sessão já está ativa. Você
                pode acessar o painel agora.
              </p>

              <div className="mt-8 grid gap-4 rounded-3xl border border-border/60 bg-background/70 p-5 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="mt-1 font-medium text-foreground">
                    {user.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="mt-1 font-medium text-foreground">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo de negócio</p>
                  <p className="mt-1 font-medium text-foreground">
                    {user.businessType}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/painel" className="btn-base btn-primary">
                  Acessar painel
                </Link>
                <Link to="/planos" className="btn-base btn-ghost">
                  Ver planos
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
