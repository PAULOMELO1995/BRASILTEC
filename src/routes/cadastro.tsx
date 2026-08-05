import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { registerUser } from "@/lib/auth-server";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta | Brasiltec" },
      {
        name: "description",
        content: "Crie sua conta Brasiltec e comece a vender produtos digitais com checkout e pagamentos locais.",
      },
      { property: "og:title", content: "Criar conta na Brasiltec" },
      { property: "og:description", content: "Nome, email e senha para iniciar sua operação na plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cadastro,
});

const businessTypes = ["Produtor digital", "Infoprodutor", "Afiliado", "Agência", "E-commerce", "Serviços"];

function Cadastro() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (pathname !== "/cadastro") {
    return <Outlet />;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const tipo = String(formData.get("tipo") ?? businessTypes[0]);
    const senha = String(formData.get("senha") ?? "");
    const confirmar = String(formData.get("confirmar") ?? "");

    if (!nome || !email || !senha || !confirmar) {
      setError("Preencha todos os campos para continuar.");
      return;
    }

    if (senha.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    registerUser({ data: { name: nome, email, password: senha, businessType: tipo } })
      .then(() => {
        window.location.assign("/cadastro/confirmacao");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível concluir o cadastro.");
        setSubmitting(false);
      });
  }

  return (
    <PageShell>
      <section className="container-page grid gap-6 py-14 lg:grid-cols-[1fr_1.1fr] lg:py-20">
        <div className="lg:pt-6">
          <span className="eyebrow">Cadastro</span>
          <h1 className="mt-4 text-4xl md:text-5xl">Criar conta</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Nome, email, senha e confirmação para iniciar sua operação na plataforma.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Checkout pronto para PIX, cartão e transferência",
              "Área de membros com liberação automática",
              "Painel financeiro com saques rápidos",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <form className="panel-elevated p-7 md:p-9" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="nome">
                Nome completo
              </label>
              <input id="nome" name="nome" className="field-input" placeholder="Como você se chama" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" className="field-input" placeholder="voce@email.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="tipo">
                Tipo de negócio
              </label>
              <select id="tipo" name="tipo" className="field-input" defaultValue={businessTypes[0]}>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="senha">
                Senha
              </label>
              <input id="senha" name="senha" type="password" className="field-input" placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <label className="field-label" htmlFor="confirmar">
                Confirmar senha
              </label>
              <input id="confirmar" name="confirmar" type="password" className="field-input" placeholder="Repita a senha" />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} className="btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Criando conta..." : "Cadastrar"}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            disabled
            title="Em breve"
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground opacity-60 cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar com Google
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar agora
            </Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
