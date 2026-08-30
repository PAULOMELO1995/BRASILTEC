import { n as PageShell } from "./PageShell-BwxNyzYO.js";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/index.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/index.tsx?tsr-split=component";
var stats = [
	{
		value: "+24k",
		label: "vendas processadas"
	},
	{
		value: "99,9%",
		label: "estabilidade"
	},
	{
		value: "24/7",
		label: "suporte humano"
	}
];
var features = [
	{
		eyebrow: "Checkout intuitivo",
		title: "Experiência simples para a sua audiência",
		text: "Fluxo claro para conversão sem barreiras, do clique ao acesso liberado.",
		img: "/feature-community.svg"
	},
	{
		eyebrow: "Pagamentos digitais",
		title: "PIX, cartão e transferência",
		text: "Compatível com a realidade das vendas digitais no Brasil.",
		img: "/feature-payments.svg"
	},
	{
		eyebrow: "Operação organizada",
		title: "Métricas, clientes e financeiro em um painel",
		text: "Mais clareza para decidir com velocidade e acompanhar cada saque.",
		img: "/feature-analytics.svg"
	}
];
var steps = [
	"Crie sua conta e escolha o plano",
	"Publique sua oferta e configure o checkout",
	"Receba, entregue e acompanhe tudo no painel"
];
function Index() {
	return /* @__PURE__ */ jsxDEV(PageShell, { children: [
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page pt-10 md:pt-16",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "panel-elevated grid gap-10 p-6 md:p-10 lg:grid-cols-[1.15fr_1fr] lg:p-14",
				children: [/* @__PURE__ */ jsxDEV("div", { children: [
					/* @__PURE__ */ jsxDEV("span", {
						className: "eyebrow rounded-full border border-border-strong px-3 py-1.5",
						children: "Plataforma para creators digitais"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 35,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("h1", {
						className: "mt-6 text-4xl leading-[1.03] md:text-6xl",
						children: [
							"Venda produtos digitais com ",
							/* @__PURE__ */ jsxDEV("span", {
								className: "text-gradient",
								children: "estrutura profissional"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 39,
								columnNumber: 43
							}, this),
							" e fluxo simples."
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 38,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("p", {
						className: "mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg",
						children: "Da oferta ao recebimento, a Brasiltec organiza checkout, área de membros, vendas e financeiro em um só lugar."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 41,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ jsxDEV(Link, {
							to: "/cadastro",
							className: "btn-base btn-primary",
							children: "Criar minha conta"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 46,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV(Link, {
							to: "/como-funciona",
							className: "btn-base btn-ghost",
							children: "Ver o fluxo"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 49,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 45,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("dl", {
						className: "mt-10 grid gap-3 sm:grid-cols-3",
						children: stats.map((s) => /* @__PURE__ */ jsxDEV("div", {
							className: "panel card-hover px-5 py-4",
							children: [/* @__PURE__ */ jsxDEV("dt", {
								className: "font-display text-2xl font-semibold",
								children: s.value
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 56,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("dd", {
								className: "mt-1 text-sm text-muted-foreground",
								children: s.label
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 57,
								columnNumber: 19
							}, this)]
						}, s.label, true, {
							fileName: _jsxFileName,
							lineNumber: 55,
							columnNumber: 31
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 54,
						columnNumber: 13
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 34,
					columnNumber: 11
				}, this), /* @__PURE__ */ jsxDEV("aside", {
					className: "panel flex flex-col gap-4 p-5 md:p-6",
					children: [/* @__PURE__ */ jsxDEV("img", {
						src: "/hero-dashboard.svg",
						alt: "Dashboard Brasiltec",
						className: "w-full rounded-xl"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 63,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("span", {
						className: "eyebrow",
						children: "Como funciona"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 65,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("div", {
						className: "mt-4 rounded-xl border border-border bg-background/40 p-5",
						children: [/* @__PURE__ */ jsxDEV("p", {
							className: "font-display text-sm font-semibold",
							children: "Comece em poucos passos"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 67,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("ol", {
							className: "mt-3 space-y-2.5",
							children: steps.map((step, i) => /* @__PURE__ */ jsxDEV("li", {
								className: "flex gap-3 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ jsxDEV("span", {
									className: "grid size-5 shrink-0 place-items-center rounded-full border border-primary/50 text-[11px] font-semibold text-primary",
									children: i + 1
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 70,
									columnNumber: 23
								}, this), step]
							}, step, true, {
								fileName: _jsxFileName,
								lineNumber: 69,
								columnNumber: 43
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 68,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 66,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 64,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 62,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 33,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 32,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-14",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: features.map((f) => /* @__PURE__ */ jsxDEV("article", {
					className: "panel card-hover p-6",
					children: [
						/* @__PURE__ */ jsxDEV("img", {
							src: f.img,
							alt: f.title,
							className: "mb-4 h-32 w-full object-contain"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 85,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("span", {
							className: "eyebrow",
							children: f.eyebrow
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 86,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("h2", {
							className: "mt-3 text-xl leading-snug",
							children: f.title
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 87,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-3 text-sm leading-relaxed text-muted-foreground",
							children: f.text
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 88,
							columnNumber: 15
						}, this)
					]
				}, f.eyebrow, true, {
					fileName: _jsxFileName,
					lineNumber: 84,
					columnNumber: 30
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 83,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 82,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-14",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "panel flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10",
				children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("h2", {
					className: "text-2xl md:text-3xl",
					children: "Pronto para estruturar sua operação?"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 96,
					columnNumber: 13
				}, this), /* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground md:text-base",
					children: "Publique sua primeira oferta hoje e receba via PIX, cartão e transferência."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 97,
					columnNumber: 13
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 95,
					columnNumber: 11
				}, this), /* @__PURE__ */ jsxDEV("div", {
					className: "flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/cadastro",
						className: "btn-base btn-primary",
						children: "Criar conta grátis"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 102,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/planos",
						className: "btn-base btn-ghost",
						children: "Ver planos"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 105,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 101,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 94,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 93,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 31,
		columnNumber: 10
	}, this);
}
//#endregion
export { Index as component };
