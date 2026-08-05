import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { sendSupportContactEmail } from "@/lib/auth-server";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte | Brasiltec" },
      {
        name: "description",
        content: "Atendimento humano 24/7 para checkout, saques, integrações e dúvidas operacionais da sua conta.",
      },
      { property: "og:title", content: "Suporte Brasiltec" },
      { property: "og:description", content: "Abra um chamado e fale com a equipe por email, WhatsApp ou chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Suporte,
});

const hours = [
  ["Segunda a sexta", "08:00 - 20:00"],
  ["Sábado", "09:00 - 14:00"],
  ["Domingo/Feriados", "Plantão crítico"],
];

const priorities = [
  ["Incidente de pagamento", "até 30 min"],
  ["Acesso de cliente", "até 2 h"],
  ["Dúvidas gerais", "até 24 h"],
];

const quickFaq = [
  ["Meu checkout não aprovou o pagamento.", "Verifique o método selecionado, o status na tela de vendas e tente novamente."],
  ["Cliente não recebeu acesso ao conteúdo.", 'Confirme o status do pedido como "Confirmado" ou "Processando".'],
  ["Como publicar um produto?", 'Use o fluxo em Produtos: Etapa 1 a Etapa 4 e finalize em "Publicar".'],
];

type SupportContactResponse = {
  ok: true;
  recipientEmail: string;
  provider: "resend" | "log";
  delivered: boolean;
};

function Suporte() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;

    const formData = new FormData(form);
    const name = String(formData.get("nome") ?? "").trim();
    const senderEmail = String(formData.get("email") ?? "").trim();
    const recipientEmail = String(formData.get("destinatario") ?? "").trim();
    const subject = String(formData.get("assunto") ?? "").trim();
    const message = String(formData.get("mensagem") ?? "").trim();

    if (!name || !senderEmail || !subject || !message) {
      setError("Preencha nome, email, assunto e mensagem para enviar o chamado.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = (await sendSupportContactEmail({
        data: {
          name,
          senderEmail,
          recipientEmail: recipientEmail || undefined,
          subject,
          message,
        },
      })) as SupportContactResponse;

      const modeLabel = response.delivered
        ? `Email enviado para ${response.recipientEmail}.`
        : `Chamado registrado para ${response.recipientEmail} (modo log: configure provider para envio externo).`;
      setSuccess(modeLabel);
      form.reset();
    } catch (err: unknown) {
      setSuccess(null);
      setError(err instanceof Error ? err.message : "Não foi possível enviar o chamado no momento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Suporte"
        title="Atendimento humano para operação e crescimento"
        description="Suporte 24/7 para checkout, saques, integrações e dúvidas operacionais."
      />

      <section className="container-page grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <form className="panel-elevated p-7 md:p-9" onSubmit={handleSubmit}>
          <h2 className="text-xl">Abrir chamado de suporte</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha os dados para que o site entre em contato com o email do destinatário autorizado.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="nome">
                Nome
              </label>
              <input id="nome" name="nome" className="field-input" placeholder="Seu nome completo" />
            </div>
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" className="field-input" placeholder="voce@email.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="destinatario">
                Email do destinatário (opcional)
              </label>
              <input
                id="destinatario"
                name="destinatario"
                type="email"
                className="field-input"
                placeholder="suporte@brasiltec.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">Se não informar, usamos o destinatário padrão configurado.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="assunto">
                Assunto
              </label>
              <input id="assunto" name="assunto" className="field-input" placeholder="Resumo do chamado" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="mensagem">
                Mensagem
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={5}
                className="field-input resize-y"
                placeholder="Descreva o que aconteceu"
              />
            </div>
          </div>
          {error ? <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

          {success ? <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">{success}</p> : null}

          <button type="submit" disabled={submitting} className="btn-base btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Enviando..." : "Enviar chamado"}
          </button>
        </form>

        <div className="grid gap-4">
          <article className="panel p-6">
            <h2 className="text-lg">Canais de atendimento</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Email:</span> suporte@brasiltec.com
              </li>
              <li>
                <span className="font-medium text-foreground">WhatsApp:</span> +258 84 000 0000
              </li>
              <li>
                <span className="font-medium text-foreground">Chat:</span> disponível no painel (seg-sex)
              </li>
            </ul>
          </article>

          <article className="panel p-6">
            <h2 className="text-lg">Horário de operação</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {hours.map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4">
                  <span>{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel p-6">
            <h2 className="text-lg">Prioridades de resposta</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {priorities.map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4">
                  <span>{k}</span>
                  <span className="font-medium text-primary">{v}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="container-page mt-14">
        <h2 className="text-2xl">Perguntas rápidas</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {quickFaq.map(([q, a]) => (
            <article key={q} className="panel p-6">
              <h3 className="text-base">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
