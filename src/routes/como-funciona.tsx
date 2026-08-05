import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona | Brasiltec" },
      {
        name: "description",
        content:
          "A jornada completa do produtor ao saque: aquisição, publicação, compra, liberação automática e retirada do saldo.",
      },
      { property: "og:title", content: "Como funciona a Brasiltec" },
      { property: "og:description", content: "Fluxo completo do produtor ao saque, passo a passo." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComoFunciona,
});

const journey = [
  {
    step: "01",
    title: "Aquisição",
    text: "Crie sua conta, escolha o plano e configure os dados do seu negócio em minutos.",
  },
  {
    step: "02",
    title: "Publicação",
    text: "Cadastre a oferta em quatro etapas, defina preço, formato e publique o produto.",
  },
  {
    step: "03",
    title: "Compra",
    text: "O cliente finaliza no checkout com PIX, transferência ou cartão.",
  },
  {
    step: "04",
    title: "Liberação automática",
    text: "Pedido confirmado libera o acesso à área de membros sem intervenção manual.",
  },
  {
    step: "05",
    title: "Saque",
    text: "Acompanhe o saldo no painel financeiro e solicite a retirada quando quiser.",
  },
];

function ComoFunciona() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Como funciona"
        title="Fluxo completo do produtor ao saque"
        description="Veja a jornada do usuário com foco em aquisição, publicação, compra, liberação automática e saque."
        actions={
          <>
            <Link to="/cadastro" className="btn-base btn-primary">
              Criar minha conta
            </Link>
            <Link to="/" className="btn-base btn-ghost">
              Voltar para o início
            </Link>
          </>
        }
      />

      <section className="container-page">
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {journey.map((item) => (
            <li key={item.step} className="panel card-hover p-6">
              <span className="font-display text-sm font-semibold text-primary">{item.step}</span>
              <h2 className="mt-2 text-xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page mt-14">
        <div className="panel-elevated grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <span className="eyebrow">Para o produtor</span>
            <h2 className="mt-3 text-2xl">Tudo acompanhado em um painel</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>• Vendas, reembolsos e status de cada pedido</li>
              <li>• Afiliados, comissões e links de divulgação</li>
              <li>• Saldo disponível, a liberar e histórico de saques</li>
            </ul>
          </div>
          <div>
            <span className="eyebrow">Para o cliente</span>
            <h2 className="mt-3 text-2xl">Compra clara e acesso imediato</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>• Checkout com PIX, cartão e garantia de 7 dias</li>
              <li>• Confirmação por email com acesso ao conteúdo</li>
              <li>• Player e materiais na área de membros</li>
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
