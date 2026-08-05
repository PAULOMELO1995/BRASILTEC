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
        content: "Seu cadastro foi recebido e a próxima etapa da conta está pronta para ser acessada.",
      },
      { property: "og:title", content: "Cadastro concluído na Brasiltec" },
      { property: "og:description", content: "Confirmação da criação da conta e próximos passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CadastroConfirmacao,
});

function CadastroConfirmacao() {
  const [name, setName] = useState("Carregando...");
  const [email, setEmail] = useState("Carregando...");
  const [businessType, setBusinessType] = useState("Carregando...");

  useEffect(() => {
    getSessionData()
      .then(({ user }) => {
        setName(user.name);
        setEmail(user.email);
        setBusinessType(user.businessType);
      })
      .catch(() => {
        setName("Não informado");
        setEmail("Não informado");
        setBusinessType("Não informado");
      });
  }, []);

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <div className="panel-elevated w-full max-w-2xl p-8 md:p-12">
          <span className="eyebrow">Cadastro concluído</span>
          <h1 className="mt-4 text-3xl md:text-4xl">Sua conta foi criada com sucesso</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A próxima rota foi gerada após o envio do formulário. Você já pode seguir para a navegação da conta.
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="btn-base btn-primary">
              Ir para o início
            </Link>
            <Link to="/planos" className="btn-base btn-ghost">
              Ver planos
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}