import { C as getMyNotificationsData, N as readAllMyNotifications, O as getSessionData, P as readMyNotification, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/notificacoes.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/notificacoes.tsx?tsr-split=component";
function NotificacoesPage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);
	async function load() {
		setLoading(true);
		try {
			const notifications = await getMyNotificationsData();
			setItems(notifications);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível carregar notificações.");
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		getSessionData().then(() => load()).catch(() => window.location.assign("/login"));
	}, []);
	async function handleRead(item) {
		if (submitting || item.readAt) return;
		setSubmitting(true);
		try {
			await readMyNotification({ data: { notificationId: item.id } });
			setItems((current) => current.map((entry) => entry.id === item.id ? {
				...entry,
				readAt: (/* @__PURE__ */ new Date()).toISOString()
			} : entry));
			setSuccess("Notificação marcada como lida.");
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível marcar como lida.");
		} finally {
			setSubmitting(false);
		}
	}
	async function handleReadAll() {
		if (submitting || unreadCount === 0) return;
		setSubmitting(true);
		try {
			await readAllMyNotifications();
			const now = (/* @__PURE__ */ new Date()).toISOString();
			setItems((current) => current.map((entry) => entry.readAt ? entry : {
				...entry,
				readAt: now
			}));
			setSuccess("Todas as notificações foram marcadas como lidas.");
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Não foi possível concluir a ação.");
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
					children: "Notificações"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 80,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Central de notificações"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 81,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Acompanhe eventos importantes da sua conta e entre rapidamente no fluxo relacionado."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 82,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ jsxDEV("span", {
						className: "rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground",
						children: ["Não lidas: ", /* @__PURE__ */ jsxDEV("strong", {
							className: "text-foreground",
							children: unreadCount
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 86,
							columnNumber: 26
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 85,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("button", {
						type: "button",
						className: "btn-base btn-ghost",
						onClick: handleReadAll,
						disabled: submitting || unreadCount === 0,
						children: "Marcar todas como lidas"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 88,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 84,
					columnNumber: 11
				}, this),
				loading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando notificações...",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 93,
					columnNumber: 22
				}, this) : null,
				error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: error,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 94,
					columnNumber: 20
				}, this) : null,
				success ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "success",
					message: success,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 95,
					columnNumber: 22
				}, this) : null,
				!loading && items.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "empty",
					message: "Você ainda não possui notificações.",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 97,
					columnNumber: 45
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-3",
					children: items.map((item) => /* @__PURE__ */ jsxDEV("article", {
						className: "rounded-2xl border border-border/60 bg-background/70 p-4",
						children: [/* @__PURE__ */ jsxDEV("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ jsxDEV("div", { children: [
								/* @__PURE__ */ jsxDEV("p", {
									className: "text-base font-semibold",
									children: item.title
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 103,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: item.message
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 104,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: new Date(item.createdAt).toLocaleString("pt-BR")
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 105,
									columnNumber: 21
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 102,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("span", {
								className: `rounded-full px-2.5 py-1 text-xs font-medium ${item.readAt ? "bg-surface-2 text-muted-foreground" : "bg-primary/10 text-primary"}`,
								children: item.readAt ? "Lida" : "Nova"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 108,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 101,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [!item.readAt ? /* @__PURE__ */ jsxDEV("button", {
								type: "button",
								className: "btn-base btn-ghost",
								onClick: () => handleRead(item),
								disabled: submitting,
								children: "Marcar como lida"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 114,
								columnNumber: 35
							}, this) : null, item.link ? /* @__PURE__ */ jsxDEV(Link, {
								to: item.link,
								className: "btn-base btn-primary",
								children: "Abrir destino"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 118,
								columnNumber: 32
							}, this) : null]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 113,
							columnNumber: 17
						}, this)]
					}, item.id, true, {
						fileName: _jsxFileName,
						lineNumber: 100,
						columnNumber: 32
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 99,
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
						lineNumber: 126,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 125,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 79,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 78,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 77,
		columnNumber: 10
	}, this);
}
//#endregion
export { NotificacoesPage as component };
