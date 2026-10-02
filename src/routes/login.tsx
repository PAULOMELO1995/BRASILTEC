import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GoogleAuthButton } from "@/components/site/GoogleAuthButton";
import { PageShell } from "@/components/site/PageShell";
import { authenticateWithGoogle, loginUser } from "@/lib/auth-server";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar | Brasiltec" },
      { name: "description", content: "Acesse o painel Brasiltec para acompanhar vendas, clientes e financeiro." },
      { property: "og:title", content: "Entrar na Brasiltec" },
      { property: "og:description", content: "Acesse sua conta e continue de onde parou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const senha = String(formData.get("senha") ?? "");

    if (!email || !senha) {
      setError("Preencha email e senha para continuar.");
      return;
    }

    if (submitting) return;
    setError(null);
    setSubmitting(true);

    loginUser({ data: { email, password: senha } })
      .then(() => {
        window.location.assign("/painel");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível entrar agora.");
        setSubmitting(false);
      });
  }

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <form className="panel-elevated w-full max-w-md p-7 md:p-9" onSubmit={handleSubmit}>
          <span className="eyebrow">Acesso</span>
          <h1 className="mt-3 text-3xl">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acompanhe vendas, clientes e financeiro no painel.</p>

          <div className="mt-7 grid gap-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required className="field-input" placeholder="voce@email.com" />
            </div>
            <div>
              <label className="field-label" htmlFor="senha">
                Senha
              </label>
              <input id="senha" name="senha" type="password" autoComplete="current-password" required className="field-input" placeholder="Sua senha" />
              <p className="mt-2 text-right text-xs text-muted-foreground">
                <Link to="/recuperar-senha" className="hover:text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </p>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} className="btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Entrando..." : "Entrar"}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleAuthButton
            text="Conectando com Google..."
            disabled={submitting}
            onCredential={async (credential) => {
              setError(null);
              const response = await authenticateWithGoogle({
                data: {
                  credential,
                },
              });

              if ((response as { user?: { id?: string } }).user?.id) {
                window.location.assign("/painel");
              }
            }}
          />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-primary hover:underline">
              Criar agora
            </Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
