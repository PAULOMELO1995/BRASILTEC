import { n as PageShell, t as PageHeader } from "./PageShell-BwxNyzYO.js";
import { Link } from "@tanstack/react-router";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/como-funciona.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/como-funciona.tsx?tsr-split=component";
var journey = [
	{
		step: "01",
		title: "Aquisição",
		text: "Crie sua conta, escolha o plano e configure os dados do seu negócio em minutos."
	},
	{
		step: "02",
		title: "Publicação",
		text: "Cadastre a oferta em quatro etapas, defina preço, formato e publique o produto."
	},
	{
		step: "03",
		title: "Compra",
		text: "O cliente finaliza no checkout com PIX, transferência ou cartão."
	},
	{
		step: "04",
		title: "Liberação automática",
		text: "Pedido confirmado libera o acesso à área de membros sem intervenção manual."
	},
	{
		step: "05",
		title: "Saque",
		text: "Acompanhe o saldo no painel financeiro e solicite a retirada quando quiser."
	}
];
function ComoFunciona() {
	return /* @__PURE__ */ jsxDEV(PageShell, { children: [
		/* @__PURE__ */ jsxDEV(PageHeader, {
			eyebrow: "Como funciona",
			title: "Fluxo completo do produtor ao saque",
			description: "Veja a jornada do usuário com foco em aquisição, publicação, compra, liberação automática e saque.",
			actions: /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV(Link, {
				to: "/cadastro",
				className: "btn-base btn-primary",
				children: "Criar minha conta"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 27,
				columnNumber: 13
			}, this), /* @__PURE__ */ jsxDEV(Link, {
				to: "/",
				className: "btn-base btn-ghost",
				children: "Voltar para o início"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 30,
				columnNumber: 13
			}, this)] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 26,
				columnNumber: 209
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 26,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page",
			children: /* @__PURE__ */ jsxDEV("ol", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
				children: journey.map((item) => /* @__PURE__ */ jsxDEV("li", {
					className: "panel card-hover p-6",
					children: [
						/* @__PURE__ */ jsxDEV("span", {
							className: "font-display text-sm font-semibold text-primary",
							children: item.step
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 38,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("h2", {
							className: "mt-2 text-xl",
							children: item.title
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 39,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: item.text
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 40,
							columnNumber: 15
						}, this)
					]
				}, item.step, true, {
					fileName: _jsxFileName,
					lineNumber: 37,
					columnNumber: 32
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 36,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 35,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-14",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "panel-elevated grid gap-8 p-8 md:grid-cols-2 md:p-12",
				children: [/* @__PURE__ */ jsxDEV("div", { children: [
					/* @__PURE__ */ jsxDEV("span", {
						className: "eyebrow",
						children: "Para o produtor"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 48,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("h2", {
						className: "mt-3 text-2xl",
						children: "Tudo acompanhado em um painel"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 49,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("ul", {
						className: "mt-4 space-y-2.5 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ jsxDEV("li", { children: "• Vendas, reembolsos e status de cada pedido" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 51,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ jsxDEV("li", { children: "• Afiliados, comissões e links de divulgação" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 52,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ jsxDEV("li", { children: "• Saldo disponível, a liberar e histórico de saques" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 53,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 50,
						columnNumber: 13
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 47,
					columnNumber: 11
				}, this), /* @__PURE__ */ jsxDEV("div", { children: [
					/* @__PURE__ */ jsxDEV("span", {
						className: "eyebrow",
						children: "Para o cliente"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 57,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("h2", {
						className: "mt-3 text-2xl",
						children: "Compra clara e acesso imediato"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 58,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ jsxDEV("ul", {
						className: "mt-4 space-y-2.5 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ jsxDEV("li", { children: "• Checkout com PIX, cartão e garantia de 7 dias" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 60,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ jsxDEV("li", { children: "• Confirmação por email com acesso ao conteúdo" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 61,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ jsxDEV("li", { children: "• Player e materiais na área de membros" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 62,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 59,
						columnNumber: 13
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 56,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 46,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 45,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 25,
		columnNumber: 10
	}, this);
}
//#endregion
export { ComoFunciona as component };
