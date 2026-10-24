import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { changeTemporaryPasswordData, getSessionData } from "@/lib/auth-server";

export const Route = createFileRoute("/trocar-senha-temporaria")({
  component: TemporaryPasswordChange,
});

function TemporaryPasswordChange() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSessionData()
      .then((session) => {
        if (!session.user.mustChangePassword) {
          window.location.assign("/painel");
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        window.location.assign("/login");
      });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    setError(null);
    changeTemporaryPasswordData({ data: { password } })
      .then(() => window.location.assign("/painel"))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível atualizar sua senha.");
        setSubmitting(false);
      });
  }

  return (
    <PageShell>
      <section className="container-page flex justify-center py-16 lg:py-24">
        <form className="panel-elevated w-full max-w-md p-7 md:p-9" onSubmit={handleSubmit}>
          <span className="eyebrow">Segurança da conta</span>
          <h1 className="mt-3 text-3xl">Crie sua nova senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A senha temporária é apenas para este acesso. Defina uma senha pessoal para continuar.
          </p>

          {loading ? <p className="mt-6 text-sm text-muted-foreground">Verificando sua sessão...</p> : (
            <div className="mt-7 grid gap-4">
              <div>
                <label className="field-label" htmlFor="password">Nova senha</label>
                <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="confirmation">Confirme a nova senha</label>
                <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="field-input" />
              </div>

              {error ? (
                <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={submitting || loading} className="btn-base btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </button>
            </div>
          )}
        </form>
      </section>
    </PageShell>
  );
}
