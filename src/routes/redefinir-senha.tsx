import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { resetPasswordByToken } from "@/lib/auth-server";

export const Route = createFileRoute("/redefinir-senha")({
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const queryToken = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(queryToken);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const tokenInput = String(formData.get("token") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!tokenInput || tokenInput.length < 12) {
      setError("Informe um token de recuperação válido.");
      return;
    }

    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await resetPasswordByToken({ data: { token: tokenInput, password } });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <form className="panel-elevated w-full max-w-md p-7 md:p-9" onSubmit={handleSubmit}>
          <span className="eyebrow">Nova senha</span>
          <h1 className="mt-3 text-3xl">Redefinir senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use o token gerado para definir uma nova senha de acesso.</p>

          <div className="mt-7 grid gap-4">
            <div>
              <label className="field-label" htmlFor="token">
                Token de recuperação
              </label>
              <input
                id="token"
                name="token"
                className="field-input"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Cole seu token"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Nova senha
              </label>
              <input id="password" name="password" type="password" className="field-input" placeholder="Mínimo de 8 caracteres" />
            </div>

            <div>
              <label className="field-label" htmlFor="confirmPassword">
                Confirmar nova senha
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" className="field-input" placeholder="Repita a senha" />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          ) : null}

          {success ? (
            <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
              Senha redefinida com sucesso. Faça login novamente para continuar.
            </p>
          ) : null}

          <button type="submit" disabled={submitting} className="btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Salvando..." : "Salvar nova senha"}
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Ir para login
            </Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}
