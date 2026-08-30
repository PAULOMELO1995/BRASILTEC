import { E as getMyProducts, M as publishProductById, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/produtos.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/produtos.tsx?tsr-split=component";
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function ProdutosPage() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [items, setItems] = useState([]);
	const [error, setError] = useState(null);
	const [busyId, setBusyId] = useState(null);
	async function load() {
		try {
			const products = await getMyProducts();
			setItems(products);
		} catch {
			window.location.assign("/login");
		}
	}
	useEffect(() => {
		load().catch(() => {
			setError("Não foi possível carregar seus produtos.");
		});
	}, []);
	async function handlePublish(productId) {
		setBusyId(productId);
		setError(null);
		try {
			await publishProductById({ data: { productId } });
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível publicar este produto.");
		} finally {
			setBusyId(null);
		}
	}
	if (pathname !== "/produtos") return /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 58,
		columnNumber: 12
	}, this);
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("span", {
						className: "eyebrow",
						children: "Produtos"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 65,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("h1", {
						className: "mt-2 text-3xl",
						children: "Meus produtos"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 66,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 64,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/produtos/novo",
						className: "btn-base btn-primary",
						children: "Criar produto"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 68,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 63,
					columnNumber: 11
				}, this),
				error ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 73,
					columnNumber: 20
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4",
					children: [items.length === 0 ? /* @__PURE__ */ jsxDEV("article", {
						className: "rounded-2xl border border-border/60 bg-background/70 p-5 text-sm text-muted-foreground",
						children: "Você ainda não criou produtos. Comece agora para publicar no marketplace."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 76,
						columnNumber: 35
					}, this) : null, items.map((item) => /* @__PURE__ */ jsxDEV("article", {
						className: "rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [/* @__PURE__ */ jsxDEV("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ jsxDEV("div", { children: [
								/* @__PURE__ */ jsxDEV("h2", {
									className: "text-lg font-semibold",
									children: item.name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 83,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: item.description
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 84,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-2 text-xs uppercase tracking-wide text-muted-foreground",
									children: item.category
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 85,
									columnNumber: 21
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 82,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("div", {
								className: "text-right",
								children: [/* @__PURE__ */ jsxDEV("p", {
									className: "text-xl font-semibold",
									children: formatCurrency(item.priceCents)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 88,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Status: ", item.status === "published" ? "Publicado" : "Rascunho"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 89,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 87,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 81,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("div", {
							className: "mt-4 flex flex-wrap gap-3",
							children: [item.status === "draft" ? /* @__PURE__ */ jsxDEV("button", {
								type: "button",
								className: "btn-base btn-primary",
								disabled: busyId === item.id,
								onClick: () => handlePublish(item.id),
								children: busyId === item.id ? "Publicando..." : "Publicar"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 93,
								columnNumber: 46
							}, this) : null, /* @__PURE__ */ jsxDEV("a", {
								className: "btn-base btn-ghost",
								href: `/checkout?productId=${item.id}`,
								children: "Ver checkout"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 96,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 92,
							columnNumber: 17
						}, this)]
					}, item.id, true, {
						fileName: _jsxFileName,
						lineNumber: 80,
						columnNumber: 32
					}, this))]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 75,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 62,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 61,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 60,
		columnNumber: 10
	}, this);
}
//#endregion
export { ProdutosPage as component };
