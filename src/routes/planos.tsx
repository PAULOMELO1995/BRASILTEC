import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos | Brasiltec" },
      {
        name: "description",
        content: "Starter, Pro e Scale: escolha o nível de estrutura ideal para o momento da sua operação digital.",
      },
      { property: "og:title", content: "Planos Brasiltec" },
      { property: "og:description", content: "Planos para cada fase da sua operação, sem fidelidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planos,
});

const plans = [
  {
    name: "Starter",
    tagline: "Para começar a vender",
    note: "Entrada simplificada",
    features: ["Checkout padrão otimizado", "1 produto ativo", "Suporte por email"],
    cta: "Começar grátis",
    to: "/cadastro" as const,
    highlight: false,
  },
  {
    name: "Pro",
    tagline: "Para crescer com consistência",
    note: "Estrutura ampliada",
    features: ["Produtos ilimitados", "Afiliados e comissões", "Relatórios completos", "Suporte prioritário"],
    cta: "Assinar plano Pro",
    to: "/cadastro" as const,
    highlight: true,
  },
  {
    name: "Scale",
    tagline: "Para operações com alto volume",
    note: "Acompanhamento dedicado",
    features: ["Gestor dedicado", "Integrações avançadas", "Condições personalizadas", "SLA estendido"],
    cta: "Solicitar proposta",
    to: "/suporte" as const,
    highlight: false,
  },
];

const comparison = [
  ["Produtos ativos", "1", "Ilimitado", "Ilimitado"],
  ["Programa de afiliados", "Não", "Sim", "Sim"],
  ["Suporte", "Email", "Prioritário", "Dedicado"],
  ["Relatórios avançados", "Básico", "Completo", "Completo + custom"],
];

const faq = [
  ["Existe fidelidade?", "Não. Você pode cancelar quando quiser, sem multa."],
  ["Como funciona o saque?", "Os saques são solicitados no painel financeiro e processados de forma rápida."],
  ["Posso migrar de plano?", "Sim. O upgrade ou downgrade pode ser feito conforme o momento do seu negócio."],
];

function Planos() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Planos"
        title="Planos para cada fase da sua operação"
        description="Escolha o nível de estrutura ideal para o seu momento, sem complexidade."
        actions={
          <>
            <Link to="/cadastro" className="btn-base btn-primary">
              Criar minha conta
            </Link>
            <Link to="/suporte" className="btn-base btn-ghost">
              Falar com suporte
            </Link>
          </>
        }
      />

      <section className="container-page">
        <div className="grid items-start gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.highlight
                  ? "panel-elevated card-hover relative p-7 ring-1 ring-primary/40"
                  : "panel card-hover p-7"
              }
            >
              {plan.highlight ? (
                <span
                  className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-primary-foreground uppercase"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  Mais escolhido
                </span>
              ) : null}
              <span className="eyebrow">{plan.name}</span>
              <h2 className="mt-3 text-xl">{plan.tagline}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
              <div className="divider-line my-5" />
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={plan.highlight ? "btn-base btn-primary mt-6 w-full" : "btn-base btn-ghost mt-6 w-full"}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page mt-14">
        <h2 className="text-2xl">Comparação rápida</h2>
        <div className="panel mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Recurso", "Starter", "Pro", "Scale"].map((h) => (
                  <th key={h} className="px-5 py-4 font-display text-xs font-semibold tracking-wide uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row[0]} className="border-b border-border/60 last:border-0">
                  {row.map((cell, i) => (
                    <td key={cell + i} className={i === 0 ? "px-5 py-4 font-medium" : "px-5 py-4 text-muted-foreground"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-page mt-14">
        <h2 className="text-2xl">Perguntas frequentes</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {faq.map(([q, a]) => (
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
