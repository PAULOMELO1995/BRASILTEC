import { n as PageShell, t as PageHeader } from "./PageShell-BwxNyzYO.js";
import { Link } from "@tanstack/react-router";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/planos.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/planos.tsx?tsr-split=component";
var plans = [
	{
		name: "Starter",
		tagline: "Para começar a vender",
		note: "Entrada simplificada",
		features: [
			"Checkout padrão otimizado",
			"1 produto ativo",
			"Suporte por email"
		],
		cta: "Começar grátis",
		to: "/cadastro",
		highlight: false
	},
	{
		name: "Pro",
		tagline: "Para crescer com consistência",
		note: "Estrutura ampliada",
		features: [
			"Produtos ilimitados",
			"Afiliados e comissões",
			"Relatórios completos",
			"Suporte prioritário"
		],
		cta: "Assinar plano Pro",
		to: "/cadastro",
		highlight: true
	},
	{
		name: "Scale",
		tagline: "Para operações com alto volume",
		note: "Acompanhamento dedicado",
		features: [
			"Gestor dedicado",
			"Integrações avançadas",
			"Condições personalizadas",
			"SLA estendido"
		],
		cta: "Solicitar proposta",
		to: "/suporte",
		highlight: false
	}
];
var comparison = [
	[
		"Produtos ativos",
		"1",
		"Ilimitado",
		"Ilimitado"
	],
	[
		"Programa de afiliados",
		"Não",
		"Sim",
		"Sim"
	],
	[
		"Suporte",
		"Email",
		"Prioritário",
		"Dedicado"
	],
	[
		"Relatórios avançados",
		"Básico",
		"Completo",
		"Completo + custom"
	]
];
var faq = [
	["Existe fidelidade?", "Não. Você pode cancelar quando quiser, sem multa."],
	["Como funciona o saque?", "Os saques são solicitados no painel financeiro e processados de forma rápida."],
	["Posso migrar de plano?", "Sim. O upgrade ou downgrade pode ser feito conforme o momento do seu negócio."]
];
function Planos() {
	return /* @__PURE__ */ jsxDEV(PageShell, { children: [
		/* @__PURE__ */ jsxDEV(PageHeader, {
			eyebrow: "Planos",
			title: "Planos para cada fase da sua operação",
			description: "Escolha o nível de estrutura ideal para o seu momento, sem complexidade.",
			actions: /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV(Link, {
				to: "/cadastro",
				className: "btn-base btn-primary",
				children: "Criar minha conta"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 33,
				columnNumber: 13
			}, this), /* @__PURE__ */ jsxDEV(Link, {
				to: "/suporte",
				className: "btn-base btn-ghost",
				children: "Falar com suporte"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 36,
				columnNumber: 13
			}, this)] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 32,
				columnNumber: 178
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 32,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "grid items-start gap-4 md:grid-cols-3",
				children: plans.map((plan) => /* @__PURE__ */ jsxDEV("article", {
					className: plan.highlight ? "panel-elevated card-hover relative p-7 ring-1 ring-primary/40" : "panel card-hover p-7",
					children: [
						plan.highlight ? /* @__PURE__ */ jsxDEV("span", {
							className: "absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-primary-foreground uppercase",
							style: { backgroundImage: "var(--gradient-primary)" },
							children: "Mais escolhido"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 44,
							columnNumber: 33
						}, this) : null,
						/* @__PURE__ */ jsxDEV("span", {
							className: "eyebrow",
							children: plan.name
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 49,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("h2", {
							className: "mt-3 text-xl",
							children: plan.tagline
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 50,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: plan.note
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 51,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("div", { className: "divider-line my-5" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 52,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("ul", {
							className: "space-y-2.5 text-sm text-muted-foreground",
							children: plan.features.map((f) => /* @__PURE__ */ jsxDEV("li", {
								className: "flex gap-2.5",
								children: [/* @__PURE__ */ jsxDEV("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 55,
									columnNumber: 21
								}, this), f]
							}, f, true, {
								fileName: _jsxFileName,
								lineNumber: 54,
								columnNumber: 41
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 53,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: plan.to,
							className: plan.highlight ? "btn-base btn-primary mt-6 w-full" : "btn-base btn-ghost mt-6 w-full",
							children: plan.cta
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 59,
							columnNumber: 15
						}, this)
					]
				}, plan.name, true, {
					fileName: _jsxFileName,
					lineNumber: 43,
					columnNumber: 30
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 42,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 41,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-14",
			children: [/* @__PURE__ */ jsxDEV("h2", {
				className: "text-2xl",
				children: "Comparação rápida"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 67,
				columnNumber: 9
			}, this), /* @__PURE__ */ jsxDEV("div", {
				className: "panel mt-4 overflow-x-auto",
				children: /* @__PURE__ */ jsxDEV("table", {
					className: "w-full min-w-[36rem] border-collapse text-sm",
					children: [/* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", {
						className: "border-b border-border text-left",
						children: [
							"Recurso",
							"Starter",
							"Pro",
							"Scale"
						].map((h) => /* @__PURE__ */ jsxDEV("th", {
							className: "px-5 py-4 font-display text-xs font-semibold tracking-wide uppercase",
							children: h
						}, h, false, {
							fileName: _jsxFileName,
							lineNumber: 72,
							columnNumber: 66
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 71,
						columnNumber: 15
					}, this) }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 70,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("tbody", { children: comparison.map((row) => /* @__PURE__ */ jsxDEV("tr", {
						className: "border-b border-border/60 last:border-0",
						children: row.map((cell, i) => /* @__PURE__ */ jsxDEV("td", {
							className: i === 0 ? "px-5 py-4 font-medium" : "px-5 py-4 text-muted-foreground",
							children: cell
						}, cell + i, false, {
							fileName: _jsxFileName,
							lineNumber: 79,
							columnNumber: 41
						}, this))
					}, row[0], false, {
						fileName: _jsxFileName,
						lineNumber: 78,
						columnNumber: 38
					}, this)) }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 77,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 69,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 68,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 66,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-14",
			children: [/* @__PURE__ */ jsxDEV("h2", {
				className: "text-2xl",
				children: "Perguntas frequentes"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 89,
				columnNumber: 9
			}, this), /* @__PURE__ */ jsxDEV("div", {
				className: "mt-4 grid gap-4 md:grid-cols-3",
				children: faq.map(([q, a]) => /* @__PURE__ */ jsxDEV("article", {
					className: "panel p-6",
					children: [/* @__PURE__ */ jsxDEV("h3", {
						className: "text-base",
						children: q
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 92,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("p", {
						className: "mt-2 text-sm leading-relaxed text-muted-foreground",
						children: a
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 93,
						columnNumber: 15
					}, this)]
				}, q, true, {
					fileName: _jsxFileName,
					lineNumber: 91,
					columnNumber: 32
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 90,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 88,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 31,
		columnNumber: 10
	}, this);
}
//#endregion
export { Planos as component };
