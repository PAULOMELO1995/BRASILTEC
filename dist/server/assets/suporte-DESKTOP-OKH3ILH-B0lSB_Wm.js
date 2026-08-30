import { B as sendSupportContactEmail, n as PageShell, t as PageHeader } from "./PageShell-BwxNyzYO.js";
import { useState } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/suporte-DESKTOP-OKH3ILH.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/suporte-DESKTOP-OKH3ILH.tsx?tsr-split=component";
var hours = [
	["Segunda a sexta", "08:00 - 20:00"],
	["Sábado", "09:00 - 14:00"],
	["Domingo/Feriados", "Plantão crítico"]
];
var priorities = [
	["Incidente de pagamento", "até 30 min"],
	["Acesso de cliente", "até 2 h"],
	["Dúvidas gerais", "até 24 h"]
];
var quickFaq = [
	["Meu checkout não aprovou o pagamento.", "Verifique o método selecionado, o status na tela de vendas e tente novamente."],
	["Cliente não recebeu acesso ao conteúdo.", "Confirme o status do pedido como \"Confirmado\" ou \"Processando\"."],
	["Como publicar um produto?", "Use o fluxo em Produtos: Etapa 1 a Etapa 4 e finalize em \"Publicar\"."]
];
function Suporte() {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	async function handleSubmit(event) {
		event.preventDefault();
		if (submitting) return;
		const form = event.currentTarget;
		const formData = new FormData(form);
		const name = String(formData.get("nome") ?? "").trim();
		const senderEmail = String(formData.get("email") ?? "").trim();
		const recipientEmail = String(formData.get("destinatario") ?? "").trim();
		const subject = String(formData.get("assunto") ?? "").trim();
		const message = String(formData.get("mensagem") ?? "").trim();
		if (!name || !senderEmail || !subject || !message) {
			setError("Preencha nome, email, assunto e mensagem para enviar o chamado.");
			return;
		}
		setSubmitting(true);
		setError(null);
		setSuccess(null);
		try {
			const response = await sendSupportContactEmail({ data: {
				name,
				senderEmail,
				recipientEmail: recipientEmail || void 0,
				subject,
				message
			} });
			const modeLabel = response.delivered ? `Email enviado para ${response.recipientEmail}.` : `Chamado registrado para ${response.recipientEmail} (modo log: configure provider para envio externo).`;
			setSuccess(modeLabel);
			form.reset();
		} catch (err) {
			setSuccess(null);
			setError(err instanceof Error ? err.message : "Não foi possível enviar o chamado no momento.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: [
		/* @__PURE__ */ jsxDEV(PageHeader, {
			eyebrow: "Suporte",
			title: "Atendimento humano para operação e crescimento",
			description: "Suporte 24/7 para checkout, saques, integrações e dúvidas operacionais."
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 55,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page grid gap-4 lg:grid-cols-[1.2fr_1fr]",
			children: [/* @__PURE__ */ jsxDEV("form", {
				className: "panel-elevated p-7 md:p-9",
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ jsxDEV("h2", {
						className: "text-xl",
						children: "Abrir chamado de suporte"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 59,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Preencha os dados para que o site entre em contato com o email do destinatário autorizado."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 60,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("label", {
								className: "field-label",
								htmlFor: "nome",
								children: "Nome"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 65,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("input", {
								id: "nome",
								name: "nome",
								className: "field-input",
								placeholder: "Seu nome completo"
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
								htmlFor: "email",
								children: "Email"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 71,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("input", {
								id: "email",
								name: "email",
								type: "email",
								className: "field-input",
								placeholder: "voce@email.com"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 74,
								columnNumber: 15
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 70,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "sm:col-span-2",
								children: [
									/* @__PURE__ */ jsxDEV("label", {
										className: "field-label",
										htmlFor: "destinatario",
										children: "Email do destinatário (opcional)"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 77,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ jsxDEV("input", {
										id: "destinatario",
										name: "destinatario",
										type: "email",
										className: "field-input",
										placeholder: "suporte@brasiltec.com"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 80,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "Se não informar, usamos o destinatário padrão configurado."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 81,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 76,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ jsxDEV("label", {
									className: "field-label",
									htmlFor: "assunto",
									children: "Assunto"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 84,
									columnNumber: 15
								}, this), /* @__PURE__ */ jsxDEV("input", {
									id: "assunto",
									name: "assunto",
									className: "field-input",
									placeholder: "Resumo do chamado"
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
							/* @__PURE__ */ jsxDEV("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ jsxDEV("label", {
									className: "field-label",
									htmlFor: "mensagem",
									children: "Mensagem"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 90,
									columnNumber: 15
								}, this), /* @__PURE__ */ jsxDEV("textarea", {
									id: "mensagem",
									name: "mensagem",
									rows: 5,
									className: "field-input resize-y",
									placeholder: "Descreva o que aconteceu"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 93,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 89,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 63,
						columnNumber: 11
					}, this),
					error ? /* @__PURE__ */ jsxDEV("p", {
						className: "mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive",
						children: error
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 96,
						columnNumber: 20
					}, this) : null,
					success ? /* @__PURE__ */ jsxDEV("p", {
						className: "mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800",
						children: success
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 98,
						columnNumber: 22
					}, this) : null,
					/* @__PURE__ */ jsxDEV("button", {
						type: "submit",
						disabled: submitting,
						className: "btn-base btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-70",
						children: submitting ? "Enviando..." : "Enviar chamado"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 100,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 58,
				columnNumber: 9
			}, this), /* @__PURE__ */ jsxDEV("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ jsxDEV("article", {
						className: "panel p-6",
						children: [/* @__PURE__ */ jsxDEV("h2", {
							className: "text-lg",
							children: "Canais de atendimento"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 107,
							columnNumber: 13
						}, this), /* @__PURE__ */ jsxDEV("ul", {
							className: "mt-3 space-y-2 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ jsxDEV("li", { children: [/* @__PURE__ */ jsxDEV("span", {
									className: "font-medium text-foreground",
									children: "Email:"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 110,
									columnNumber: 17
								}, this), " suporte@brasiltec.com"] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 109,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("li", { children: [/* @__PURE__ */ jsxDEV("span", {
									className: "font-medium text-foreground",
									children: "WhatsApp:"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 113,
									columnNumber: 17
								}, this), " +258 84 000 0000"] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 112,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("li", { children: [/* @__PURE__ */ jsxDEV("span", {
									className: "font-medium text-foreground",
									children: "Chat:"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 116,
									columnNumber: 17
								}, this), " disponível no painel (seg-sex)"] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 115,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 108,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 106,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV("article", {
						className: "panel p-6",
						children: [/* @__PURE__ */ jsxDEV("h2", {
							className: "text-lg",
							children: "Horário de operação"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 122,
							columnNumber: 13
						}, this), /* @__PURE__ */ jsxDEV("ul", {
							className: "mt-3 space-y-2 text-sm text-muted-foreground",
							children: hours.map(([k, v]) => /* @__PURE__ */ jsxDEV("li", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ jsxDEV("span", { children: k }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 125,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("span", {
									className: "font-medium text-foreground",
									children: v
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 126,
									columnNumber: 19
								}, this)]
							}, k, true, {
								fileName: _jsxFileName,
								lineNumber: 124,
								columnNumber: 38
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 123,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 121,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV("article", {
						className: "panel p-6",
						children: [/* @__PURE__ */ jsxDEV("h2", {
							className: "text-lg",
							children: "Prioridades de resposta"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 132,
							columnNumber: 13
						}, this), /* @__PURE__ */ jsxDEV("ul", {
							className: "mt-3 space-y-2 text-sm text-muted-foreground",
							children: priorities.map(([k, v]) => /* @__PURE__ */ jsxDEV("li", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ jsxDEV("span", { children: k }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 135,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("span", {
									className: "font-medium text-primary",
									children: v
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 136,
									columnNumber: 19
								}, this)]
							}, k, true, {
								fileName: _jsxFileName,
								lineNumber: 134,
								columnNumber: 43
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 133,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 131,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 105,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 57,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ jsxDEV("section", {
			className: "container-page mt-14",
			children: [/* @__PURE__ */ jsxDEV("h2", {
				className: "text-2xl",
				children: "Perguntas rápidas"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 144,
				columnNumber: 9
			}, this), /* @__PURE__ */ jsxDEV("div", {
				className: "mt-4 grid gap-4 md:grid-cols-3",
				children: quickFaq.map(([q, a]) => /* @__PURE__ */ jsxDEV("article", {
					className: "panel p-6",
					children: [/* @__PURE__ */ jsxDEV("h3", {
						className: "text-base",
						children: q
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 147,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV("p", {
						className: "mt-2 text-sm leading-relaxed text-muted-foreground",
						children: a
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 148,
						columnNumber: 15
					}, this)]
				}, q, true, {
					fileName: _jsxFileName,
					lineNumber: 146,
					columnNumber: 37
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 145,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 143,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 54,
		columnNumber: 10
	}, this);
}
//#endregion
export { Suporte as component };
