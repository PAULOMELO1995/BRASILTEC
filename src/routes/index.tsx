import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brasiltec | Venda produtos digitais com estrutura profissional" },
      {
        name: "description",
        content:
          "Checkout, área de membros, vendas e financeiro em um só lugar. Pagamentos via PIX, cartão e transferência para creators no Brasil.",
      },
      { property: "og:title", content: "Brasiltec | Plataforma para creators digitais" },
      {
        property: "og:description",
        content: "Da oferta ao recebimento: checkout claro, PIX e operação organizada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "+24k", label: "vendas processadas" },
  { value: "99,9%", label: "estabilidade" },
  { value: "24/7", label: "suporte humano" },
];

const features = [
  {
    eyebrow: "Checkout intuitivo",
    title: "Experiência simples para a sua audiência",
    text: "Fluxo claro para conversão sem barreiras, do clique ao acesso liberado.",
    img: "/feature-community.svg",
  },
  {
    eyebrow: "Pagamentos digitais",
    title: "PIX, cartão e transferência",
    text: "Compatível com a realidade das vendas digitais no Brasil.",
    img: "/feature-payments.svg",
  },
  {
    eyebrow: "Operação organizada",
    title: "Métricas, clientes e financeiro em um painel",
    text: "Mais clareza para decidir com velocidade e acompanhar cada saque.",
    img: "/feature-analytics.svg",
  },
];

const steps = [
  "Crie sua conta e escolha o plano",
  "Publique sua oferta e configure o checkout",
  "Receba, entregue e acompanhe tudo no painel",
];

function Index() {
  return (
    <PageShell>
      <section className="container-page pt-10 md:pt-16">
        <div className="panel-elevated grid gap-10 p-6 md:p-10 lg:grid-cols-[1.15fr_1fr] lg:p-14">
          <div>
            <span className="eyebrow rounded-full border border-border-strong px-3 py-1.5">
              Plataforma para creators digitais
            </span>
            <h1 className="mt-6 text-4xl leading-[1.03] md:text-6xl">
              Venda produtos digitais com <span className="text-gradient">estrutura profissional</span> e fluxo simples.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Da oferta ao recebimento, a Brasiltec organiza checkout, área de membros, vendas e financeiro em um só
              lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cadastro" className="btn-base btn-primary">
                Criar minha conta
              </Link>
              <Link to="/como-funciona" className="btn-base btn-ghost">
                Ver o fluxo
              </Link>
            </div>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="panel card-hover px-5 py-4">
                  <dt className="font-display text-2xl font-semibold">{s.value}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="panel flex flex-col gap-4 p-5 md:p-6">
            <img src="/hero-dashboard.svg" alt="Dashboard Brasiltec" className="w-full rounded-xl" />
            <div>
              <span className="eyebrow">Como funciona</span>
              <div className="mt-4 rounded-xl border border-border bg-background/40 p-5">
                <p className="font-display text-sm font-semibold">Comece em poucos passos</p>
                <ol className="mt-3 space-y-2.5">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-primary/50 text-[11px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-page mt-14">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.eyebrow} className="panel card-hover p-6">
              <img src={f.img} alt={f.title} className="mb-4 h-32 w-full object-contain" />
              <span className="eyebrow">{f.eyebrow}</span>
              <h2 className="mt-3 text-xl leading-snug">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page mt-14">
        <div className="panel flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-2xl md:text-3xl">Pronto para estruturar sua operação?</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Publique sua primeira oferta hoje e receba via PIX, cartão e transferência.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/cadastro" className="btn-base btn-primary">
              Criar conta grátis
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
