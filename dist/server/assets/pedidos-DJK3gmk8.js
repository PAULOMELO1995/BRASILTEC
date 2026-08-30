import { O as getSessionData, T as getMyOrders, n as PageShell, w as getMyOrderTimeline } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/pedidos.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/pedidos.tsx?tsr-split=component";
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function statusLabel(status) {
	if (status === "approved") return "Aprovado";
	if (status === "declined") return "Recusado";
	if (status === "refunded") return "Estornado";
	return "Pendente";
}
function PedidosPage() {
	const [orders, setOrders] = useState([]);
	const [statusFilter, setStatusFilter] = useState("all");
	const [productFilter, setProductFilter] = useState("all");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [productOptions, setProductOptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [timelineError, setTimelineError] = useState(null);
	const [timelineLoading, setTimelineLoading] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState(null);
	const [timeline, setTimeline] = useState([]);
	useEffect(() => {
		let cancelled = false;
		const fromIso = fromDate ? (/* @__PURE__ */ new Date(`${fromDate}T00:00:00.000Z`)).toISOString() : void 0;
		const toIso = toDate ? (/* @__PURE__ */ new Date(`${toDate}T23:59:59.999Z`)).toISOString() : void 0;
		setLoading(true);
		setError(null);
		getSessionData().then(() => getMyOrders({ data: {
			status: statusFilter === "all" ? void 0 : statusFilter,
			productId: productFilter === "all" ? void 0 : productFilter,
			fromCreatedAt: fromIso,
			toCreatedAt: toIso
		} })).then((items) => {
			if (!cancelled) setOrders(items);
		}).catch((err) => {
			if (err instanceof Error && err.message.includes("Sessão")) {
				window.location.assign("/login");
				return;
			}
			if (!cancelled) setError("Não foi possível carregar seus pedidos.");
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		fromDate,
		productFilter,
		statusFilter,
		toDate
	]);
	useEffect(() => {
		getSessionData().then(() => getMyOrders({ data: {} })).then((items) => {
			const typed = items;
			const unique = /* @__PURE__ */ new Map();
			for (const order of typed) if (!unique.has(order.productId)) unique.set(order.productId, order.productName);
			setProductOptions(Array.from(unique.entries()).map(([id, name]) => ({
				id,
				name
			})));
		}).catch(() => {
			setProductOptions([]);
		});
	}, []);
	const filteredOrders = useMemo(() => orders, [orders]);
	async function handleSelectOrder(orderId) {
		setSelectedOrderId(orderId);
		setTimelineLoading(true);
		setTimelineError(null);
		try {
			const events = await getMyOrderTimeline({ data: { orderId } });
			setTimeline(events);
		} catch {
			setTimeline([]);
			setTimelineError("Não foi possível carregar a timeline deste pedido.");
		} finally {
			setTimelineLoading(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated mx-auto max-w-5xl p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Pedidos"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 127,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Histórico de compras"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 128,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Acompanhe o status dos seus pedidos e a linha do tempo de eventos."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 129,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "status-filter",
							children: "Filtrar por status"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 132,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("select", {
							id: "status-filter",
							className: "field-input",
							value: statusFilter,
							onChange: (event) => setStatusFilter(event.target.value),
							children: [
								/* @__PURE__ */ jsxDEV("option", {
									value: "all",
									children: "Todos"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 134,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("option", {
									value: "pending",
									children: "Pendente"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 135,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("option", {
									value: "approved",
									children: "Aprovado"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 136,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("option", {
									value: "declined",
									children: "Recusado"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 137,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("option", {
									value: "refunded",
									children: "Estornado"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 138,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 133,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "product-filter",
							children: "Filtrar por produto"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 141,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("select", {
							id: "product-filter",
							className: "field-input",
							value: productFilter,
							onChange: (event) => setProductFilter(event.target.value),
							children: [/* @__PURE__ */ jsxDEV("option", {
								value: "all",
								children: "Todos os produtos"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 143,
								columnNumber: 15
							}, this), productOptions.map((product) => /* @__PURE__ */ jsxDEV("option", {
								value: product.id,
								children: product.name
							}, product.id, false, {
								fileName: _jsxFileName,
								lineNumber: 144,
								columnNumber: 46
							}, this))]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 142,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "from-date",
							children: "Data inicial"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 149,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("input", {
							id: "from-date",
							type: "date",
							className: "field-input",
							value: fromDate,
							onChange: (event) => setFromDate(event.target.value)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 150,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "to-date",
							children: "Data final"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 152,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("input", {
							id: "to-date",
							type: "date",
							className: "field-input",
							value: toDate,
							onChange: (event) => setToDate(event.target.value)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 153,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 131,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-3",
					children: /* @__PURE__ */ jsxDEV("button", {
						type: "button",
						className: "btn-base btn-ghost",
						onClick: () => {
							setStatusFilter("all");
							setProductFilter("all");
							setFromDate("");
							setToDate("");
						},
						children: "Limpar filtros"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 157,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 156,
					columnNumber: 11
				}, this),
				loading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando pedidos...",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 167,
					columnNumber: 22
				}, this) : null,
				error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: error,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 168,
					columnNumber: 20
				}, this) : null,
				!loading && !error && filteredOrders.length > 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "success",
					message: `${filteredOrders.length} pedido(s) encontrado(s) com os filtros atuais.`,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 169,
					columnNumber: 62
				}, this) : null,
				!loading && !error && filteredOrders.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "empty",
					message: "Nenhum pedido encontrado com o filtro atual.",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 171,
					columnNumber: 64
				}, this) : null,
				!loading && !error && filteredOrders.length > 0 ? /* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]",
					children: [/* @__PURE__ */ jsxDEV("div", {
						className: "grid gap-3",
						children: filteredOrders.map((order) => /* @__PURE__ */ jsxDEV("button", {
							type: "button",
							onClick: () => void handleSelectOrder(order.id),
							className: "panel w-full p-4 text-left",
							children: [
								/* @__PURE__ */ jsxDEV("p", {
									className: "font-medium text-foreground",
									children: order.productName
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 176,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: order.id
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 177,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ jsxDEV("div", {
									className: "mt-3 flex flex-wrap items-center gap-3 text-sm",
									children: [
										/* @__PURE__ */ jsxDEV("span", { children: formatCurrency(order.amountCents) }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 179,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ jsxDEV("span", {
											className: "text-muted-foreground",
											children: order.paymentMethod
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 180,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ jsxDEV("span", {
											className: "rounded-full border border-border px-2 py-0.5 text-xs",
											children: statusLabel(order.status)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 181,
											columnNumber: 23
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 178,
									columnNumber: 21
								}, this)
							]
						}, order.id, true, {
							fileName: _jsxFileName,
							lineNumber: 175,
							columnNumber: 46
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 174,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("aside", {
						className: "panel p-4",
						children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-sm font-medium",
							children: "Timeline do pedido"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 187,
							columnNumber: 17
						}, this), !selectedOrderId ? /* @__PURE__ */ jsxDEV(StatusNotice, {
							variant: "empty",
							message: "Selecione um pedido para ver os eventos.",
							className: "mt-3"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 188,
							columnNumber: 37
						}, this) : timelineLoading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
							variant: "loading",
							message: "Carregando eventos da timeline...",
							className: "mt-3"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 188,
							columnNumber: 158
						}, this) : timelineError ? /* @__PURE__ */ jsxDEV(StatusNotice, {
							variant: "error",
							message: timelineError,
							className: "mt-3"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 188,
							columnNumber: 272
						}, this) : timeline.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
							variant: "empty",
							message: "Sem eventos disponíveis para este pedido.",
							className: "mt-3"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 188,
							columnNumber: 372
						}, this) : /* @__PURE__ */ jsxDEV("ol", {
							className: "mt-3 grid gap-3",
							children: timeline.map((event) => /* @__PURE__ */ jsxDEV("li", {
								className: "rounded-xl border border-border/60 bg-background/70 p-3 text-sm",
								children: [
									/* @__PURE__ */ jsxDEV("p", {
										className: "font-medium",
										children: statusLabel(event.status)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 190,
										columnNumber: 25
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: new Date(event.createdAt).toLocaleString("pt-BR")
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 191,
										columnNumber: 25
									}, this),
									event.note ? /* @__PURE__ */ jsxDEV("p", {
										className: "mt-2 text-xs text-muted-foreground",
										children: event.note
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 192,
										columnNumber: 39
									}, this) : null
								]
							}, event.id, true, {
								fileName: _jsxFileName,
								lineNumber: 189,
								columnNumber: 44
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 188,
							columnNumber: 476
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 186,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 173,
					columnNumber: 62
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/marketplace",
						className: "btn-base btn-ghost",
						children: "Voltar ao marketplace"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 199,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/painel",
						className: "btn-base btn-primary",
						children: "Ir para o painel"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 202,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 198,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 126,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 125,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 124,
		columnNumber: 10
	}, this);
}
//#endregion
export { PedidosPage as component };
