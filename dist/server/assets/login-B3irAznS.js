import { i as authenticateWithGoogle, k as loginUser, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { t as GoogleAuthButton } from "./GoogleAuthButton-CUiRB4pf.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/login.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/login.tsx?tsr-split=component";
function Login() {
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const senha = String(formData.get("senha") ?? "");
		if (!email || !senha) {
			setError("Preencha email e senha para continuar.");
			return;
		}
		if (submitting) return;
		setSubmitting(true);
		loginUser({ data: {
			email,
			password: senha
		} }).then(() => {
			window.location.assign("/painel");
		}).catch((err) => {
			setError(err instanceof Error ? err.message : "Não foi possível entrar agora.");
			setSubmitting(false);
		});
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page flex justify-center py-16 lg:py-24",
		children: /* @__PURE__ */ jsxDEV("form", {
			className: "panel-elevated w-full max-w-md p-7 md:p-9",
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Acesso"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 35,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-3 text-3xl",
					children: "Entrar"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 36,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Acompanhe vendas, clientes e financeiro no painel."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 37,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-7 grid gap-4",
					children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
						className: "field-label",
						htmlFor: "email",
						children: "Email"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 41,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("input", {
						id: "email",
						name: "email",
						type: "email",
						className: "field-input",
						placeholder: "voce@email.com"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 44,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 40,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("div", { children: [
						/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "senha",
							children: "Senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 47,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("input", {
							id: "senha",
							name: "senha",
							type: "password",
							className: "field-input",
							placeholder: "Sua senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 50,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("p", {
							className: "mt-2 text-right text-xs text-muted-foreground",
							children: /* @__PURE__ */ jsxDEV(Link, {
								to: "/recuperar-senha",
								className: "hover:text-primary hover:underline",
								children: "Esqueci minha senha"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 52,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 51,
							columnNumber: 15
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 46,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 39,
					columnNumber: 11
				}, this),
				error ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 59,
					columnNumber: 20
				}, this) : null,
				/* @__PURE__ */ jsxDEV("button", {
					type: "submit",
					disabled: submitting,
					className: "btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70",
					children: submitting ? "Entrando..." : "Entrar"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 63,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-4 flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsxDEV("span", { className: "h-px flex-1 bg-border" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 68,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("span", {
							className: "text-xs text-muted-foreground",
							children: "ou"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 69,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("span", { className: "h-px flex-1 bg-border" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 70,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 67,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV(GoogleAuthButton, {
					text: "Conectando com Google...",
					disabled: submitting,
					onCredential: async (credential) => {
						setError(null);
						if ((await authenticateWithGoogle({ data: { credential } })).user?.id) window.location.assign("/painel");
					}
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 72,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-5 text-center text-sm text-muted-foreground",
					children: [
						"Ainda não tem conta?",
						" ",
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/cadastro",
							className: "font-medium text-primary hover:underline",
							children: "Criar agora"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 90,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 88,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 34,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 33,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 32,
		columnNumber: 10
	}, this);
}
//#endregion
export { Login as component };
