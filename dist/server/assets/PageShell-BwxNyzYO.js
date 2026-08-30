import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./server-tAK7xnTK.js";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { z } from "zod";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/auth-server.ts
var businessTypes = [
	"Produtor digital",
	"Infoprodutor",
	"Afiliado",
	"Agência",
	"E-commerce",
	"Serviços"
];
var registerSchema = z.object({
	name: z.string().trim().min(3),
	email: z.string().trim().email(),
	password: z.string().min(8),
	businessType: z.enum(businessTypes)
});
var loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1)
});
var googleAuthSchema = z.object({
	credential: z.string().trim().min(20),
	businessType: z.enum(businessTypes).optional()
});
var forgotPasswordSchema = z.object({ email: z.string().trim().email() });
var supportContactSchema = z.object({
	name: z.string().trim().min(2).max(120),
	senderEmail: z.string().trim().email(),
	recipientEmail: z.string().trim().email().optional(),
	subject: z.string().trim().min(3).max(160),
	message: z.string().trim().min(10).max(4e3)
});
var resetPasswordSchema = z.object({
	token: z.string().trim().min(12),
	password: z.string().min(8)
});
var createProductSchema = z.object({
	name: z.string().trim().min(3),
	description: z.string().trim().min(10),
	category: z.string().trim().min(2),
	priceCents: z.number().int().positive()
});
var publishProductSchema = z.object({ productId: z.string().trim().min(6) });
var buyProductSchema = z.object({
	productId: z.string().trim().min(6),
	paymentMethod: z.enum([
		"PIX",
		"Cartão",
		"Transferência",
		"Boleto"
	])
});
var transitionOrderSchema = z.object({
	orderId: z.string().trim().min(6),
	status: z.enum([
		"approved",
		"declined",
		"refunded"
	])
});
var orderTimelineSchema = z.object({ orderId: z.string().trim().min(6) });
var learningTrackSchema = z.object({ productId: z.string().trim().min(6) });
var lessonProgressSchema = z.object({
	lessonId: z.string().trim().min(6),
	completed: z.boolean()
});
var orderFiltersSchema = z.object({
	status: z.enum([
		"pending",
		"approved",
		"declined",
		"refunded"
	]).optional(),
	productId: z.string().trim().min(6).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var marketplaceProductSchema = z.object({ productId: z.string().trim().min(6) });
var requestWithdrawalSchema = z.object({
	amountCents: z.number().int().positive(),
	method: z.string().trim().min(2)
});
var readNotificationSchema = z.object({ notificationId: z.string().trim().min(6) });
var adminModerationQuerySchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
	status: z.enum([
		"pending_review",
		"approved",
		"rejected"
	]).optional(),
	category: z.string().trim().min(2).max(60).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var adminModerationAuditQuerySchema = z.object({ limit: z.number().int().min(1).max(100).optional() });
var adminConsolidatedAuditQuerySchema = z.object({
	limit: z.number().int().min(1).max(200).optional(),
	eventType: z.enum([
		"moderation",
		"rbac",
		"platform_setting"
	]).optional(),
	actorQuery: z.string().trim().min(2).max(120).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var adminRoleDirectoryQuerySchema = z.object({ limit: z.number().int().min(1).max(100).optional() });
var adminRoleAuditQuerySchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
	userQuery: z.string().trim().min(2).max(120).optional(),
	action: z.enum([
		"grant",
		"revoke",
		"change",
		"promote_admin",
		"demote_admin"
	]).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var adminRoleAssignmentSchema = z.object({
	userId: z.string().trim().min(6),
	role: z.enum([
		"none",
		"viewer",
		"moderator",
		"admin"
	]),
	confirmAdminPromotion: z.boolean().optional(),
	approvalNote: z.string().trim().max(300).optional()
});
var adminPlatformSettingsQuerySchema = z.object({ limit: z.number().int().min(1).max(200).optional() });
var adminPaymentOpsQuerySchema = z.object({
	hours: z.number().int().min(1).max(168).optional(),
	failureLimit: z.number().int().min(1).max(50).optional()
});
var adminPaymentReconcileSchema = z.object({
	limit: z.number().int().min(1).max(300).optional(),
	minOrderAgeMinutes: z.number().int().min(0).max(1440).optional()
});
var adminPlatformSettingUpsertSchema = z.object({
	key: z.string().trim().min(3).max(80).regex(/^[a-z0-9._-]+$/i, "Chave inválida. Use letras, números, ponto, traço e underscore."),
	value: z.string().trim().min(1).max(500)
});
var adminModerationDecisionSchema = z.object({
	productId: z.string().trim().min(6),
	decision: z.enum(["approve", "reject"]),
	reason: z.string().trim().max(300).optional()
}).superRefine((value, ctx) => {
	if (value.decision === "reject" && (!value.reason || value.reason.length < 5)) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "Informe um motivo de ao menos 5 caracteres para rejeição.",
		path: ["reason"]
	});
});
var getAffiliateData = createServerFn({ method: "POST" }).handler(createSsrRpc("854c73f62a4c43852f85afee953926ba583d74c1528c329724dafd8fbdf67234"));
var requestAffiliateAccess = createServerFn({ method: "POST" }).handler(createSsrRpc("a226a97c19f5a30e04f818435855e43e1e7deb1372fa8d1e94483781ac028652"));
var registerUser = createServerFn({ method: "POST" }).validator(registerSchema).handler(createSsrRpc("4d1d34dc6a91e3222a939cc075b9fe93fea00d1ceffb53e140cddca37186d90d"));
var loginUser = createServerFn({ method: "POST" }).validator(loginSchema).handler(createSsrRpc("66dab1fbf4d0d34f2e91194f8b4ed914776b0e841615aa896487eb6bc704f891"));
var authenticateWithGoogle = createServerFn({ method: "POST" }).validator(googleAuthSchema).handler(createSsrRpc("36c7f2958d478ec7b9baa9295de1be7aed3804f7c075c5cee7b54d211501e3d0"));
var getSessionData = createServerFn({ method: "POST" }).handler(createSsrRpc("8a6eaf16395b89224a24a18abd7e0946e19577f54cf86351d3b9687d9c475e46"));
var logoutUser = createServerFn({ method: "POST" }).handler(createSsrRpc("4a6e4879b0aa3e1be65ec8f9752065dd970b9ffff5081dc8a7d17774a4483ca0"));
var requestPasswordResetEmail = createServerFn({ method: "POST" }).validator(forgotPasswordSchema).handler(createSsrRpc("cac436954c5cc72954c133864be2d59f1a400e37b882d5d3c51116caa70c488e"));
var sendSupportContactEmail = createServerFn({ method: "POST" }).validator(supportContactSchema).handler(createSsrRpc("0a0eeb62c2b34d998d5968be0b1a9bf6665ae66ed4733b714bdf2e076cfb9df8"));
var resetPasswordByToken = createServerFn({ method: "POST" }).validator(resetPasswordSchema).handler(createSsrRpc("eaacb9145f9d0c5f89098ff738c639a9be02b80d002239f0b828b59ce15e3351"));
var getDashboardData = createServerFn({ method: "POST" }).handler(createSsrRpc("03a7fd167e548f02dc77a992113fe2e2bfedf936075b04da72a5f269cc9ee8ad"));
var getAdminData = createServerFn({ method: "POST" }).handler(createSsrRpc("2184971d323bfe6364cb1b515ca85aaf15b4cd391db0a7228645245547a5c786"));
var getAdminPaymentOpsData = createServerFn({ method: "POST" }).validator(adminPaymentOpsQuerySchema.optional()).handler(createSsrRpc("910d5406afa57021507d84e91d0817feccb0562fd50fc0540d1cd5122973d87c"));
var runAdminPaymentReconciliationData = createServerFn({ method: "POST" }).validator(adminPaymentReconcileSchema.optional()).handler(createSsrRpc("346190d43ad6a24941195587f8506962e5d08bc13f3ac57fd8b6aed382f01f11"));
var getAdminAccessData = createServerFn({ method: "POST" }).handler(createSsrRpc("412928fe10585166b11009df59e45bf52fd0e1c7622efc9c7f0f9fc09ab91c56"));
var getAdminRoleDirectoryData = createServerFn({ method: "POST" }).validator(adminRoleDirectoryQuerySchema.optional()).handler(createSsrRpc("38565f75d65462d1380a8815ee8ca79f7bbc32abcb0e9f60b3722dbcd5495fae"));
var getPlatformSettingsData = createServerFn({ method: "POST" }).validator(adminPlatformSettingsQuerySchema.optional()).handler(createSsrRpc("dffb32a53678c57ec2cc46855d0dfb8faf96a13e4c7d109926ca3590b801b773"));
var updatePlatformSettingData = createServerFn({ method: "POST" }).validator(adminPlatformSettingUpsertSchema).handler(createSsrRpc("5cee0d4be6b22659af1f699e4624972c1b3c190be1031086fefe8e8aa7fee8c8"));
var getAdminRoleAuditData = createServerFn({ method: "POST" }).validator(adminRoleAuditQuerySchema.optional()).handler(createSsrRpc("77a962dd5e4b5314ebd8a39628bce8bbce4be3773ad2af56d7d589d2a323b1ba"));
var assignAdminUserRoleData = createServerFn({ method: "POST" }).validator(adminRoleAssignmentSchema).handler(createSsrRpc("6a37b87897435a5b68f1a2fa4daa92f08e0a53859e5ecce144de8ae94e2a502f"));
var getAdminModerationQueueData = createServerFn({ method: "POST" }).validator(adminModerationQuerySchema.optional()).handler(createSsrRpc("aa1c6a22631cd1a71b1e742b98f177561413f66806055cc43b4e331c5296e6ce"));
var getAdminModerationAuditData = createServerFn({ method: "POST" }).validator(adminModerationAuditQuerySchema.optional()).handler(createSsrRpc("b0d2be773660da164e82b03ba275e2018adb433e3e3eafc4bd9fabc081b51490"));
var getAdminConsolidatedAuditData = createServerFn({ method: "POST" }).validator(adminConsolidatedAuditQuerySchema.optional()).handler(createSsrRpc("3aa4a15ee0898ae0990c22512f51da3e029219b79a45a4af16eefdf3de0e0be6"));
var moderateAdminProductDecision = createServerFn({ method: "POST" }).validator(adminModerationDecisionSchema).handler(createSsrRpc("1d7eb6cd6c86c504d9417d8e2b07a3c9e4b1f7fe84a3f6af32dc5ddd1d3061ca"));
var createProductDraft = createServerFn({ method: "POST" }).validator(createProductSchema).handler(createSsrRpc("dfcf4f7c914a79e0c2004943b9a124817f977c6834a742332d5248de21c2f6d4"));
var publishProductById = createServerFn({ method: "POST" }).validator(publishProductSchema).handler(createSsrRpc("f29f14505ce315f6f2da677de9262e129d7558089ff84929276123488383a35c"));
var getMyProducts = createServerFn({ method: "POST" }).handler(createSsrRpc("bb04bcc919dd858b2e077e06193267330d73c00b1498ac0767b2fe98ca54f6c5"));
var getMarketplaceProducts = createServerFn({ method: "POST" }).handler(createSsrRpc("4f739a006f4d41812466f555d1466b83b651afac4a0ed656f8e89066eff88311"));
var getMarketplaceProductDetails = createServerFn({ method: "POST" }).validator(marketplaceProductSchema).handler(createSsrRpc("a1af91ad6018682ec2e847f7fcfc695b27b58c9bbe20014c5560ec39ddd52ed7"));
createServerFn({ method: "POST" }).validator(buyProductSchema).handler(createSsrRpc("6083e5d695652a4a423dc2af18c0a17263f38bb8d6aa42bd877265bf36f0be89"));
var createMarketplaceCheckoutOrder = createServerFn({ method: "POST" }).validator(buyProductSchema).handler(createSsrRpc("b5b171850086b95ae7ef9b2ed80035372546e764864664239f6a619a5e020ff8"));
var transitionMarketplaceOrderStatus = createServerFn({ method: "POST" }).validator(transitionOrderSchema).handler(createSsrRpc("fb28a54735ec8897e342ce7379c0c9f154c3c16970a4c7583ac8d6cb3f2677aa"));
var getMyOrders = createServerFn({ method: "POST" }).validator(orderFiltersSchema.optional()).handler(createSsrRpc("033e00a352ae3c6903309220eeeddf5485ba136aef3dfbfa43f846e422a227be"));
var getMyOrderTimeline = createServerFn({ method: "POST" }).validator(orderTimelineSchema).handler(createSsrRpc("e20bd12798bd94dc5122d6135a1287c852d17e83332a127a1edbd7dc4c84a98e"));
var getMyLearningTrack = createServerFn({ method: "POST" }).validator(learningTrackSchema).handler(createSsrRpc("0616dae5d3780b6651b60060046adcc5a84a4924ae8131724ba7ac693b631c6b"));
var setLessonProgress = createServerFn({ method: "POST" }).validator(lessonProgressSchema).handler(createSsrRpc("9dadd49073bf73c47d4428a63efe88fcf16b7dc1523907d23628804ef7950605"));
var getMyEnrollments = createServerFn({ method: "POST" }).handler(createSsrRpc("e4f75f33f6e32df4bbef8724cb6434da31731702c3e7ace50d5f86cbe0729fcb"));
var getFinanceData = createServerFn({ method: "POST" }).handler(createSsrRpc("5d35e3ec0270887b318dfe5f2be29d41409f131f30f1e902000e46c1722b243a"));
var createWithdrawalRequest = createServerFn({ method: "POST" }).validator(requestWithdrawalSchema).handler(createSsrRpc("f631447be702ee9616ee0512a586732d2bbe83c7b398bcc22129a13f8696e7d3"));
var getMyNotificationsData = createServerFn({ method: "POST" }).handler(createSsrRpc("b5bc40e373756ac89440c29757423d108e298f6cf4e836681b3095fd6072e8f3"));
var readMyNotification = createServerFn({ method: "POST" }).validator(readNotificationSchema).handler(createSsrRpc("91e4fcd5e3fb6d1c7b76fad3744f90efd6d0adec552e0d77ea633beb1031f543"));
var readAllMyNotifications = createServerFn({ method: "POST" }).handler(createSsrRpc("638731b486d455118e8446c733b64a10bb7648ee1eaf95d1784d71507e830468"));
//#endregion
//#region src/components/site/SiteHeader.tsx
var _jsxFileName$2 = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/components/site/SiteHeader.tsx";
var nav = [
	{
		to: "/como-funciona",
		label: "Como funciona"
	},
	{
		to: "/planos",
		label: "Planos"
	},
	{
		to: "/marketplace",
		label: "Marketplace"
	},
	{
		to: "/suporte",
		label: "Suporte"
	}
];
var dashboardRoutes$1 = [
	"/painel",
	"/admin",
	"/produtos",
	"/pedidos",
	"/membros",
	"/financeiro",
	"/afiliados",
	"/notificacoes",
	"/suporte"
];
function SiteHeader() {
	const [open, setOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isDashboardArea = dashboardRoutes$1.some((route) => pathname === route || pathname.startsWith(`${route}/`));
	useEffect(() => {
		if (!isDashboardArea) {
			setUnreadCount(0);
			return;
		}
		getMyNotificationsData().then((items) => {
			setUnreadCount((Array.isArray(items) ? items : []).filter((item) => !item.readAt).length);
		}).catch(() => {
			setUnreadCount(0);
		});
	}, [isDashboardArea, pathname]);
	return /* @__PURE__ */ jsxDEV("header", {
		className: "sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl",
		children: [/* @__PURE__ */ jsxDEV("div", {
			className: "container-page flex h-16 items-center justify-between gap-4",
			children: [
				/* @__PURE__ */ jsxDEV(Link, {
					to: "/",
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsxDEV("span", {
						className: "grid size-9 place-items-center rounded-xl font-display text-base font-bold text-primary-foreground",
						style: { backgroundImage: "var(--gradient-primary)" },
						children: "B"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 43,
						columnNumber: 11
					}, this), /* @__PURE__ */ jsxDEV("span", {
						className: "font-display text-lg font-semibold tracking-tight",
						children: "Brasiltec"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 49,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$2,
					lineNumber: 42,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: nav.map((item) => /* @__PURE__ */ jsxDEV(Link, {
						to: item.to,
						className: "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
						activeProps: { className: "text-foreground bg-surface-2" },
						children: item.label
					}, item.to, false, {
						fileName: _jsxFileName$2,
						lineNumber: 54,
						columnNumber: 13
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$2,
					lineNumber: 52,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "hidden items-center gap-2 md:flex",
					children: isDashboardArea ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/notificacoes",
							className: "btn-base btn-ghost",
							children: ["Notificações", unreadCount > 0 ? ` (${unreadCount})` : ""]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 68,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/painel",
							className: "btn-base btn-ghost",
							children: "Painel"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 71,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/produtos/novo",
							className: "btn-base btn-primary",
							children: "Criar produto"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 74,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("button", {
							type: "button",
							onClick: () => logoutUser().then(() => window.location.assign("/login")),
							className: "btn-base btn-ghost",
							children: "Sair"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 77,
							columnNumber: 15
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 67,
						columnNumber: 13
					}, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/login",
						className: "btn-base btn-ghost",
						children: "Entrar"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 87,
						columnNumber: 15
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/cadastro",
						className: "btn-base btn-primary",
						children: "Criar conta"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 90,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 86,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$2,
					lineNumber: 65,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ jsxDEV("button", {
					type: "button",
					"aria-label": "Abrir menu",
					"aria-expanded": open,
					onClick: () => setOpen((v) => !v),
					className: "btn-base btn-ghost px-3 py-2 md:hidden",
					children: /* @__PURE__ */ jsxDEV("span", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ jsxDEV("span", { className: "block h-0.5 w-4 rounded bg-current" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 105,
							columnNumber: 13
						}, this), /* @__PURE__ */ jsxDEV("span", { className: "block h-0.5 w-4 rounded bg-current" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 106,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 104,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$2,
					lineNumber: 97,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$2,
			lineNumber: 41,
			columnNumber: 7
		}, this), open ? /* @__PURE__ */ jsxDEV("div", {
			className: "border-t border-border md:hidden",
			children: /* @__PURE__ */ jsxDEV("div", {
				className: "container-page flex flex-col gap-1 py-3",
				children: [nav.map((item) => /* @__PURE__ */ jsxDEV(Link, {
					to: item.to,
					onClick: () => setOpen(false),
					className: "rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground",
					children: item.label
				}, item.to, false, {
					fileName: _jsxFileName$2,
					lineNumber: 115,
					columnNumber: 15
				}, this)), /* @__PURE__ */ jsxDEV("div", {
					className: "mt-2 flex gap-2",
					children: isDashboardArea ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/notificacoes",
							onClick: () => setOpen(false),
							className: "btn-base btn-ghost flex-1",
							children: ["Notificações", unreadCount > 0 ? ` (${unreadCount})` : ""]
						}, void 0, true, {
							fileName: _jsxFileName$2,
							lineNumber: 127,
							columnNumber: 19
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/painel",
							onClick: () => setOpen(false),
							className: "btn-base btn-ghost flex-1",
							children: "Painel"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 130,
							columnNumber: 19
						}, this),
						/* @__PURE__ */ jsxDEV(Link, {
							to: "/produtos/novo",
							onClick: () => setOpen(false),
							className: "btn-base btn-primary flex-1",
							children: "Criar produto"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 133,
							columnNumber: 19
						}, this),
						/* @__PURE__ */ jsxDEV("button", {
							type: "button",
							onClick: () => {
								setOpen(false);
								logoutUser().then(() => window.location.assign("/login"));
							},
							className: "btn-base btn-ghost flex-1",
							children: "Sair"
						}, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 136,
							columnNumber: 19
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 126,
						columnNumber: 17
					}, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/login",
						onClick: () => setOpen(false),
						className: "btn-base btn-ghost flex-1",
						children: "Entrar"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 149,
						columnNumber: 19
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/cadastro",
						onClick: () => setOpen(false),
						className: "btn-base btn-primary flex-1",
						children: "Criar conta"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 152,
						columnNumber: 19
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 148,
						columnNumber: 17
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$2,
					lineNumber: 124,
					columnNumber: 13
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$2,
				lineNumber: 113,
				columnNumber: 11
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$2,
			lineNumber: 112,
			columnNumber: 9
		}, this) : null]
	}, void 0, true, {
		fileName: _jsxFileName$2,
		lineNumber: 40,
		columnNumber: 5
	}, this);
}
//#endregion
//#region src/components/site/SiteFooter.tsx
var _jsxFileName$1 = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/components/site/SiteFooter.tsx";
function SiteFooter() {
	return /* @__PURE__ */ jsxDEV("footer", {
		className: "mt-24 border-t border-border/70 py-10",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between",
			children: [/* @__PURE__ */ jsxDEV("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsxDEV("span", {
					className: "grid size-8 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground",
					style: { backgroundImage: "var(--gradient-primary)" },
					children: "B"
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 8,
					columnNumber: 11
				}, this), /* @__PURE__ */ jsxDEV("p", {
					className: "text-sm text-muted-foreground",
					children: "Brasiltec © 2026. Plataforma de vendas digitais para creators e negócios."
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 14,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$1,
				lineNumber: 7,
				columnNumber: 9
			}, this), /* @__PURE__ */ jsxDEV("nav", {
				className: "flex flex-wrap gap-x-6 gap-y-2 text-sm",
				children: [
					/* @__PURE__ */ jsxDEV(Link, {
						to: "/planos",
						className: "text-muted-foreground transition-colors hover:text-primary",
						children: "Planos"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 19,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV(Link, {
						to: "/marketplace",
						className: "text-muted-foreground transition-colors hover:text-primary",
						children: "Marketplace"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 22,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV(Link, {
						to: "/suporte",
						className: "text-muted-foreground transition-colors hover:text-primary",
						children: "Suporte"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 25,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ jsxDEV(Link, {
						to: "/como-funciona",
						className: "text-muted-foreground transition-colors hover:text-primary",
						children: "Como funciona"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 28,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$1,
				lineNumber: 18,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 6,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 5,
		columnNumber: 5
	}, this);
}
//#endregion
//#region src/components/site/PageShell.tsx
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/components/site/PageShell.tsx";
var dashboardRoutes = [
	"/painel",
	"/admin",
	"/produtos",
	"/pedidos",
	"/membros",
	"/financeiro",
	"/afiliados",
	"/notificacoes",
	"/suporte"
];
var dashboardNav = [
	{
		to: "/painel",
		label: "Painel"
	},
	{
		to: "/admin",
		label: "Admin"
	},
	{
		to: "/produtos",
		label: "Produtos"
	},
	{
		to: "/pedidos",
		label: "Pedidos"
	},
	{
		to: "/membros",
		label: "Membros"
	},
	{
		to: "/financeiro",
		label: "Financeiro"
	},
	{
		to: "/afiliados",
		label: "Afiliados"
	},
	{
		to: "/notificacoes",
		label: "Notificações"
	},
	{
		to: "/suporte",
		label: "Suporte"
	}
];
function PageShell({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isDashboardArea = dashboardRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
	return /* @__PURE__ */ jsxDEV("div", {
		className: "page-shell flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ jsxDEV(SiteHeader, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 30,
				columnNumber: 7
			}, this),
			isDashboardArea ? /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV("div", {
				className: "border-b border-border/60 bg-background/70 md:hidden",
				children: /* @__PURE__ */ jsxDEV("div", {
					className: "container-page flex gap-2 overflow-x-auto py-3",
					children: dashboardNav.map((item) => /* @__PURE__ */ jsxDEV(Link, {
						to: item.to,
						className: "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
						activeProps: { className: "bg-surface-2 text-foreground" },
						children: item.label
					}, item.to, false, {
						fileName: _jsxFileName,
						lineNumber: 37,
						columnNumber: 17
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 35,
					columnNumber: 13
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 34,
				columnNumber: 11
			}, this), /* @__PURE__ */ jsxDEV("main", {
				className: "container-page flex w-full flex-1 gap-6 py-6 lg:gap-8 lg:py-8",
				children: [/* @__PURE__ */ jsxDEV("aside", {
					className: "sticky top-20 hidden h-fit w-56 shrink-0 rounded-2xl border border-border/60 bg-background/70 p-3 md:block",
					children: [
						/* @__PURE__ */ jsxDEV("p", {
							className: "px-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground",
							children: "Navegação"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 51,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("nav", {
							className: "grid gap-1",
							children: dashboardNav.map((item) => /* @__PURE__ */ jsxDEV(Link, {
								to: item.to,
								className: "rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
								activeProps: { className: "bg-surface-2 text-foreground" },
								children: item.label
							}, item.to, false, {
								fileName: _jsxFileName,
								lineNumber: 54,
								columnNumber: 19
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 52,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ jsxDEV("div", {
							className: "mt-3 border-t border-border/60 pt-3",
							children: /* @__PURE__ */ jsxDEV("button", {
								type: "button",
								onClick: () => logoutUser().then(() => window.location.assign("/login")),
								className: "w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
								children: "Sair"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 65,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 64,
							columnNumber: 15
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 50,
					columnNumber: 13
				}, this), /* @__PURE__ */ jsxDEV("div", {
					className: "min-w-0 flex-1",
					children
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 75,
					columnNumber: 13
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 49,
				columnNumber: 11
			}, this)] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 33,
				columnNumber: 9
			}, this) : /* @__PURE__ */ jsxDEV("main", {
				className: "flex-1",
				children
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 79,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ jsxDEV(SiteFooter, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 82,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 29,
		columnNumber: 5
	}, this);
}
function PageHeader({ eyebrow, title, description, actions }) {
	return /* @__PURE__ */ jsxDEV("section", {
		className: "container-page pt-14 pb-10 md:pt-20",
		children: [
			/* @__PURE__ */ jsxDEV("span", {
				className: "eyebrow",
				children: eyebrow
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 100,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ jsxDEV("h1", {
				className: "mt-4 max-w-3xl text-4xl leading-[1.05] md:text-5xl",
				children: title
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 101,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ jsxDEV("p", {
				className: "mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
				children: description
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 102,
				columnNumber: 7
			}, this),
			actions ? /* @__PURE__ */ jsxDEV("div", {
				className: "mt-7 flex flex-wrap gap-3",
				children: actions
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 103,
				columnNumber: 18
			}, this) : null
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 99,
		columnNumber: 5
	}, this);
}
//#endregion
export { logoutUser as A, sendSupportContactEmail as B, getMyNotificationsData as C, getPlatformSettingsData as D, getMyProducts as E, registerUser as F, transitionMarketplaceOrderStatus as H, requestAffiliateAccess as I, requestPasswordResetEmail as L, publishProductById as M, readAllMyNotifications as N, getSessionData as O, readMyNotification as P, resetPasswordByToken as R, getMyLearningTrack as S, getMyOrders as T, updatePlatformSettingData as U, setLessonProgress as V, getDashboardData as _, createMarketplaceCheckoutOrder as a, getMarketplaceProducts as b, getAdminAccessData as c, getAdminModerationAuditData as d, getAdminModerationQueueData as f, getAffiliateData as g, getAdminRoleDirectoryData as h, authenticateWithGoogle as i, moderateAdminProductDecision as j, loginUser as k, getAdminConsolidatedAuditData as l, getAdminRoleAuditData as m, PageShell as n, createProductDraft as o, getAdminPaymentOpsData as p, assignAdminUserRoleData as r, createWithdrawalRequest as s, PageHeader as t, getAdminData as u, getFinanceData as v, getMyOrderTimeline as w, getMyEnrollments as x, getMarketplaceProductDetails as y, runAdminPaymentReconciliationData as z };
