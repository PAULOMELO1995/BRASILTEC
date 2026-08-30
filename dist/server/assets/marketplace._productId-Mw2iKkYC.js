import { n as Route } from "./router-BE8QbcLM.js";
import { n as PageShell, y as getMarketplaceProductDetails } from "./PageShell-BwxNyzYO.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/marketplace.$productId.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/marketplace.$productId.tsx?tsr-split=component";
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function MarketplaceProductPage() {
	const { productId } = Route.useParams();
	const [product, setProduct] = useState(null);
	useEffect(() => {
		getMarketplaceProductDetails({ data: { productId } }).then((item) => setProduct(item ?? null)).catch(() => setProduct(null));
	}, [productId]);
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated mx-auto max-w-3xl p-7 md:p-9",
			children: !product ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Produto"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 35,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Produto não encontrado"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 36,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Volte ao marketplace para escolher outro item disponível."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 37,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: /* @__PURE__ */ jsxDEV(Link, {
						to: "/marketplace",
						className: "btn-base btn-ghost",
						children: "Voltar ao marketplace"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 39,
						columnNumber: 17
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 38,
					columnNumber: 15
				}, this)
			] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 34,
				columnNumber: 23
			}, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Página do produto"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 44,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: product.name
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 45,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm uppercase tracking-wide text-muted-foreground",
					children: product.category || "Geral"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 46,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
					children: [
						/* @__PURE__ */ jsxDEV("h2", {
							className: "text-lg font-semibold",
							children: "Descrição"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 49,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: product.description
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 50,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsxDEV("article", {
								className: "rounded-xl border border-border/50 bg-background/80 p-3",
								children: [/* @__PURE__ */ jsxDEV("p", {
									className: "text-xs text-muted-foreground",
									children: "Preço"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 54,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xl font-semibold",
									children: formatCurrency(product.priceCents)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 55,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 53,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("article", {
								className: "rounded-xl border border-border/50 bg-background/80 p-3",
								children: [/* @__PURE__ */ jsxDEV("p", {
									className: "text-xs text-muted-foreground",
									children: "Garantia"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 58,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-sm font-medium",
									children: "7 dias de garantia"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 59,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 57,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 52,
							columnNumber: 17
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 48,
					columnNumber: 15
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxDEV("a", {
						href: `/checkout?productId=${product.id}`,
						className: "btn-base btn-primary",
						children: "Comprar agora"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 65,
						columnNumber: 17
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/marketplace",
						className: "btn-base btn-ghost",
						children: "Voltar ao marketplace"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 68,
						columnNumber: 17
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 64,
					columnNumber: 15
				}, this)
			] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 43,
				columnNumber: 19
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 33,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 32,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 31,
		columnNumber: 10
	}, this);
}
//#endregion
export { MarketplaceProductPage as component };
