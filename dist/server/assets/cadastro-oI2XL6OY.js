import { F as registerUser, i as authenticateWithGoogle, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { t as GoogleAuthButton } from "./GoogleAuthButton-CUiRB4pf.js";
import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/cadastro.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/cadastro.tsx?tsr-split=component";
var businessTypes = [
	"Produtor digital",
	"Infoprodutor",
	"Afiliado",
	"Agência",
	"E-commerce",
	"Serviços"
];
function Cadastro() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [selectedBusinessType, setSelectedBusinessType] = useState(businessTypes[0] ?? "Produtor digital");
	if (pathname !== "/cadastro") return /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 15,
		columnNumber: 12
	}, this);
	function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const nome = String(formData.get("nome") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const tipo = String(formData.get("tipo") ?? selectedBusinessType);
		const senha = String(formData.get("senha") ?? "");
		const confirmar = String(formData.get("confirmar") ?? "");
		if (!nome || !email || !senha || !confirmar) {
			setError("Preencha todos os campos para continuar.");
			return;
		}
		if (senha.length < 8) {
			setError("A senha precisa ter pelo menos 8 caracteres.");
			return;
		}
		if (senha !== confirmar) {
			setError("As senhas não coincidem.");
			return;
		}
		if (submitting) return;
		setSubmitting(true);
		registerUser({ data: {
			name: nome,
			email,
			password: senha,
			businessType: tipo
		} }).then(() => {
			window.location.assign("/cadastro/confirmacao");
		}).catch((err) => {
			setError(err instanceof Error ? err.message : "Não foi possível concluir o cadastro.");
			setSubmitting(false);
		});
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page grid gap-6 py-14 lg:grid-cols-[1fr_1.1fr] lg:py-20",
		children: [/* @__PURE__ */ jsxDEV("div", {
			className: "lg:pt-6",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Cadastro"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 56,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-4 text-4xl md:text-5xl",
					children: "Criar conta"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 57,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 max-w-md text-base leading-relaxed text-muted-foreground",
					children: "Nome, email, senha e confirmação para iniciar sua operação na plataforma."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 58,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("ul", {
					className: "mt-8 space-y-3 text-sm text-muted-foreground",
					children: [
						"Checkout pronto para PIX, cartão e transferência",
						"Área de membros com liberação automática",
						"Painel financeiro com saques rápidos"
					].map((item) => /* @__PURE__ */ jsxDEV("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ jsxDEV("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 63,
							columnNumber: 17
						}, this), item]
					}, item, true, {
						fileName: _jsxFileName,
						lineNumber: 62,
						columnNumber: 163
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 61,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 55,
			columnNumber: 9
		}, this), /* @__PURE__ */ jsxDEV("form", {
			className: "panel-elevated p-7 md:p-9",
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ jsxDEV("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsxDEV("div", {
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ jsxDEV("label", {
								className: "field-label",
								htmlFor: "nome",
								children: "Nome completo"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 72,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("input", {
								id: "nome",
								name: "nome",
								className: "field-input",
								placeholder: "Como você se chama"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 75,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 71,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ jsxDEV("label", {
								className: "field-label",
								htmlFor: "email",
								children: "Email"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 78,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("input", {
								id: "email",
								name: "email",
								type: "email",
								className: "field-input",
								placeholder: "voce@email.com"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 81,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 77,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ jsxDEV("label", {
								className: "field-label",
								htmlFor: "tipo",
								children: "Tipo de negócio"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 84,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("select", {
								id: "tipo",
								name: "tipo",
								className: "field-input",
								value: selectedBusinessType,
								onChange: (event) => setSelectedBusinessType(event.target.value),
								children: businessTypes.map((t) => /* @__PURE__ */ jsxDEV("option", {
									value: t,
									children: t
								}, t, false, {
									fileName: _jsxFileName,
									lineNumber: 88,
									columnNumber: 41
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 87,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 83,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "senha",
							children: "Senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 94,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "senha",
							name: "senha",
							type: "password",
							className: "field-input",
							placeholder: "Mínimo 8 caracteres"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 97,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 93,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "confirmar",
							children: "Confirmar senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 100,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "confirmar",
							name: "confirmar",
							type: "password",
							className: "field-input",
							placeholder: "Repita a senha"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 103,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 99,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 70,
					columnNumber: 11
				}, this),
				error ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 107,
					columnNumber: 20
				}, this) : null,
				/* @__PURE__ */ jsxDEV("button", {
					type: "submit",
					disabled: submitting,
					className: "btn-base btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70",
					children: submitting ? "Criando conta..." : "Cadastrar"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 111,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-4 flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsxDEV("span", { className: "h-px flex-1 bg-border" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 116,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("span", {
							className: "text-xs text-muted-foreground",
							children: "ou"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 117,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("span", { className: "h-px flex-1 bg-border" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 118,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 115,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV(GoogleAuthButton, {
					text: "Conectando com Google...",
					disabled: submitting,
					onCredential: async (credential) => {
						setError(null);
						if ((await authenticateWithGoogle({ data: {
							credential,
							businessType: selectedBusinessType
						} })).user?.id) window.location.assign("/cadastro/confirmacao");
					}
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 120,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-5 text-center text-sm text-muted-foreground",
					children: [
						"Já tem conta?",
						" ",
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/login",
							className: "font-medium text-primary hover:underline",
							children: "Entrar agora"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 139,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 137,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 69,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 54,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 53,
		columnNumber: 10
	}, this);
}
//#endregion
export { Cadastro as component };
