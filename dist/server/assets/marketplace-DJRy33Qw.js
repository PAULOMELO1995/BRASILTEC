import { b as getMarketplaceProducts, n as PageShell, t as PageHeader } from "./PageShell-BwxNyzYO.js";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/marketplace.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/marketplace.tsx?tsr-split=component";
var methods = [
	"PIX",
	"Cartão",
	"Transferência"
];
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function Marketplace() {
	const isMarketplaceIndex = useRouterState({ select: (state) => state.location.pathname }) === "/marketplace";
	const [products, setProducts] = useState([]);
	const [query, setQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("todas");
	const [sortBy, setSortBy] = useState("recentes");
	useEffect(() => {
		if (!isMarketplaceIndex) return;
		getMarketplaceProducts().then((items) => {
			setProducts(items.map((item) => ({
				...item,
				category: item.category || "Geral"
			})));
		}).catch(() => {
			setProducts([]);
		});
	}, [isMarketplaceIndex]);
	const categories = useMemo(() => {
		const set = new Set(products.map((item) => item.category));
		return Array.from(set).sort((a, b) => a.localeCompare(b));
	}, [products]);
	const filteredProducts = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return products.filter((item) => {
			const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
			const matchesQuery = !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery) || item.description.toLowerCase().includes(normalizedQuery);
			return matchesCategory && matchesQuery;
		}).sort((left, right) => {
			if (sortBy === "menor") return left.priceCents - right.priceCents;
			if (sortBy === "maior") return right.priceCents - left.priceCents;
			if (sortBy === "nome") return left.name.localeCompare(right.name);
			const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
			return (right.publishedAt ? new Date(right.publishedAt).getTime() : 0) - leftTime;
		});
	}, [
		categoryFilter,
		products,
		query,
		sortBy
	]);
	return isMarketplaceIndex ? /* @__PURE__ */ jsxDEV(PageShell, { children: [
		/* @__PURE__ */ jsxDEV(PageHeader, {
			eyebrow: "Marketplace",
			title: "Produtos digitais disponíveis",
			description: "Escolha entre os melhores produtos dos nossos criadores, com PIX, cartão e garantia de 7 dias."
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 61,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "panel flex flex-wrap items-center gap-4 p-5",
				children: [
					/* @__PURE__ */ jsxDEV("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: ["Produtos na vitrine", /* @__PURE__ */ jsxDEV("span", {
							className: "rounded-full bg-surface-2 px-2.5 py-1 font-display text-xs font-semibold text-foreground",
							children: filteredProducts.length
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 67,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 65,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV("div", { className: "divider-line hidden flex-1 md:block" }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 71,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ jsxDEV("input", {
								className: "field-input w-56",
								"aria-label": "Buscar produto",
								placeholder: "Buscar por nome ou descrição",
								value: query,
								onChange: (event) => setQuery(event.target.value)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 73,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ jsxDEV("select", {
								className: "field-input w-auto",
								value: categoryFilter,
								onChange: (event) => setCategoryFilter(event.target.value),
								"aria-label": "Categoria",
								children: [/* @__PURE__ */ jsxDEV("option", {
									value: "todas",
									children: "Todas as categorias"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 75,
									columnNumber: 15
								}, this), categories.map((category) => /* @__PURE__ */ jsxDEV("option", {
									value: category,
									children: category
								}, category, false, {
									fileName: _jsxFileName,
									lineNumber: 76,
									columnNumber: 43
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 74,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ jsxDEV("select", {
								className: "field-input w-auto",
								value: sortBy,
								onChange: (event) => setSortBy(event.target.value),
								"aria-label": "Ordenar",
								children: [
									/* @__PURE__ */ jsxDEV("option", {
										value: "recentes",
										children: "Mais recentes"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 81,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ jsxDEV("option", {
										value: "menor",
										children: "Menor preço"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 82,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ jsxDEV("option", {
										value: "maior",
										children: "Maior preço"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 83,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ jsxDEV("option", {
										value: "nome",
										children: "Nome"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 84,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 80,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 72,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 64,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 63,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-6",
			children: [/* @__PURE__ */ jsxDEV("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
				children: filteredProducts.map((product) => /* @__PURE__ */ jsxDEV("article", {
					className: "panel card-hover flex flex-col p-6",
					children: [
						/* @__PURE__ */ jsxDEV("div", {
							className: "mb-5 h-32 rounded-xl border border-border",
							style: { backgroundImage: "var(--gradient-hero)" },
							"aria-hidden": true
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 93,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("span", {
							className: "eyebrow",
							children: product.category
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 96,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("h2", {
							className: "mt-2 text-lg leading-snug",
							children: product.name
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 97,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: product.description
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 98,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: "Conteúdo liberado automaticamente após compra aprovada."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 100,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-3 text-sm text-primary",
							children: "✓ Garantia de 7 dias"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 102,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("ul", {
							className: "mt-3 flex flex-wrap gap-1.5",
							children: methods.map((m) => /* @__PURE__ */ jsxDEV("li", {
								className: "rounded-full border border-border bg-background/40 px-2.5 py-1 text-xs text-muted-foreground",
								children: m
							}, m, false, {
								fileName: _jsxFileName,
								lineNumber: 105,
								columnNumber: 35
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 104,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("div", { className: "divider-line my-5" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 110,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "mt-auto flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-xs text-muted-foreground",
								children: "Valor"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 113,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "font-display text-xl font-semibold",
								children: formatCurrency(product.priceCents)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 114,
								columnNumber: 19
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 112,
								columnNumber: 17
							}, this), /* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ jsxDEV(Link, {
									to: "/marketplace/$productId",
									params: { productId: product.id },
									className: "btn-base btn-ghost text-center",
									children: "Ver produto"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 117,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("a", {
									href: `/checkout?productId=${product.id}`,
									className: "btn-base btn-primary text-center",
									children: "Comprar"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 122,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 116,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 111,
							columnNumber: 15
						}, this)
					]
				}, product.id, true, {
					fileName: _jsxFileName,
					lineNumber: 92,
					columnNumber: 44
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 91,
				columnNumber: 9
			}, this), filteredProducts.length === 0 ? /* @__PURE__ */ jsxDEV("article", {
				className: "panel mt-4 p-5 text-sm text-muted-foreground",
				children: "Nenhum produto encontrado com os filtros atuais."
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 130,
				columnNumber: 42
			}, this) : null]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 90,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 60,
		columnNumber: 31
	}, this) : /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 134,
		columnNumber: 20
	}, this);
}
//#endregion
export { Marketplace as component };
