import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { loginUser } from "@/lib/auth-server";

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
              <input id="email" name="email" type="email" className="field-input" placeholder="voce@email.com" />
            </div>
            <div>
              <label className="field-label" htmlFor="senha">
                Senha
              </label>
              <input id="senha" name="senha" type="password" className="field-input" placeholder="Sua senha" />
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
