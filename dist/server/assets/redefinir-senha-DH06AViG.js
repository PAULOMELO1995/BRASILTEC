import { R as resetPasswordByToken, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/redefinir-senha.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/redefinir-senha.tsx?tsr-split=component";
function RedefinirSenhaPage() {
	const [token, setToken] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	useEffect(() => {
		const queryToken = new URLSearchParams(window.location.search).get("token") ?? "";
		setToken(queryToken);
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		if (submitting) return;
		const formData = new FormData(event.currentTarget);
		const tokenInput = String(formData.get("token") ?? "").trim();
		const password = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");
		if (!tokenInput || tokenInput.length < 12) {
			setError("Informe um token de recuperação válido.");
			return;
		}
		if (password.length < 8) {
			setError("A nova senha deve ter pelo menos 8 caracteres.");
			return;
		}
		if (password !== confirmPassword) {
			setError("As senhas não conferem.");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			await resetPasswordByToken({ data: {
				token: tokenInput,
				password
			} });
			setSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
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
					children: "Nova senha"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 52,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-3 text-3xl",
					children: "Redefinir senha"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 53,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Use o token gerado para definir uma nova senha de acesso."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 54,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-7 grid gap-4",
					children: [
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "token",
							children: "Token de recuperação"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 58,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "token",
							name: "token",
							className: "field-input",
							value: token,
							onChange: (event) => setToken(event.target.value),
							placeholder: "Cole seu token"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 61,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 57,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "password",
							children: "Nova senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 65,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "password",
							name: "password",
							type: "password",
							className: "field-input",
							placeholder: "Mínimo de 8 caracteres"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 68,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 64,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "confirmPassword",
							children: "Confirmar nova senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 72,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "confirmPassword",
							name: "confirmPassword",
							type: "password",
							className: "field-input",
							placeholder: "Repita a senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 75,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 71,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 56,
					columnNumber: 11
				}, this),
				error ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 79,
					columnNumber: 20
				}, this) : null,
				success ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800",
					children: "Senha redefinida com sucesso. Faça login novamente para continuar."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 81,
					columnNumber: 22
				}, this) : null,
				/* @__PURE__ */ jsxDEV("button", {
					type: "submit",
					disabled: submitting,
					className: "btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70",
					children: submitting ? "Salvando..." : "Salvar nova senha"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 85,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-5 text-center text-sm text-muted-foreground",
					children: /* @__PURE__ */ jsxDEV(Link, {
						to: "/login",
						className: "font-medium text-primary hover:underline",
						children: "Ir para login"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 90,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 89,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 51,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 50,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 49,
		columnNumber: 10
	}, this);
}
//#endregion
export { RedefinirSenhaPage as component };
