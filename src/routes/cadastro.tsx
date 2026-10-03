import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { GoogleAuthButton } from "@/components/site/GoogleAuthButton";
import { authenticateWithGoogle, registerUser } from "@/lib/auth-server";

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

const businessTypes = ["Produtor digital", "Infoprodutor", "Afiliado", "Agência", "E-commerce", "Serviços"] as const;

function Cadastro() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [businessType, setBusinessType] = useState<(typeof businessTypes)[number]>(businessTypes[0]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (pathname !== "/cadastro") {
    return <Outlet />;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const tipo = businessTypes.find((type) => type === formData.get("tipo"));
    const senha = String(formData.get("senha") ?? "");
    const confirmar = String(formData.get("confirmar") ?? "");

    if (!nome || !email || !senha || !confirmar) {
      setError("Preencha todos os campos para continuar.");
      return;
    }

    if (!tipo) {
      setError("Selecione um tipo de negócio válido.");
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

    if (submitting || googleSubmitting) return;
    setError(null);
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
            Cadastre seus dados para criar uma conta e acessar a plataforma.
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
              <input id="nome" name="nome" type="text" autoComplete="name" required minLength={3} className="field-input" placeholder="Como você se chama" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required className="field-input" placeholder="voce@email.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="tipo">
                Tipo de negócio
              </label>
              <select id="tipo" name="tipo" required className="field-input" value={businessType} disabled={submitting || googleSubmitting} onChange={(event) => {
                const selected = businessTypes.find((type) => type === event.target.value);
                if (selected) setBusinessType(selected);
              }}>
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
              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="field-input pr-12"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  aria-describedby="password-guidance"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="confirmar">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmar"
                  name="confirmar"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="field-input pr-12"
                  placeholder="Repita a senha"
                  value={confirmation}
                  onChange={(event) => {
                    setConfirmation(event.target.value);
                    setError(null);
                  }}
                  aria-describedby="confirmation-guidance"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmation
                      ? "Ocultar confirmação da senha"
                      : "Mostrar confirmação da senha"
                  }
                  aria-pressed={showConfirmation}
                >
                  {showConfirmation ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div
            className="mt-3 space-y-1 text-xs"
            id="password-guidance"
            aria-live="polite"
          >
            <p
              className={
                password.length >= 8 ? "text-primary" : "text-muted-foreground"
              }
            >
              {password.length >= 8
                ? "Senha com pelo menos 8 caracteres"
                : "Use pelo menos 8 caracteres na senha"}
            </p>
            {confirmation ? (
              <p
                id="confirmation-guidance"
                className={
                  password === confirmation
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              >
                {password === confirmation
                  ? "As senhas coincidem"
                  : "As senhas ainda não coincidem"}
              </p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting || googleSubmitting} className="btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Criando conta..." : "Cadastrar"}
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Após o cadastro, sua conta ficará salva e você poderá entrar com este email e senha.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleAuthButton
            buttonText="signup_with"
            text="Criando conta com Google..."
            disabled={submitting}
            onBusyChange={setGoogleSubmitting}
            onCredential={async (credential) => {
              setError(null);
              await authenticateWithGoogle({ data: { credential, businessType } });
              window.location.assign("/cadastro/confirmacao");
            }}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">Com Google, usamos seu nome e email verificado. Não é necessário preencher os campos de senha.</p>

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
