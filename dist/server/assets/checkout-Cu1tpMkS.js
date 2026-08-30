import { H as transitionMarketplaceOrderStatus, O as getSessionData, a as createMarketplaceCheckoutOrder, b as getMarketplaceProducts, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/checkout.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/checkout.tsx?tsr-split=component";
var methods = [
	"PIX",
	"Cartão",
	"Boleto",
	"Transferência"
];
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function CheckoutPage() {
	const [products, setProducts] = useState([]);
	const [selectedProductId, setSelectedProductId] = useState("");
	const [selectedMethod, setSelectedMethod] = useState("PIX");
	const [simulatedOutcome, setSimulatedOutcome] = useState("approved");
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [loadError, setLoadError] = useState(null);
	const [orderStatus, setOrderStatus] = useState("idle");
	const isBrowser = typeof window !== "undefined";
	const selectedProduct = products.find((item) => item.id === selectedProductId) ?? null;
	useEffect(() => {
		if (!isBrowser) return;
		const fromQuery = new URLSearchParams(window.location.search).get("productId") ?? "";
		setSelectedProductId(fromQuery);
	}, [isBrowser]);
	useEffect(() => {
		setLoadingProducts(true);
		getSessionData().then(() => getMarketplaceProducts()).then((list) => {
			setProducts(list);
			setLoadError(null);
		}).catch((err) => {
			if (err instanceof Error && err.message.includes("Sessão")) {
				if (isBrowser) window.location.assign("/login");
				return;
			}
			setLoadError("Não foi possível carregar os produtos do checkout.");
		}).finally(() => {
			setLoadingProducts(false);
		});
	}, []);
	async function handleBuy() {
		if (!selectedProduct) {
			setError("Selecione um produto válido para continuar.");
			return;
		}
		if (submitting) return;
		setSubmitting(true);
		setError(null);
		setOrderStatus("idle");
		try {
			const order = await createMarketplaceCheckoutOrder({ data: {
				productId: selectedProduct.id,
				paymentMethod: selectedMethod
			} });
			setOrderStatus("pending");
			if ((await transitionMarketplaceOrderStatus({ data: {
				orderId: order.orderId,
				status: simulatedOutcome
			} })).status === "approved") {
				setOrderStatus("approved");
				if (isBrowser) window.location.assign("/membros");
				return;
			}
			setOrderStatus("declined");
			setSubmitting(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível finalizar a compra.");
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated mx-auto max-w-3xl p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Checkout"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 96,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Finalizar compra"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 97,
					columnNumber: 11
				}, this),
				loadingProducts ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando dados do checkout...",
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 99,
					columnNumber: 30
				}, this) : null,
				loadError ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: loadError,
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 101,
					columnNumber: 24
				}, this) : null,
				!loadingProducts && !loadError && selectedProduct ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "success",
					message: "Produto carregado. Você pode finalizar a compra.",
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 103,
					columnNumber: 64
				}, this) : null,
				!selectedProduct ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: products.length === 0 ? "empty" : "info",
					message: products.length === 0 ? "Nenhum produto publicado disponível para compra neste momento." : "Produto não encontrado. Volte ao marketplace para selecionar um item.",
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 105,
					columnNumber: 31
				}, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
					/* @__PURE__ */ jsxDEV("article", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("h2", {
								className: "text-xl font-semibold",
								children: selectedProduct.name
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 107,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: selectedProduct.description
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 108,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-3 text-sm uppercase tracking-wide text-muted-foreground",
								children: selectedProduct.category
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 109,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-4 text-2xl font-semibold",
								children: formatCurrency(selectedProduct.priceCents)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 110,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 106,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "method",
							children: "Método de pagamento"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 114,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("select", {
							id: "method",
							className: "field-input",
							value: selectedMethod,
							onChange: (event) => setSelectedMethod(event.target.value),
							children: methods.map((method) => /* @__PURE__ */ jsxDEV("option", {
								value: method,
								children: method
							}, method, false, {
								fileName: _jsxFileName,
								lineNumber: 116,
								columnNumber: 42
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 115,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 113,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "outcome",
							children: "Resultado da simulação"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 123,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("select", {
							id: "outcome",
							className: "field-input",
							value: simulatedOutcome,
							onChange: (event) => setSimulatedOutcome(event.target.value),
							children: [/* @__PURE__ */ jsxDEV("option", {
								value: "approved",
								children: "Aprovar pagamento"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 125,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("option", {
								value: "declined",
								children: "Recusar pagamento"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 126,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 124,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 122,
						columnNumber: 15
					}, this),
					orderStatus === "pending" ? /* @__PURE__ */ jsxDEV(StatusNotice, {
						variant: "info",
						message: "Pagamento em análise. Confirmando status do pedido...",
						className: "mt-4"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 130,
						columnNumber: 44
					}, this) : null,
					orderStatus === "declined" ? /* @__PURE__ */ jsxDEV(StatusNotice, {
						variant: "error",
						message: "Pagamento recusado. Escolha outro método e tente novamente.",
						className: "mt-4"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 132,
						columnNumber: 45
					}, this) : null,
					error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
						variant: "error",
						message: error,
						className: "mt-4"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 134,
						columnNumber: 24
					}, this) : null,
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ jsxDEV("button", {
							type: "button",
							className: "btn-base btn-primary",
							onClick: handleBuy,
							disabled: submitting,
							children: submitting ? "Processando..." : "Finalizar compra"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 137,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV(Link, {
							to: "/marketplace",
							className: "btn-base btn-ghost",
							children: "Voltar marketplace"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 140,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 136,
						columnNumber: 15
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 105,
					columnNumber: 291
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 95,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 94,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 93,
		columnNumber: 10
	}, this);
}
//#endregion
export { CheckoutPage as component };
