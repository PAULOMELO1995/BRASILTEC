import { A as logoutUser, O as getSessionData, _ as getDashboardData, n as PageShell } from "./PageShell-BwxNyzYO.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/painel.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/painel.tsx?tsr-split=component";
function Painel() {
	const [email, setEmail] = useState("Carregando...");
	const [name, setName] = useState("Carregando...");
	const [businessType, setBusinessType] = useState("Carregando...");
	const [storageMode, setStorageMode] = useState("local-file");
	const [dashboardWarning, setDashboardWarning] = useState(null);
	const [userCount, setUserCount] = useState(0);
	const [sessionCount, setSessionCount] = useState(0);
	const [sessionsExpiringSoon, setSessionsExpiringSoon] = useState(0);
	const [byBusiness, setByBusiness] = useState({});
	const [latestUsers, setLatestUsers] = useState([]);
	useEffect(() => {
		getSessionData().then((session) => {
			setName(session.user.name);
			setEmail(session.user.email);
			setBusinessType(session.user.businessType);
		}).catch(() => {
			window.location.assign("/login");
		});
		getDashboardData().then((dashboard) => {
			setUserCount(dashboard.userCount);
			setSessionCount(dashboard.sessionCount);
			setSessionsExpiringSoon(dashboard.sessionsExpiringSoon);
			setStorageMode(dashboard.storageMode === "postgres" || dashboard.storageMode === "sqlite" ? dashboard.storageMode : "local-file");
			setByBusiness(dashboard.byBusiness);
			setLatestUsers(dashboard.latestUsers);
		}).catch(() => {
			setDashboardWarning("Não foi possível carregar todas as métricas agora. Atualize em instantes.");
		});
	}, []);
	function handleLogout() {
		logoutUser().finally(() => {
			window.location.assign("/login");
		});
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page flex justify-center py-16 lg:py-24",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated w-full max-w-3xl p-8 md:p-12",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Painel"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 48,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-4 text-3xl md:text-4xl",
					children: "Você avançou para o painel"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 49,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-3 text-sm leading-relaxed text-muted-foreground",
					children: "O login agora lê a sessão, mostra os dados do banco e mantém a navegação fora da URL."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 50,
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
							lineNumber: 56,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 font-medium text-foreground",
							children: name
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 57,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 55,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-muted-foreground",
							children: "Email"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 60,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 font-medium text-foreground",
							children: email
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 61,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 59,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-muted-foreground",
							children: "Tipo de negócio"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 64,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 font-medium text-foreground",
							children: businessType
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 65,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 63,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 54,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ jsxDEV("div", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Usuários cadastrados"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 71,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-3xl font-semibold",
								children: userCount
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 72,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 70,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Sessões ativas"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 75,
								columnNumber: 15
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-3xl font-semibold",
								children: sessionCount
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 76,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 74,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ jsxDEV("p", {
									className: "text-sm text-muted-foreground",
									children: "Banco protegido"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 79,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-2 text-sm leading-relaxed text-foreground",
									children: "Senhas com scrypt + sessões com expiração de 8h e token hasheado."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 80,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Persistência: ", storageMode === "postgres" ? "PostgreSQL" : storageMode === "sqlite" ? "SQLite" : "Arquivo local (.data)"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 81,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 78,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 69,
					columnNumber: 11
				}, this),
				dashboardWarning ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700",
					children: dashboardWarning
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 87,
					columnNumber: 31
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-4 panel p-5",
					children: [/* @__PURE__ */ jsxDEV("p", {
						className: "text-sm text-muted-foreground",
						children: "Sessões expirando em até 1h"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 92,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("p", {
						className: "mt-2 text-2xl font-semibold",
						children: sessionsExpiringSoon
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 93,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 91,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-4 panel p-5",
					children: [/* @__PURE__ */ jsxDEV("p", {
						className: "text-sm text-muted-foreground",
						children: "Usuários por tipo de negócio"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 97,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: Object.entries(byBusiness).map(([kind, count]) => /* @__PURE__ */ jsxDEV("div", {
							className: "rounded-2xl border border-border/60 bg-background/80 p-3",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-xs uppercase tracking-wide text-muted-foreground",
								children: kind
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 100,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-1 text-xl font-semibold text-foreground",
								children: count
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 101,
								columnNumber: 19
							}, this)]
						}, kind, true, {
							fileName: _jsxFileName,
							lineNumber: 99,
							columnNumber: 66
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 98,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 96,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-8 rounded-3xl border border-border/60 bg-background/70 p-5",
					children: [/* @__PURE__ */ jsxDEV("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
							className: "text-sm text-muted-foreground",
							children: "Últimos cadastros"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 109,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("p", {
							className: "mt-1 text-lg font-medium text-foreground",
							children: "Gerenciamento do banco"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 110,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 108,
							columnNumber: 15
						}, this), /* @__PURE__ */ jsxDEV("button", {
							type: "button",
							className: "btn-base btn-ghost",
							onClick: handleLogout,
							children: "Sair"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 112,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 107,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV("div", {
						className: "mt-5 grid gap-3",
						children: latestUsers.map((user) => /* @__PURE__ */ jsxDEV("article", {
							className: "rounded-2xl border border-border/60 bg-background/80 p-4",
							children: [
								/* @__PURE__ */ jsxDEV("p", {
									className: "font-medium text-foreground",
									children: user.name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 119,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "text-sm text-muted-foreground",
									children: user.email
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 120,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ jsxDEV("p", {
									className: "mt-2 text-xs uppercase tracking-wide text-primary",
									children: user.businessType
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 121,
									columnNumber: 19
								}, this)
							]
						}, user.email, true, {
							fileName: _jsxFileName,
							lineNumber: 118,
							columnNumber: 40
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 117,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 106,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-8 flex flex-col gap-3 sm:flex-row",
					children: [
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/produtos/novo",
							className: "btn-base btn-primary",
							children: "Criar produto"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 127,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/produtos",
							className: "btn-base btn-ghost",
							children: "Gerenciar produtos"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 130,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/marketplace",
							className: "btn-base btn-ghost",
							children: "Ir ao marketplace"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 133,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/pedidos",
							className: "btn-base btn-ghost",
							children: "Meus pedidos"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 136,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/membros",
							className: "btn-base btn-ghost",
							children: "Área de membros"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 139,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/financeiro",
							className: "btn-base btn-ghost",
							children: "Financeiro"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 142,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/afiliados",
							className: "btn-base btn-ghost",
							children: "Afiliados"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 145,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/notificacoes",
							className: "btn-base btn-ghost",
							children: "Notificações"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 148,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/admin",
							className: "btn-base btn-ghost",
							children: "Admin"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 151,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 126,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 47,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 46,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 45,
		columnNumber: 10
	}, this);
}
//#endregion
export { Painel as component };
