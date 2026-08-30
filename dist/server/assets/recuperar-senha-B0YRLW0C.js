import { L as requestPasswordResetEmail, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/recuperar-senha.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/recuperar-senha.tsx?tsr-split=component";
function RecuperarSenhaPage() {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [debugToken, setDebugToken] = useState(null);
	const [success, setSuccess] = useState(false);
	async function handleSubmit(event) {
		event.preventDefault();
		if (submitting) return;
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		if (!email) {
			setError("Informe o email da conta para continuar.");
			return;
		}
		setSubmitting(true);
		setError(null);
		setDebugToken(null);
		try {
			const response = await requestPasswordResetEmail({ data: { email } });
			setSuccess(true);
			setDebugToken(response.resetToken ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível processar a solicitação.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page flex justify-center py-16 lg:py-24",
		children: /* @__PURE__ */ jsxDEV("form", {
			className: "panel-elevated w-full max-w-md p-7 md:p-9",
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Recuperação de acesso"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 43,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-3 text-3xl",
					children: "Esqueci minha senha"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 44,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Informe seu email para gerar um token de redefinição."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 45,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-7",
					children: [/* @__PURE__ */ jsxDEV("label", {
						className: "field-label",
						htmlFor: "email",
						children: "Email"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 48,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("input", {
						id: "email",
						name: "email",
						type: "email",
						className: "field-input",
						placeholder: "voce@email.com"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 51,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 47,
					columnNumber: 11
				}, this),
				error ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 54,
					columnNumber: 20
				}, this) : null,
				success ? /* @__PURE__ */ jsxDEV("div", {
					className: "mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800",
					children: [/* @__PURE__ */ jsxDEV("p", { children: "Se o email existir, a recuperação foi iniciada com sucesso." }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 57,
						columnNumber: 15
					}, this), debugToken ? /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV("p", {
						className: "mt-2 break-all text-xs",
						children: ["Token de desenvolvimento: ", debugToken]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 59,
						columnNumber: 19
					}, this), /* @__PURE__ */ jsxDEV("a", {
						className: "mt-3 inline-flex text-xs font-medium underline",
						href: `/redefinir-senha?token=${encodeURIComponent(debugToken)}`,
						children: "Continuar para redefinir senha"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 60,
						columnNumber: 19
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 58,
						columnNumber: 29
					}, this) : null]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 56,
					columnNumber: 22
				}, this) : null,
				/* @__PURE__ */ jsxDEV("button", {
					type: "submit",
					disabled: submitting,
					className: "btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70",
					children: submitting ? "Gerando..." : "Gerar recuperação"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 66,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-5 text-center text-sm text-muted-foreground",
					children: [
						"Lembrou a senha?",
						" ",
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/login",
							className: "font-medium text-primary hover:underline",
							children: "Voltar ao login"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 72,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 70,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 42,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 41,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 40,
		columnNumber: 10
	}, this);
}
//#endregion
export { RecuperarSenhaPage as component };
