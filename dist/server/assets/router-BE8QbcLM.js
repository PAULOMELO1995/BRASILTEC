import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/styles.css?url
var styles_default = "/assets/styles-hkHsWq4s.css";
//#endregion
//#region src/lib/lovable-error-reporting.ts
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
//#endregion
//#region src/routes/__root.tsx
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/__root.tsx";
function NotFoundComponent() {
	return /* @__PURE__ */ jsxDEV("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsxDEV("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 19,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 20,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 21,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsxDEV(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 25,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 24,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 18,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 17,
		columnNumber: 5
	}, this);
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsxDEV("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsxDEV("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 47,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 50,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsxDEV("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 54,
						columnNumber: 11
					}, this), /* @__PURE__ */ jsxDEV("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 63,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 53,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 46,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 45,
		columnNumber: 5
	}, this);
}
var Route$22 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Brasiltec | Plataforma para creators digitais" },
			{
				name: "description",
				content: "Venda produtos digitais com checkout claro, pagamentos locais e operação organizada."
			},
			{
				name: "author",
				content: "Brasiltec"
			},
			{
				property: "og:title",
				content: "Brasiltec | Plataforma para creators digitais"
			},
			{
				property: "og:description",
				content: "Venda produtos digitais com checkout claro, pagamentos locais e operação organizada."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/logo.svg",
				type: "image/svg+xml"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxDEV("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsxDEV("head", { children: /* @__PURE__ */ jsxDEV(HeadContent, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 119,
			columnNumber: 9
		}, this) }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 118,
			columnNumber: 7
		}, this), /* @__PURE__ */ jsxDEV("body", { children: [children, /* @__PURE__ */ jsxDEV(Scripts, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 123,
			columnNumber: 9
		}, this)] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 121,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 117,
		columnNumber: 5
	}, this);
}
function RootComponent() {
	const { queryClient } = Route$22.useRouteContext();
	return /* @__PURE__ */ jsxDEV(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 135,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 133,
		columnNumber: 5
	}, this);
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$21 = () => import("./routes-Ci0hnwc9.js");
var Route$21 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Brasiltec | Venda produtos digitais com estrutura profissional" },
		{
			name: "description",
			content: "Checkout, área de membros, vendas e financeiro em um só lugar. Pagamentos via PIX, cartão e transferência para creators no Brasil."
		},
		{
			property: "og:title",
			content: "Brasiltec | Plataforma para creators digitais"
		},
		{
			property: "og:description",
			content: "Da oferta ao recebimento: checkout claro, PIX e operação organizada."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
//#endregion
//#region src/routes/admin.tsx
var $$splitComponentImporter$20 = () => import("./admin-CmPu2iX9.js");
var Route$20 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
//#endregion
//#region src/routes/afiliados.tsx
var $$splitComponentImporter$19 = () => import("./afiliados-DR-Raxhu.js");
var Route$19 = createFileRoute("/afiliados")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
//#endregion
//#region src/routes/cadastro.tsx
var $$splitComponentImporter$18 = () => import("./cadastro-oI2XL6OY.js");
var Route$18 = createFileRoute("/cadastro")({
	head: () => ({ meta: [
		{ title: "Criar conta | Brasiltec" },
		{
			name: "description",
			content: "Crie sua conta Brasiltec e comece a vender produtos digitais com checkout e pagamentos locais."
		},
		{
			property: "og:title",
			content: "Criar conta na Brasiltec"
		},
		{
			property: "og:description",
			content: "Nome, email e senha para iniciar sua operação na plataforma."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
//#endregion
//#region src/routes/checkout.tsx
var $$splitComponentImporter$17 = () => import("./checkout-Cu1tpMkS.js");
var Route$17 = createFileRoute("/checkout")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
//#endregion
//#region src/routes/como-funciona.tsx
var $$splitComponentImporter$16 = () => import("./como-funciona-Dwqp5bm1.js");
var Route$16 = createFileRoute("/como-funciona")({
	head: () => ({ meta: [
		{ title: "Como funciona | Brasiltec" },
		{
			name: "description",
			content: "A jornada completa do produtor ao saque: aquisição, publicação, compra, liberação automática e retirada do saldo."
		},
		{
			property: "og:title",
			content: "Como funciona a Brasiltec"
		},
		{
			property: "og:description",
			content: "Fluxo completo do produtor ao saque, passo a passo."
		},
		{
			property: "og:type",
			content: "article"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
//#endregion
//#region src/routes/financeiro.tsx
var $$splitComponentImporter$15 = () => import("./financeiro-Bh_l9S0H.js");
var Route$15 = createFileRoute("/financeiro")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
//#endregion
//#region src/routes/login.tsx
var $$splitComponentImporter$14 = () => import("./login-B3irAznS.js");
var Route$14 = createFileRoute("/login")({
	head: () => ({ meta: [
		{ title: "Entrar | Brasiltec" },
		{
			name: "description",
			content: "Acesse o painel Brasiltec para acompanhar vendas, clientes e financeiro."
		},
		{
			property: "og:title",
			content: "Entrar na Brasiltec"
		},
		{
			property: "og:description",
			content: "Acesse sua conta e continue de onde parou."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
//#endregion
//#region src/routes/marketplace.tsx
var $$splitComponentImporter$13 = () => import("./marketplace-DJRy33Qw.js");
var Route$13 = createFileRoute("/marketplace")({
	head: () => ({ meta: [
		{ title: "Marketplace | Brasiltec" },
		{
			name: "description",
			content: "Descubra produtos digitais dos criadores da Brasiltec: cursos, mentorias e materiais com garantia."
		},
		{
			property: "og:title",
			content: "Marketplace Brasiltec"
		},
		{
			property: "og:description",
			content: "Produtos digitais disponíveis dos nossos criadores."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
//#endregion
//#region src/routes/membros.tsx
var $$splitComponentImporter$12 = () => import("./membros-Be1_mP7_.js");
var Route$12 = createFileRoute("/membros")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
//#endregion
//#region src/routes/notificacoes.tsx
var $$splitComponentImporter$11 = () => import("./notificacoes-Drigpa-o.js");
var Route$11 = createFileRoute("/notificacoes")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
//#endregion
//#region src/routes/painel.tsx
var $$splitComponentImporter$10 = () => import("./painel-CiKdEelU.js");
var Route$10 = createFileRoute("/painel")({
	head: () => ({ meta: [
		{ title: "Painel | Brasiltec" },
		{
			name: "description",
			content: "Resumo inicial da sua conta Brasiltec após o login."
		},
		{
			property: "og:title",
			content: "Painel Brasiltec"
		},
		{
			property: "og:description",
			content: "Resumo da conta após entrar na plataforma."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
//#endregion
//#region src/routes/pedidos.tsx
var $$splitComponentImporter$9 = () => import("./pedidos-DJK3gmk8.js");
var Route$9 = createFileRoute("/pedidos")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
//#endregion
//#region src/routes/planos.tsx
var $$splitComponentImporter$8 = () => import("./planos-BaDDfvoo.js");
var Route$8 = createFileRoute("/planos")({
	head: () => ({ meta: [
		{ title: "Planos | Brasiltec" },
		{
			name: "description",
			content: "Starter, Pro e Scale: escolha o nível de estrutura ideal para o momento da sua operação digital."
		},
		{
			property: "og:title",
			content: "Planos Brasiltec"
		},
		{
			property: "og:description",
			content: "Planos para cada fase da sua operação, sem fidelidade."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
//#endregion
//#region src/routes/produtos.tsx
var $$splitComponentImporter$7 = () => import("./produtos-BgU1OMUK.js");
var Route$7 = createFileRoute("/produtos")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
//#endregion
//#region src/routes/recuperar-senha.tsx
var $$splitComponentImporter$6 = () => import("./recuperar-senha-B0YRLW0C.js");
var Route$6 = createFileRoute("/recuperar-senha")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
//#endregion
//#region src/routes/redefinir-senha.tsx
var $$splitComponentImporter$5 = () => import("./redefinir-senha-DH06AViG.js");
var Route$5 = createFileRoute("/redefinir-senha")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
//#endregion
//#region src/routes/suporte.tsx
var $$splitComponentImporter$4 = () => import("./suporte-BSqLusRE.js");
var Route$4 = createFileRoute("/suporte")({
	head: () => ({ meta: [
		{ title: "Suporte | Brasiltec" },
		{
			name: "description",
			content: "Atendimento humano 24/7 para checkout, saques, integrações e dúvidas operacionais da sua conta."
		},
		{
			property: "og:title",
			content: "Suporte Brasiltec"
		},
		{
			property: "og:description",
			content: "Abra um chamado e fale com a equipe por email, WhatsApp ou chat."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/suporte-DESKTOP-OKH3ILH.tsx
var $$splitComponentImporter$3 = () => import("./suporte-DESKTOP-OKH3ILH-B0lSB_Wm.js");
var Route$3 = createFileRoute("/suporte-DESKTOP-OKH3ILH")({
	head: () => ({ meta: [
		{ title: "Suporte | Brasiltec" },
		{
			name: "description",
			content: "Atendimento humano 24/7 para checkout, saques, integrações e dúvidas operacionais da sua conta."
		},
		{
			property: "og:title",
			content: "Suporte Brasiltec"
		},
		{
			property: "og:description",
			content: "Abra um chamado e fale com a equipe por email, WhatsApp ou chat."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/cadastro.confirmacao.tsx
var $$splitComponentImporter$2 = () => import("./cadastro.confirmacao-DUjMZUFp.js");
var Route$2 = createFileRoute("/cadastro/confirmacao")({
	head: () => ({ meta: [
		{ title: "Cadastro concluído | Brasiltec" },
		{
			name: "description",
			content: "Seu cadastro foi recebido e a próxima etapa da conta está pronta para ser acessada."
		},
		{
			property: "og:title",
			content: "Cadastro concluído na Brasiltec"
		},
		{
			property: "og:description",
			content: "Confirmação da criação da conta e próximos passos."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/marketplace.$productId.tsx
var $$splitComponentImporter$1 = () => import("./marketplace._productId-Mw2iKkYC.js");
var Route$1 = createFileRoute("/marketplace/$productId")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
//#endregion
//#region src/routes/produtos.novo.tsx
var $$splitComponentImporter = () => import("./produtos.novo-DaditOe5.js");
var Route = createFileRoute("/produtos/novo")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$21.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$22
});
var AdminRoute = Route$20.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$22
});
var AfiliadosRoute = Route$19.update({
	id: "/afiliados",
	path: "/afiliados",
	getParentRoute: () => Route$22
});
var CadastroRoute = Route$18.update({
	id: "/cadastro",
	path: "/cadastro",
	getParentRoute: () => Route$22
});
var CheckoutRoute = Route$17.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$22
});
var ComoFuncionaRoute = Route$16.update({
	id: "/como-funciona",
	path: "/como-funciona",
	getParentRoute: () => Route$22
});
var FinanceiroRoute = Route$15.update({
	id: "/financeiro",
	path: "/financeiro",
	getParentRoute: () => Route$22
});
var LoginRoute = Route$14.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$22
});
var MarketplaceRoute = Route$13.update({
	id: "/marketplace",
	path: "/marketplace",
	getParentRoute: () => Route$22
});
var MembrosRoute = Route$12.update({
	id: "/membros",
	path: "/membros",
	getParentRoute: () => Route$22
});
var NotificacoesRoute = Route$11.update({
	id: "/notificacoes",
	path: "/notificacoes",
	getParentRoute: () => Route$22
});
var PainelRoute = Route$10.update({
	id: "/painel",
	path: "/painel",
	getParentRoute: () => Route$22
});
var PedidosRoute = Route$9.update({
	id: "/pedidos",
	path: "/pedidos",
	getParentRoute: () => Route$22
});
var PlanosRoute = Route$8.update({
	id: "/planos",
	path: "/planos",
	getParentRoute: () => Route$22
});
var ProdutosRoute = Route$7.update({
	id: "/produtos",
	path: "/produtos",
	getParentRoute: () => Route$22
});
var RecuperarSenhaRoute = Route$6.update({
	id: "/recuperar-senha",
	path: "/recuperar-senha",
	getParentRoute: () => Route$22
});
var RedefinirSenhaRoute = Route$5.update({
	id: "/redefinir-senha",
	path: "/redefinir-senha",
	getParentRoute: () => Route$22
});
var SuporteRoute = Route$4.update({
	id: "/suporte",
	path: "/suporte",
	getParentRoute: () => Route$22
});
var SuporteDESKTOPOKH3ILHRoute = Route$3.update({
	id: "/suporte-DESKTOP-OKH3ILH",
	path: "/suporte-DESKTOP-OKH3ILH",
	getParentRoute: () => Route$22
});
var CadastroConfirmacaoRoute = Route$2.update({
	id: "/confirmacao",
	path: "/confirmacao",
	getParentRoute: () => CadastroRoute
});
var MarketplaceProductIdRoute = Route$1.update({
	id: "/$productId",
	path: "/$productId",
	getParentRoute: () => MarketplaceRoute
});
var ProdutosNovoRoute = Route.update({
	id: "/novo",
	path: "/novo",
	getParentRoute: () => ProdutosRoute
});
var CadastroRouteChildren = { CadastroConfirmacaoRoute };
var CadastroRouteWithChildren = CadastroRoute._addFileChildren(CadastroRouteChildren);
var MarketplaceRouteChildren = { MarketplaceProductIdRoute };
var MarketplaceRouteWithChildren = MarketplaceRoute._addFileChildren(MarketplaceRouteChildren);
var ProdutosRouteChildren = { ProdutosNovoRoute };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	AfiliadosRoute,
	CadastroRoute: CadastroRouteWithChildren,
	CheckoutRoute,
	ComoFuncionaRoute,
	FinanceiroRoute,
	LoginRoute,
	MarketplaceRoute: MarketplaceRouteWithChildren,
	MembrosRoute,
	NotificacoesRoute,
	PainelRoute,
	PedidosRoute,
	PlanosRoute,
	ProdutosRoute: ProdutosRoute._addFileChildren(ProdutosRouteChildren),
	RecuperarSenhaRoute,
	RedefinirSenhaRoute,
	SuporteRoute,
	SuporteDESKTOPOKH3ILHRoute
};
var routeTree = Route$22._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter, Route$1 as n, router_exports as t };
