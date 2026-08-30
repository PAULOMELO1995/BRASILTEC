import { n as PageShell, o as createProductDraft } from "./PageShell-BwxNyzYO.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/produtos.novo.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/produtos.novo.tsx?tsr-split=component";
function NovoProdutoPage() {
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	async function handleSubmit(event) {
		event.preventDefault();
		if (submitting) return;
		const form = new FormData(event.currentTarget);
		const name = String(form.get("name") ?? "").trim();
		const description = String(form.get("description") ?? "").trim();
		const category = String(form.get("category") ?? "").trim();
		const price = Number(String(form.get("price") ?? "0").replace(",", "."));
		if (!name || !description || !category || !Number.isFinite(price) || price <= 0) {
			setError("Preencha nome, descrição, categoria e preço válidos.");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			await createProductDraft({ data: {
				name,
				description,
				category,
				priceCents: Math.round(price * 100)
			} });
			window.location.assign("/produtos");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível criar o produto.");
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("form", {
			className: "panel-elevated mx-auto max-w-2xl p-7 md:p-9",
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Criar Produto"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 40,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Novo produto"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 41,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Etapa inicial do fluxo: criar rascunho para depois publicar no marketplace."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 42,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4",
					children: [
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "name",
							children: "Nome"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 46,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "name",
							name: "name",
							className: "field-input",
							placeholder: "Curso de Marketing"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 47,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 45,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "description",
							children: "Descrição"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 50,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("textarea", {
							id: "description",
							name: "description",
							className: "field-input min-h-28",
							placeholder: "Descreva o que o aluno vai aprender"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 51,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 49,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "category",
							children: "Categoria"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 54,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "category",
							name: "category",
							className: "field-input",
							placeholder: "Educação"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 55,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 53,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
							className: "field-label",
							htmlFor: "price",
							children: "Preço (BRL)"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 58,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("input", {
							id: "price",
							name: "price",
							type: "number",
							min: "1",
							step: "0.01",
							className: "field-input",
							placeholder: "250.00"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 59,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 57,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 44,
					columnNumber: 11
				}, this),
				error ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 63,
					columnNumber: 20
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxDEV("button", {
						type: "submit",
						disabled: submitting,
						className: "btn-base btn-primary disabled:cursor-not-allowed disabled:opacity-70",
						children: submitting ? "Salvando..." : "Salvar rascunho"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 66,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/produtos",
						className: "btn-base btn-ghost",
						children: "Voltar"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 69,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 65,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 39,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 38,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 37,
		columnNumber: 10
	}, this);
}
//#endregion
export { NovoProdutoPage as component };
