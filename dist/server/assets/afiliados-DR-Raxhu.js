import { I as requestAffiliateAccess, O as getSessionData, g as getAffiliateData, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/afiliados.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/afiliados.tsx?tsr-split=component";
function statusLabel(status) {
	if (status === "approved") return "Aprovado";
	if (status === "rejected") return "Rejeitado";
	return "Em análise";
}
function AfiliadosPage() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	async function load() {
		setLoading(true);
		try {
			const current = await getAffiliateData();
			setData(current ?? null);
			setError(null);
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		getSessionData().then(() => load()).catch(() => window.location.assign("/login"));
	}, []);
	async function handleRequestAffiliate() {
		if (submitting) return;
		setSubmitting(true);
		setError(null);
		setSuccess(null);
		try {
			const created = await requestAffiliateAccess();
			setData(created);
			setSuccess("Solicitação de afiliação registrada com sucesso.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível solicitar afiliação.");
		} finally {
			setSubmitting(false);
		}
	}
	async function handleCopyLink() {
		if (!data?.referralLink) return;
		const fullLink = `${window.location.origin}${data.referralLink}`;
		try {
			await navigator.clipboard.writeText(fullLink);
			setSuccess("Link de afiliado copiado para a área de transferência.");
			setError(null);
		} catch {
			setError("Não foi possível copiar o link automaticamente. Copie manualmente abaixo.");
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Afiliados"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 68,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Programa de afiliação"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 69,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Solicite afiliação e use seu link de indicação para divulgar produtos no marketplace."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 70,
					columnNumber: 11
				}, this),
				loading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando status de afiliado...",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 72,
					columnNumber: 22
				}, this) : null,
				error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: error,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 73,
					columnNumber: 20
				}, this) : null,
				success ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "success",
					message: success,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 74,
					columnNumber: 22
				}, this) : null,
				!loading && !data ? /* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
					children: [/* @__PURE__ */ jsxDEV(StatusNotice, {
						variant: "empty",
						message: "Você ainda não solicitou afiliação."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 77,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("button", {
						type: "button",
						className: "btn-base btn-primary mt-4",
						onClick: handleRequestAffiliate,
						disabled: submitting,
						children: submitting ? "Enviando..." : "Solicitar afiliação"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 78,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 76,
					columnNumber: 32
				}, this) : null,
				!loading && data ? /* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]",
					children: [/* @__PURE__ */ jsxDEV("article", {
						className: "rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Status"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 85,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: statusLabel(data.status)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 86,
								columnNumber: 17
							}, this),
							data.note ? /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: data.note
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 87,
								columnNumber: 30
							}, this) : null,
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-3 text-xs text-muted-foreground",
								children: ["Atualizado em ", new Date(data.updatedAt).toLocaleString("pt-BR")]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 88,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 84,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("article", {
						className: "rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Código de afiliado"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 92,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold tracking-wide",
								children: data.referralCode
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 93,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: "Link de indicação"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 94,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("input", {
								readOnly: true,
								value: `${typeof window !== "undefined" ? window.location.origin : ""}${data.referralLink}`,
								className: "field-input mt-2"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 95,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("button", {
								type: "button",
								className: "btn-base btn-ghost mt-3",
								onClick: handleCopyLink,
								children: "Copiar link"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 96,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 91,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 83,
					columnNumber: 31
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/marketplace",
						className: "btn-base btn-ghost",
						children: "Ir ao marketplace"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 103,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/painel",
						className: "btn-base btn-primary",
						children: "Voltar ao painel"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 106,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 102,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 67,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 66,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 65,
		columnNumber: 10
	}, this);
}
//#endregion
export { AfiliadosPage as component };
