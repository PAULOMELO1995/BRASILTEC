import { O as getSessionData, n as PageShell, s as createWithdrawalRequest, v as getFinanceData } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/financeiro.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/financeiro.tsx?tsr-split=component";
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function FinanceiroPage() {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	async function load() {
		setLoading(true);
		try {
			const finance = await getFinanceData();
			setData(finance);
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		getSessionData().then(() => load()).catch(() => window.location.assign("/login"));
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		if (submitting) return;
		const form = new FormData(event.currentTarget);
		const amount = Number(String(form.get("amount") ?? "0").replace(",", "."));
		const method = String(form.get("method") ?? "PIX");
		if (!Number.isFinite(amount) || amount <= 0) {
			setError("Informe um valor válido para saque.");
			return;
		}
		setSubmitting(true);
		setError(null);
		setSuccess(null);
		try {
			await createWithdrawalRequest({ data: {
				amountCents: Math.round(amount * 100),
				method
			} });
			await load();
			setSuccess("Solicitação de saque enviada com sucesso.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível solicitar saque.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Financeiro"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 78,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Saldo e saques"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 79,
					columnNumber: 11
				}, this),
				loading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando dados financeiros...",
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 81,
					columnNumber: 22
				}, this) : null,
				error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: error,
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 82,
					columnNumber: 20
				}, this) : null,
				success ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "success",
					message: success,
					className: "mt-4"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 83,
					columnNumber: 22
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4 md:grid-cols-4",
					children: [
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Receita bruta"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 87,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(data?.grossSalesCents ?? 0)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 88,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 86,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ jsxDEV("p", {
									className: "text-sm text-muted-foreground",
									children: "Taxa da plataforma"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 91,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-2 text-2xl font-semibold",
									children: formatCurrency(data?.platformFeeCents ?? 0)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 92,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [Math.round((data?.platformFeeRate ?? 0) * 100), "%"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 93,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 90,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Receita líquida"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 96,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(data?.netSalesCents ?? 0)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 97,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 95,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Saldo disponível"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 100,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(data?.availableBalanceCents ?? 0)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 101,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 99,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 85,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-4 grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Saques solicitados"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 107,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(data?.withdrawRequestedCents ?? 0)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 108,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 106,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Saques aprovados"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 111,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(data?.withdrawApprovedCents ?? 0)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 112,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 110,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Valor reservado"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 115,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: formatCurrency(data?.reservedWithdrawCents ?? 0)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 116,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 114,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 105,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("form", {
					className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
					onSubmit: handleSubmit,
					children: [
						/* @__PURE__ */ jsxDEV("h2", {
							className: "text-lg font-semibold",
							children: "Solicitar saque"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 121,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "mt-4 grid gap-4 md:grid-cols-2",
							children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
								className: "field-label",
								htmlFor: "amount",
								children: "Valor (BRL)"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 124,
								columnNumber: 17
							}, this), /* @__PURE__ */ jsxDEV("input", {
								id: "amount",
								name: "amount",
								type: "number",
								step: "0.01",
								min: "1",
								className: "field-input",
								placeholder: "1000.00"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 125,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 123,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
								className: "field-label",
								htmlFor: "method",
								children: "Método"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 128,
								columnNumber: 17
							}, this), /* @__PURE__ */ jsxDEV("select", {
								id: "method",
								name: "method",
								className: "field-input",
								defaultValue: "PIX",
								children: [
									/* @__PURE__ */ jsxDEV("option", { children: "PIX" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 130,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("option", { children: "Cartão" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 131,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("option", { children: "Transferência" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 132,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 129,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 127,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 122,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("button", {
							type: "submit",
							className: "btn-base btn-primary mt-5",
							disabled: submitting,
							children: submitting ? "Enviando..." : "Solicitar saque"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 137,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 120,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
					children: [/* @__PURE__ */ jsxDEV("h2", {
						className: "text-lg font-semibold",
						children: "Últimas solicitações"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 143,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("div", {
						className: "mt-4 grid gap-3",
						children: [(data?.recentWithdrawals ?? []).length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
							variant: "empty",
							message: "Nenhuma solicitação registrada."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 145,
							columnNumber: 63
						}, this) : null, (data?.recentWithdrawals ?? []).map((item) => /* @__PURE__ */ jsxDEV("article", {
							className: "rounded-xl border border-border/50 bg-background/80 p-3 text-sm",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "font-medium",
								children: formatCurrency(item.amountCents)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 148,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "text-muted-foreground",
								children: [
									item.method,
									" • ",
									item.status
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 149,
								columnNumber: 19
							}, this)]
						}, item.id, true, {
							fileName: _jsxFileName,
							lineNumber: 147,
							columnNumber: 60
						}, this))]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 144,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 142,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: /* @__PURE__ */ jsxDEV(Link, {
						to: "/painel",
						className: "btn-base btn-ghost",
						children: "Voltar ao painel"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 155,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 154,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 77,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 76,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 75,
		columnNumber: 10
	}, this);
}
//#endregion
export { FinanceiroPage as component };
