import { O as getSessionData, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/cadastro.confirmacao.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/cadastro.confirmacao.tsx?tsr-split=component";
function CadastroConfirmacao() {
	const [name, setName] = useState("Carregando...");
	const [email, setEmail] = useState("Carregando...");
	const [businessType, setBusinessType] = useState("Carregando...");
	useEffect(() => {
		getSessionData().then(({ user }) => {
			setName(user.name);
			setEmail(user.email);
			setBusinessType(user.businessType);
		}).catch(() => {
			setName("Não informado");
			setEmail("Não informado");
			setBusinessType("Não informado");
		});
	}, []);
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page flex justify-center py-16 lg:py-24",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated w-full max-w-2xl p-8 md:p-12",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Cadastro concluído"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 25,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-4 text-3xl md:text-4xl",
					children: "Sua conta foi criada com sucesso"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 26,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground",
					children: "A próxima rota foi gerada após o envio do formulário. Você já pode seguir para a navegação da conta."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 27,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-8 grid gap-4 rounded-3xl border border-border/60 bg-background/70 p-5 text-sm md:grid-cols-3",
					children: [
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-muted-foreground",
							children: "Nome"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 33,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 font-medium text-foreground",
							children: name
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 34,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 32,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-muted-foreground",
							children: "Email"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 37,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 font-medium text-foreground",
							children: email
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 38,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 36,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-muted-foreground",
							children: "Tipo de negócio"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 41,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 font-medium text-foreground",
							children: businessType
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 42,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 40,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 31,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-8 flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/",
						className: "btn-base btn-primary",
						children: "Ir para o início"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 47,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/planos",
						className: "btn-base btn-ghost",
						children: "Ver planos"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 50,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 46,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 24,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 23,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 22,
		columnNumber: 10
	}, this);
}
//#endregion
export { CadastroConfirmacao as component };
