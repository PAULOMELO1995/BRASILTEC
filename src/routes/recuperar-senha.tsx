import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { requestPasswordResetEmail } from "@/lib/auth-server";

export const Route = createFileRoute("/recuperar-senha")({
  component: RecuperarSenhaPage,
});

type ResetResponse = {
  ok: true;
  resetToken?: string;
};

function RecuperarSenhaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setError("Informe o email da conta para continuar.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setDebugToken(null);

    try {
      const response = (await requestPasswordResetEmail({ data: { email } })) as ResetResponse;
      setSuccess(true);
      setDebugToken(response.resetToken ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível processar a solicitação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <form className="panel-elevated w-full max-w-md p-7 md:p-9" onSubmit={handleSubmit}>
          <span className="eyebrow">Recuperação de acesso</span>
          <h1 className="mt-3 text-3xl">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">Informe seu email para gerar um token de redefinição.</p>

          <div className="mt-7">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="field-input" placeholder="voce@email.com" />
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
              <p>Se o email existir, a recuperação foi iniciada com sucesso.</p>
              {debugToken ? (
                <>
                  <p className="mt-2 break-all text-xs">Token de desenvolvimento: {debugToken}</p>
                  <a className="mt-3 inline-flex text-xs font-medium underline" href={`/redefinir-senha?token=${encodeURIComponent(debugToken)}`}>
                    Continuar para redefinir senha
                  </a>
                </>
              ) : null}
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className="btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Gerando..." : "Gerar recuperação"}
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
