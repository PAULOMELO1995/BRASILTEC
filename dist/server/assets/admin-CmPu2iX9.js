import { D as getPlatformSettingsData, O as getSessionData, U as updatePlatformSettingData, c as getAdminAccessData, d as getAdminModerationAuditData, f as getAdminModerationQueueData, h as getAdminRoleDirectoryData, j as moderateAdminProductDecision, l as getAdminConsolidatedAuditData, m as getAdminRoleAuditData, n as PageShell, p as getAdminPaymentOpsData, r as assignAdminUserRoleData, u as getAdminData, z as runAdminPaymentReconciliationData } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/admin.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/admin.tsx?tsr-split=component";
function formatCurrency(cents) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(cents / 100);
}
function escapeCsvCell(value) {
	return `"${(value == null ? "" : String(value)).replace(/"/g, "\"\"")}"`;
}
function downloadCsv(filename, headers, rows) {
	const content = [headers.map((item) => escapeCsvCell(item)).join(","), ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))].join("\n");
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}
function toIsoStartOfDay(dateValue) {
	if (!dateValue) return void 0;
	return (/* @__PURE__ */ new Date(`${dateValue}T00:00:00`)).toISOString();
}
function toIsoEndOfDay(dateValue) {
	if (!dateValue) return void 0;
	return (/* @__PURE__ */ new Date(`${dateValue}T23:59:59.999`)).toISOString();
}
function AdminPage() {
	const [data, setData] = useState(null);
	const [access, setAccess] = useState(null);
	const [queue, setQueue] = useState([]);
	const [audit, setAudit] = useState([]);
	const [roleDirectory, setRoleDirectory] = useState([]);
	const [roleAudit, setRoleAudit] = useState([]);
	const [platformSettings, setPlatformSettings] = useState([]);
	const [consolidatedAudit, setConsolidatedAudit] = useState([]);
	const [paymentOps, setPaymentOps] = useState(null);
	const [roleDrafts, setRoleDrafts] = useState({});
	const [settingDrafts, setSettingDrafts] = useState({});
	const [newSettingKey, setNewSettingKey] = useState("");
	const [newSettingValue, setNewSettingValue] = useState("");
	const [currentUserId, setCurrentUserId] = useState(null);
	const [statusFilter, setStatusFilter] = useState("pending_review");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [roleAuditUserFilter, setRoleAuditUserFilter] = useState("");
	const [roleAuditActionFilter, setRoleAuditActionFilter] = useState("all");
	const [roleAuditFromFilter, setRoleAuditFromFilter] = useState("");
	const [roleAuditToFilter, setRoleAuditToFilter] = useState("");
	const [consolidatedTypeFilter, setConsolidatedTypeFilter] = useState("all");
	const [consolidatedActorFilter, setConsolidatedActorFilter] = useState("");
	const [consolidatedFromFilter, setConsolidatedFromFilter] = useState("");
	const [consolidatedToFilter, setConsolidatedToFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [reconcilingPayments, setReconcilingPayments] = useState(false);
	const [error, setError] = useState(null);
	const [actionError, setActionError] = useState(null);
	const [paymentActionStatus, setPaymentActionStatus] = useState(null);
	const publishRate = useMemo(() => {
		if (!data || data.productCount === 0) return 0;
		return Math.round(data.publishedProductCount / data.productCount * 100);
	}, [data]);
	const buildRoleAuditFilters = () => {
		const fromCreatedAt = toIsoStartOfDay(roleAuditFromFilter);
		const toCreatedAt = toIsoEndOfDay(roleAuditToFilter);
		return {
			...roleAuditUserFilter.trim() ? { userQuery: roleAuditUserFilter.trim() } : {},
			...roleAuditActionFilter !== "all" ? { action: roleAuditActionFilter } : {},
			...fromCreatedAt ? { fromCreatedAt } : {},
			...toCreatedAt ? { toCreatedAt } : {}
		};
	};
	const handleExportModerationAuditCsv = () => {
		downloadCsv(`auditoria-moderacao-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.csv`, [
			"id",
			"produto_id",
			"produto",
			"admin_id",
			"admin_nome",
			"admin_email",
			"acao",
			"motivo",
			"criado_em"
		], audit.map((entry) => [
			entry.id,
			entry.productId,
			entry.productName,
			entry.adminUserId,
			entry.adminName,
			entry.adminEmail,
			entry.action,
			entry.reason,
			entry.createdAt
		]));
	};
	const handleExportRoleAuditCsv = () => {
		downloadCsv(`auditoria-rbac-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.csv`, [
			"id",
			"usuario_id",
			"usuario_nome",
			"usuario_email",
			"acao",
			"papel_anterior",
			"novo_papel",
			"alterado_por_id",
			"alterado_por_nome",
			"alterado_por_email",
			"origem",
			"motivo",
			"criado_em"
		], roleAudit.map((entry) => [
			entry.id,
			entry.userId,
			entry.userName,
			entry.userEmail,
			entry.action,
			entry.previousRole,
			entry.newRole,
			entry.changedByUserId,
			entry.changedByName,
			entry.changedByEmail,
			entry.source,
			entry.reason,
			entry.createdAt
		]));
	};
	const buildConsolidatedAuditFilters = () => {
		const fromCreatedAt = toIsoStartOfDay(consolidatedFromFilter);
		const toCreatedAt = toIsoEndOfDay(consolidatedToFilter);
		return {
			...consolidatedTypeFilter !== "all" ? { eventType: consolidatedTypeFilter } : {},
			...consolidatedActorFilter.trim() ? { actorQuery: consolidatedActorFilter.trim() } : {},
			...fromCreatedAt ? { fromCreatedAt } : {},
			...toCreatedAt ? { toCreatedAt } : {}
		};
	};
	const handleExportConsolidatedAuditCsv = () => {
		downloadCsv(`auditoria-consolidada-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.csv`, [
			"id",
			"tipo_evento",
			"acao",
			"ator_id",
			"ator_nome",
			"ator_email",
			"alvo",
			"detalhe",
			"criado_em"
		], consolidatedAudit.map((entry) => [
			entry.id,
			entry.eventType,
			entry.action,
			entry.actorUserId,
			entry.actorName,
			entry.actorEmail,
			entry.target,
			entry.detail,
			entry.createdAt
		]));
	};
	const loadAdmin = (options) => {
		setLoading(true);
		setError(null);
		if (!options?.keepActionsError) setActionError(null);
		getSessionData().then((session) => {
			setCurrentUserId(session.user.id);
			return Promise.all([
				getAdminData(),
				getAdminAccessData(),
				getAdminPaymentOpsData({ data: {
					hours: 24,
					failureLimit: 8
				} }),
				getAdminModerationQueueData({ data: {
					limit: 20,
					status: statusFilter,
					...categoryFilter.trim() ? { category: categoryFilter.trim() } : {}
				} }),
				getAdminModerationAuditData({ data: { limit: 12 } }),
				getAdminRoleDirectoryData({ data: { limit: 30 } }),
				getAdminRoleAuditData({ data: {
					limit: 20,
					...buildRoleAuditFilters()
				} }),
				getPlatformSettingsData({ data: { limit: 100 } }),
				getAdminConsolidatedAuditData({ data: {
					limit: 30,
					...buildConsolidatedAuditFilters()
				} })
			]);
		}).then(([overview, accessData, paymentOpsData, moderationQueue, moderationAudit, roles, roleAuditData, settingsData, consolidatedData]) => {
			setData(overview);
			setAccess(accessData);
			setPaymentOps(paymentOpsData);
			setQueue(moderationQueue ?? []);
			setAudit(moderationAudit ?? []);
			const typedRoles = roles ?? [];
			setRoleAudit(roleAuditData ?? []);
			const typedSettings = settingsData ?? [];
			setPlatformSettings(typedSettings);
			setConsolidatedAudit(consolidatedData ?? []);
			setRoleDirectory(typedRoles);
			setSettingDrafts((previous) => {
				const next = {};
				for (const setting of typedSettings) next[setting.key] = previous[setting.key] ?? setting.value;
				return next;
			});
			setRoleDrafts((previous) => {
				const next = {};
				for (const entry of typedRoles) next[entry.userId] = previous[entry.userId] ?? entry.role;
				return next;
			});
			setError(null);
		}).catch((err) => {
			const message = err instanceof Error ? err.message : "Não foi possível carregar o painel admin.";
			if (message.toLowerCase().includes("sessão")) {
				window.location.assign("/login");
				return;
			}
			setError(message);
		}).finally(() => setLoading(false));
	};
	useEffect(() => {
		loadAdmin();
	}, [statusFilter]);
	async function handleModerationDecision(item, decision) {
		const reason = decision === "reject" ? window.prompt(`Informe o motivo da rejeição para "${item.name}" (mínimo 5 caracteres):`, item.moderationReason ?? "") : void 0;
		if (decision === "reject" && (!reason || reason.trim().length < 5)) {
			setActionError("Rejeição cancelada: informe um motivo com ao menos 5 caracteres.");
			return;
		}
		setActionLoading(true);
		setActionError(null);
		try {
			await moderateAdminProductDecision({ data: {
				productId: item.id,
				decision,
				reason: reason?.trim() || void 0
			} });
			const [overview, accessData, paymentOpsData, moderationQueue, moderationAudit, roles, roleAuditData, settingsData, consolidatedData] = await Promise.all([
				getAdminData(),
				getAdminAccessData(),
				getAdminPaymentOpsData({ data: {
					hours: 24,
					failureLimit: 8
				} }),
				getAdminModerationQueueData({ data: {
					limit: 20,
					status: statusFilter,
					...categoryFilter.trim() ? { category: categoryFilter.trim() } : {}
				} }),
				getAdminModerationAuditData({ data: { limit: 12 } }),
				getAdminRoleDirectoryData({ data: { limit: 30 } }),
				getAdminRoleAuditData({ data: {
					limit: 20,
					...buildRoleAuditFilters()
				} }),
				getPlatformSettingsData({ data: { limit: 100 } }),
				getAdminConsolidatedAuditData({ data: {
					limit: 30,
					...buildConsolidatedAuditFilters()
				} })
			]);
			setData(overview);
			setAccess(accessData);
			setPaymentOps(paymentOpsData);
			setQueue(moderationQueue ?? []);
			setAudit(moderationAudit ?? []);
			setRoleAudit(roleAuditData ?? []);
			const typedSettings = settingsData ?? [];
			setPlatformSettings(typedSettings);
			setConsolidatedAudit(consolidatedData ?? []);
			const typedRoles = roles ?? [];
			setRoleDirectory(typedRoles);
			setSettingDrafts((previous) => {
				const next = {};
				for (const setting of typedSettings) next[setting.key] = previous[setting.key] ?? setting.value;
				return next;
			});
			setRoleDrafts((previous) => {
				const next = {};
				for (const roleEntry of typedRoles) next[roleEntry.userId] = previous[roleEntry.userId] ?? roleEntry.role;
				return next;
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "Não foi possível aplicar a decisão de moderação.";
			setActionError(message);
		} finally {
			setActionLoading(false);
		}
	}
	async function handleAssignRole(entry) {
		const nextRole = roleDrafts[entry.userId] ?? entry.role;
		let confirmAdminPromotion = false;
		let approvalNote;
		if (entry.role !== "admin" && nextRole === "admin") {
			if ((window.prompt(`Confirma promoção de ${entry.email} para admin? Digite PROMOVER ADMIN para continuar.`, "") ?? "").trim().toUpperCase() !== "PROMOVER ADMIN") {
				setActionError("Promoção para admin cancelada: confirmação secundária inválida.");
				return;
			}
			const note = window.prompt("Informe a justificativa da promoção (mínimo 5 caracteres):", "");
			if (!note || note.trim().length < 5) {
				setActionError("Promoção para admin cancelada: justificativa inválida (mínimo 5 caracteres).");
				return;
			}
			confirmAdminPromotion = true;
			approvalNote = note.trim();
		}
		setActionLoading(true);
		setActionError(null);
		try {
			await assignAdminUserRoleData({ data: {
				userId: entry.userId,
				role: nextRole,
				confirmAdminPromotion,
				approvalNote
			} });
			const [overview, accessData, paymentOpsData, moderationQueue, moderationAudit, roles, roleAuditData, settingsData, consolidatedData] = await Promise.all([
				getAdminData(),
				getAdminAccessData(),
				getAdminPaymentOpsData({ data: {
					hours: 24,
					failureLimit: 8
				} }),
				getAdminModerationQueueData({ data: {
					limit: 20,
					status: statusFilter,
					...categoryFilter.trim() ? { category: categoryFilter.trim() } : {}
				} }),
				getAdminModerationAuditData({ data: { limit: 12 } }),
				getAdminRoleDirectoryData({ data: { limit: 30 } }),
				getAdminRoleAuditData({ data: {
					limit: 20,
					...buildRoleAuditFilters()
				} }),
				getPlatformSettingsData({ data: { limit: 100 } }),
				getAdminConsolidatedAuditData({ data: {
					limit: 30,
					...buildConsolidatedAuditFilters()
				} })
			]);
			setData(overview);
			setAccess(accessData);
			setPaymentOps(paymentOpsData);
			setQueue(moderationQueue ?? []);
			setAudit(moderationAudit ?? []);
			setRoleAudit(roleAuditData ?? []);
			const typedSettings = settingsData ?? [];
			setPlatformSettings(typedSettings);
			setConsolidatedAudit(consolidatedData ?? []);
			const typedRoles = roles ?? [];
			setRoleDirectory(typedRoles);
			setSettingDrafts((previous) => {
				const next = {};
				for (const setting of typedSettings) next[setting.key] = previous[setting.key] ?? setting.value;
				return next;
			});
			setRoleDrafts((previous) => {
				const next = {};
				for (const roleEntry of typedRoles) next[roleEntry.userId] = previous[roleEntry.userId] ?? roleEntry.role;
				return next;
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "Não foi possível atualizar o papel do usuário.";
			setActionError(message);
		} finally {
			setActionLoading(false);
		}
	}
	async function handleSaveSetting(settingKey) {
		const nextValue = (settingDrafts[settingKey] ?? "").trim();
		if (!nextValue) {
			setActionError("Informe um valor válido para a configuração.");
			return;
		}
		setActionLoading(true);
		setActionError(null);
		try {
			await updatePlatformSettingData({ data: {
				key: settingKey,
				value: nextValue
			} });
			loadAdmin({ keepActionsError: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Não foi possível salvar a configuração da plataforma.";
			setActionError(message);
		} finally {
			setActionLoading(false);
		}
	}
	async function handleCreateSetting() {
		const key = newSettingKey.trim();
		const value = newSettingValue.trim();
		if (!key || !value) {
			setActionError("Informe chave e valor para criar uma nova configuração.");
			return;
		}
		setActionLoading(true);
		setActionError(null);
		try {
			await updatePlatformSettingData({ data: {
				key,
				value
			} });
			setNewSettingKey("");
			setNewSettingValue("");
			loadAdmin({ keepActionsError: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Não foi possível criar a configuração da plataforma.";
			setActionError(message);
		} finally {
			setActionLoading(false);
		}
	}
	async function handleRunPaymentReconciliation() {
		if (!access?.canManageRoles || reconcilingPayments) return;
		setReconcilingPayments(true);
		setPaymentActionStatus(null);
		setActionError(null);
		try {
			const result = await runAdminPaymentReconciliationData({ data: {
				limit: 50,
				minOrderAgeMinutes: 2
			} });
			const summary = `Conciliação concluída: ${result.checkedOrders} checados, ${result.updatedOrders} atualizados, ${result.unchangedOrders} sem mudança, ${result.skippedOrders} ignorados, ${result.issues.length} com erro.`;
			setPaymentActionStatus(summary);
			loadAdmin({ keepActionsError: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Não foi possível executar a conciliação de pagamentos.";
			setActionError(message);
		} finally {
			setReconcilingPayments(false);
		}
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Admin"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 622,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Painel administrativo inicial"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 623,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Visão operacional de usuários, catálogo e receita para suporte à moderação e governança da plataforma."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 624,
					columnNumber: 11
				}, this),
				access ? /* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Papel atual: ",
						/* @__PURE__ */ jsxDEV("span", {
							className: "font-semibold",
							children: access.role
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 628,
							columnNumber: 28
						}, this),
						" ",
						access.canModerate ? "• pode moderar" : "• somente leitura"
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 627,
					columnNumber: 21
				}, this) : null,
				loading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando visão administrativa...",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 631,
					columnNumber: 22
				}, this) : null,
				error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: error,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 632,
					columnNumber: 20
				}, this) : null,
				!loading && data ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ jsxDEV("article", {
								className: "panel p-5",
								children: [/* @__PURE__ */ jsxDEV("p", {
									className: "text-sm text-muted-foreground",
									children: "Usuários totais"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 637,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-2 text-3xl font-semibold",
									children: data.userCount
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 638,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 636,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("article", {
								className: "panel p-5",
								children: [
									/* @__PURE__ */ jsxDEV("p", {
										className: "text-sm text-muted-foreground",
										children: "Produtos no catálogo"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 641,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-2 text-3xl font-semibold",
										children: data.productCount
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 642,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											"Publicados: ",
											data.publishedProductCount,
											" • Rascunhos: ",
											data.draftProductCount
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 643,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 640,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("article", {
								className: "panel p-5",
								children: [
									/* @__PURE__ */ jsxDEV("p", {
										className: "text-sm text-muted-foreground",
										children: "Receita da plataforma"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 646,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-2 text-3xl font-semibold",
										children: formatCurrency(data.platformRevenueCents)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 647,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											"Taxa: ",
											Math.round(data.platformFeeRate * 100),
											"% sobre ",
											formatCurrency(data.grossSalesCents)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 648,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 645,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 635,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-4 grid gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Pedidos aprovados"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 654,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: data.approvedOrdersCount
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 655,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 653,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Taxa de publicação"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 658,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: [publishRate, "%"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 659,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 657,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 652,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-4 grid gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Pendentes de revisão"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 665,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: data.pendingReviewCount
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 666,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 664,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("article", {
							className: "panel p-5",
							children: [/* @__PURE__ */ jsxDEV("p", {
								className: "text-sm text-muted-foreground",
								children: "Produtos rejeitados"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 669,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-2xl font-semibold",
								children: data.rejectedProductCount
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 670,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 668,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 663,
						columnNumber: 15
					}, this),
					paymentOps ? /* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						"data-testid": "payment-ops-section",
						children: [
							/* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("h2", {
									className: "text-lg font-semibold",
									children: "Saúde operacional de pagamentos"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 677,
									columnNumber: 23
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										"Janela dos últimos ",
										paymentOps.windowHours,
										"h para monitorar webhook, falhas e aplicação de eventos."
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 678,
									columnNumber: 23
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 676,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("div", {
									className: "flex flex-wrap gap-2",
									children: [access?.canManageRoles ? /* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-primary",
										onClick: handleRunPaymentReconciliation,
										disabled: loading || actionLoading || reconcilingPayments,
										children: reconcilingPayments ? "Conciliando..." : "Rodar conciliação agora"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 683,
										columnNumber: 49
									}, this) : null, /* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-ghost",
										onClick: () => loadAdmin({ keepActionsError: true }),
										disabled: loading || actionLoading || reconcilingPayments,
										children: "Atualizar pagamentos"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 686,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 682,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 675,
								columnNumber: 19
							}, this),
							paymentActionStatus ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "success",
								message: paymentActionStatus,
								className: "mt-4"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 694,
								columnNumber: 42
							}, this) : null,
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-4 md:grid-cols-4",
								children: [
									/* @__PURE__ */ jsxDEV("article", {
										className: "panel p-4",
										children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-xs text-muted-foreground",
											children: "Eventos recebidos"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 698,
											columnNumber: 23
										}, this), /* @__PURE__ */ jsxDEV("p", {
											className: "mt-2 text-2xl font-semibold",
											children: paymentOps.totalEvents
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 699,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 697,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ jsxDEV("article", {
										className: "panel p-4",
										children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-xs text-muted-foreground",
											children: "Aplicados com sucesso"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 702,
											columnNumber: 23
										}, this), /* @__PURE__ */ jsxDEV("p", {
											className: "mt-2 text-2xl font-semibold",
											children: paymentOps.appliedEvents
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 703,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 701,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ jsxDEV("article", {
										className: "panel p-4",
										children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-xs text-muted-foreground",
											children: "Falhas processadas"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 706,
											columnNumber: 23
										}, this), /* @__PURE__ */ jsxDEV("p", {
											className: "mt-2 text-2xl font-semibold",
											children: paymentOps.failedEvents
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 707,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 705,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ jsxDEV("article", {
										className: "panel p-4",
										children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-xs text-muted-foreground",
											children: "Pendentes de processamento"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 710,
											columnNumber: 23
										}, this), /* @__PURE__ */ jsxDEV("p", {
											className: "mt-2 text-2xl font-semibold",
											children: paymentOps.pendingProcessing
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 711,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 709,
										columnNumber: 21
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 696,
								columnNumber: 19
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-4 md:grid-cols-2",
								children: [/* @__PURE__ */ jsxDEV("article", {
									className: "panel p-4",
									children: [/* @__PURE__ */ jsxDEV("p", {
										className: "text-xs text-muted-foreground",
										children: "Último evento"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 717,
										columnNumber: 23
									}, this), /* @__PURE__ */ jsxDEV("p", {
										className: "mt-2 text-sm font-medium",
										children: paymentOps.lastEventAt ? new Date(paymentOps.lastEventAt).toLocaleString("pt-BR") : "Sem eventos no período"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 718,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 716,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("article", {
									className: "panel p-4",
									children: [/* @__PURE__ */ jsxDEV("p", {
										className: "text-xs text-muted-foreground",
										children: "Última aplicação com sucesso"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 723,
										columnNumber: 23
									}, this), /* @__PURE__ */ jsxDEV("p", {
										className: "mt-2 text-sm font-medium",
										children: paymentOps.lastSuccessAt ? new Date(paymentOps.lastSuccessAt).toLocaleString("pt-BR") : "Sem aplicação no período"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 724,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 722,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 715,
								columnNumber: 19
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [
									/* @__PURE__ */ jsxDEV("h3", {
										className: "text-sm font-semibold",
										children: "Últimas falhas de webhook"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 731,
										columnNumber: 21
									}, this),
									paymentOps.recentFailures.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
										variant: "success",
										message: "Nenhuma falha registrada na janela atual."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 732,
										columnNumber: 63
									}, this) : null,
									paymentOps.recentFailures.map((failure) => /* @__PURE__ */ jsxDEV("div", {
										className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
										children: [
											/* @__PURE__ */ jsxDEV("div", {
												className: "flex flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ jsxDEV("p", {
													className: "text-sm font-medium",
													children: [
														failure.provider,
														" • evento ",
														failure.eventId
													]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 735,
													columnNumber: 27
												}, this), /* @__PURE__ */ jsxDEV("span", {
													className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
													children: failure.eventStatus ?? "sem status"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 736,
													columnNumber: 27
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 734,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ jsxDEV("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													"pedido: ",
													failure.orderId ?? "não vinculado",
													" • resultado: ",
													failure.processingResult ?? "sem detalhe"
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 740,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ jsxDEV("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													"recebido em ",
													new Date(failure.createdAt).toLocaleString("pt-BR"),
													failure.processedAt ? ` • processado em ${new Date(failure.processedAt).toLocaleString("pt-BR")}` : ""
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 743,
												columnNumber: 25
											}, this)
										]
									}, failure.id, true, {
										fileName: _jsxFileName,
										lineNumber: 733,
										columnNumber: 63
									}, this))
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 730,
								columnNumber: 19
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 674,
						columnNumber: 29
					}, this) : null,
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 grid gap-4 lg:grid-cols-2",
						children: [/* @__PURE__ */ jsxDEV("article", {
							className: "rounded-2xl border border-border/60 bg-background/70 p-5",
							children: [/* @__PURE__ */ jsxDEV("h2", {
								className: "text-lg font-semibold",
								children: "Categorias mais usadas"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 753,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [data.categories.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Sem produtos cadastrados até o momento."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 755,
									columnNumber: 53
								}, this) : null, data.categories.map((entry) => /* @__PURE__ */ jsxDEV("div", {
									className: "flex items-center justify-between rounded-xl border border-border/50 bg-background/80 px-3 py-2",
									children: [/* @__PURE__ */ jsxDEV("span", {
										className: "text-sm",
										children: entry.category
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 757,
										columnNumber: 25
									}, this), /* @__PURE__ */ jsxDEV("span", {
										className: "text-sm font-semibold",
										children: entry.productCount
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 758,
										columnNumber: 25
									}, this)]
								}, entry.category, true, {
									fileName: _jsxFileName,
									lineNumber: 756,
									columnNumber: 51
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 754,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 752,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("article", {
							className: "rounded-2xl border border-border/60 bg-background/70 p-5",
							children: [/* @__PURE__ */ jsxDEV("h2", {
								className: "text-lg font-semibold",
								children: "Últimos usuários"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 764,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [data.latestUsers.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Nenhum usuário encontrado."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 766,
									columnNumber: 54
								}, this) : null, data.latestUsers.map((user) => /* @__PURE__ */ jsxDEV("div", {
									className: "rounded-xl border border-border/50 bg-background/80 px-3 py-2",
									children: [/* @__PURE__ */ jsxDEV("p", {
										className: "text-sm font-medium",
										children: user.name
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 768,
										columnNumber: 25
									}, this), /* @__PURE__ */ jsxDEV("p", {
										className: "text-xs text-muted-foreground",
										children: [
											user.email,
											" • ",
											user.businessType
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 769,
										columnNumber: 25
									}, this)]
								}, `${user.email}-${user.createdAt}`, true, {
									fileName: _jsxFileName,
									lineNumber: 767,
									columnNumber: 51
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 765,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 763,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 751,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						"data-testid": "role-management-section",
						children: [/* @__PURE__ */ jsxDEV("h2", {
							className: "text-lg font-semibold",
							children: "Últimos produtos"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 776,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("div", {
							className: "mt-4 grid gap-2",
							children: [data.latestProducts.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "empty",
								message: "Nenhum produto cadastrado."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 778,
								columnNumber: 55
							}, this) : null, data.latestProducts.map((product) => /* @__PURE__ */ jsxDEV("div", {
								className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
								children: [
									/* @__PURE__ */ jsxDEV("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-sm font-medium",
											children: product.name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 781,
											columnNumber: 25
										}, this), /* @__PURE__ */ jsxDEV("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsxDEV("span", {
												className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
												children: product.status
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 783,
												columnNumber: 27
											}, this), /* @__PURE__ */ jsxDEV("span", {
												className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
												children: ["mod: ", product.moderationStatus]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 784,
												columnNumber: 27
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 782,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 780,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											product.category,
											" • ",
											formatCurrency(product.priceCents),
											" • por ",
											product.ownerName
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 787,
										columnNumber: 23
									}, this),
									product.moderationReason ? /* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: ["Motivo: ", product.moderationReason]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 790,
										columnNumber: 51
									}, this) : null
								]
							}, product.id, true, {
								fileName: _jsxFileName,
								lineNumber: 779,
								columnNumber: 55
							}, this))]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 777,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 775,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsxDEV("h2", {
									className: "text-lg font-semibold",
									children: "Fila de moderação"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 797,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("div", {
									className: "flex flex-wrap gap-2",
									children: /* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-ghost",
										onClick: () => loadAdmin(),
										disabled: loading || actionLoading,
										children: "Atualizar fila"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 799,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 798,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 796,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-3 md:grid-cols-3",
								children: [/* @__PURE__ */ jsxDEV("label", {
									className: "text-sm text-muted-foreground",
									children: ["Status", /* @__PURE__ */ jsxDEV("select", {
										className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
										value: statusFilter,
										onChange: (event) => setStatusFilter(event.target.value),
										children: [
											/* @__PURE__ */ jsxDEV("option", {
												value: "pending_review",
												children: "Pendentes"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 809,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ jsxDEV("option", {
												value: "approved",
												children: "Aprovados"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 810,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ jsxDEV("option", {
												value: "rejected",
												children: "Rejeitados"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 811,
												columnNumber: 23
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 808,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 806,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("label", {
									className: "text-sm text-muted-foreground md:col-span-2",
									children: ["Categoria (opcional)", /* @__PURE__ */ jsxDEV("div", {
										className: "mt-1 flex gap-2",
										children: [/* @__PURE__ */ jsxDEV("input", {
											value: categoryFilter,
											onChange: (event) => setCategoryFilter(event.target.value),
											className: "w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											placeholder: "Ex.: Educação"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 818,
											columnNumber: 23
										}, this), /* @__PURE__ */ jsxDEV("button", {
											type: "button",
											className: "btn-base btn-ghost",
											disabled: loading || actionLoading,
											onClick: () => loadAdmin({ keepActionsError: true }),
											children: "Filtrar"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 819,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 817,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 815,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 805,
								columnNumber: 17
							}, this),
							actionError ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "error",
								message: actionError,
								className: "mt-4"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 828,
								columnNumber: 32
							}, this) : null,
							access && !access.canModerate ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "empty",
								message: "Seu papel atual permite apenas visualização. Ações de moderação exigem perfil moderator/admin.",
								className: "mt-4"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 829,
								columnNumber: 50
							}, this) : null,
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [queue.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Sem produtos pendentes de moderação."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 832,
									columnNumber: 41
								}, this) : null, queue.map((item) => /* @__PURE__ */ jsxDEV("div", {
									className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
									children: [/* @__PURE__ */ jsxDEV("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-sm font-medium",
											children: item.name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 836,
											columnNumber: 27
										}, this), /* @__PURE__ */ jsxDEV("p", {
											className: "text-xs text-muted-foreground",
											children: [
												item.category,
												" • ",
												formatCurrency(item.priceCents),
												" • ",
												item.ownerName,
												" (",
												item.ownerEmail,
												")"
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 837,
											columnNumber: 27
										}, this)] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 835,
											columnNumber: 25
										}, this), /* @__PURE__ */ jsxDEV("span", {
											className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
											children: item.moderationStatus
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 841,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 834,
										columnNumber: 23
									}, this), /* @__PURE__ */ jsxDEV("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: statusFilter === "pending_review" && access?.canModerate ? /* @__PURE__ */ jsxDEV(Fragment, { children: [/* @__PURE__ */ jsxDEV("button", {
											type: "button",
											className: "btn-base btn-primary",
											disabled: actionLoading,
											onClick: () => handleModerationDecision(item, "approve"),
											children: "Aprovar"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 846,
											columnNumber: 29
										}, this), /* @__PURE__ */ jsxDEV("button", {
											type: "button",
											className: "btn-base btn-ghost",
											disabled: actionLoading,
											onClick: () => handleModerationDecision(item, "reject"),
											children: "Rejeitar"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 849,
											columnNumber: 29
										}, this)] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 845,
											columnNumber: 85
										}, this) : null
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 844,
										columnNumber: 23
									}, this)]
								}, item.id, true, {
									fileName: _jsxFileName,
									lineNumber: 833,
									columnNumber: 38
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 831,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 795,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsxDEV("div", { children: [
									/* @__PURE__ */ jsxDEV("h2", {
										className: "text-lg font-semibold",
										children: "Gestão de papéis administrativos"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 861,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "Defina acesso de visualização, moderação e administração por usuário."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 862,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "Promoções para admin exigem confirmação secundária explícita."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 863,
										columnNumber: 21
									}, this)
								] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 860,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("button", {
									type: "button",
									className: "btn-base btn-ghost",
									onClick: () => loadAdmin({ keepActionsError: true }),
									disabled: loading || actionLoading,
									children: "Atualizar papéis"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 865,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 859,
								columnNumber: 17
							}, this),
							access && !access.canManageRoles ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "empty",
								message: "Somente admins podem alterar papéis. Seu usuário tem acesso apenas para consulta de papéis.",
								className: "mt-4"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 872,
								columnNumber: 53
							}, this) : null,
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [roleDirectory.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Nenhum usuário disponível para gestão de papéis."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 875,
									columnNumber: 49
								}, this) : null, roleDirectory.map((entry) => {
									const selectedRole = roleDrafts[entry.userId] ?? entry.role;
									const isSelf = currentUserId === entry.userId;
									const assignmentMeta = entry.source ? `origem: ${entry.source}` : "origem: sem papel definido";
									const approvalMeta = entry.role === "admin" && entry.approvedAt ? `aprovado por ${entry.approvedByName ?? entry.approvedByEmail ?? entry.approvedByUserId ?? "desconhecido"} em ${new Date(entry.approvedAt).toLocaleString("pt-BR")}` : null;
									return /* @__PURE__ */ jsxDEV("div", {
										className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
										"data-testid": "role-management-row",
										children: [/* @__PURE__ */ jsxDEV("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ jsxDEV("div", { children: [
												/* @__PURE__ */ jsxDEV("p", {
													className: "text-sm font-medium",
													children: entry.name
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 884,
													columnNumber: 29
												}, this),
												/* @__PURE__ */ jsxDEV("p", {
													className: "text-xs text-muted-foreground",
													children: [
														entry.email,
														" • ",
														entry.businessType
													]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 885,
													columnNumber: 29
												}, this),
												/* @__PURE__ */ jsxDEV("p", {
													className: "text-xs text-muted-foreground",
													children: [
														"Papel atual: ",
														entry.role,
														" • ",
														assignmentMeta
													]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 886,
													columnNumber: 29
												}, this),
												approvalMeta ? /* @__PURE__ */ jsxDEV("p", {
													className: "text-xs text-muted-foreground",
													children: approvalMeta
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 887,
													columnNumber: 45
												}, this) : null,
												entry.role === "admin" && entry.approvalNote ? /* @__PURE__ */ jsxDEV("p", {
													className: "text-xs text-muted-foreground",
													children: ["Justificativa: ", entry.approvalNote]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 888,
													columnNumber: 77
												}, this) : null
											] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 883,
												columnNumber: 27
											}, this), /* @__PURE__ */ jsxDEV("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [/* @__PURE__ */ jsxDEV("select", {
													className: "rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
													value: selectedRole,
													onChange: (event) => {
														const role = event.target.value;
														setRoleDrafts((previous) => ({
															...previous,
															[entry.userId]: role
														}));
													},
													disabled: !access?.canManageRoles || actionLoading,
													"aria-label": `Papel de ${entry.email}`,
													children: [
														/* @__PURE__ */ jsxDEV("option", {
															value: "none",
															children: "none"
														}, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 898,
															columnNumber: 31
														}, this),
														/* @__PURE__ */ jsxDEV("option", {
															value: "viewer",
															children: "viewer"
														}, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 899,
															columnNumber: 31
														}, this),
														/* @__PURE__ */ jsxDEV("option", {
															value: "moderator",
															children: "moderator"
														}, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 900,
															columnNumber: 31
														}, this),
														/* @__PURE__ */ jsxDEV("option", {
															value: "admin",
															children: "admin"
														}, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 901,
															columnNumber: 31
														}, this)
													]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 891,
													columnNumber: 29
												}, this), /* @__PURE__ */ jsxDEV("button", {
													type: "button",
													className: "btn-base btn-primary",
													disabled: !access?.canManageRoles || actionLoading || isSelf && selectedRole !== "admin",
													onClick: () => handleAssignRole(entry),
													"aria-label": `Salvar papel de ${entry.email}`,
													children: "Salvar papel"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 903,
													columnNumber: 29
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 890,
												columnNumber: 27
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 882,
											columnNumber: 25
										}, this), isSelf ? /* @__PURE__ */ jsxDEV("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: "Seu usuário não pode ser rebaixado por esta tela para evitar bloqueio administrativo."
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 908,
											columnNumber: 35
										}, this) : null]
									}, entry.userId, true, {
										fileName: _jsxFileName,
										lineNumber: 881,
										columnNumber: 24
									}, this);
								})]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 874,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 858,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("h2", {
									className: "text-lg font-semibold",
									children: "Configurações da plataforma"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 917,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Parâmetros versionados com trilha de auditoria de alteração."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 918,
									columnNumber: 21
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 916,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("button", {
									type: "button",
									className: "btn-base btn-ghost",
									onClick: () => loadAdmin({ keepActionsError: true }),
									disabled: loading || actionLoading,
									children: "Atualizar configurações"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 920,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 915,
								columnNumber: 17
							}, this),
							access && !access.canManageRoles ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "empty",
								message: "Somente admins podem alterar configurações. Seu usuário tem acesso apenas de consulta.",
								className: "mt-4"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 927,
								columnNumber: 53
							}, this) : null,
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 rounded-xl border border-border/50 bg-background/80 px-3 py-3",
								children: [/* @__PURE__ */ jsxDEV("p", {
									className: "text-xs text-muted-foreground",
									children: "Criar nova configuração"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 930,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("div", {
									className: "mt-2 grid gap-2 md:grid-cols-[1fr_1.4fr_auto]",
									children: [
										/* @__PURE__ */ jsxDEV("input", {
											value: newSettingKey,
											onChange: (event) => setNewSettingKey(event.target.value),
											className: "rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											placeholder: "chave.exemplo",
											disabled: !access?.canManageRoles || actionLoading
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 932,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ jsxDEV("input", {
											value: newSettingValue,
											onChange: (event) => setNewSettingValue(event.target.value),
											className: "rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											placeholder: "valor",
											disabled: !access?.canManageRoles || actionLoading
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 933,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ jsxDEV("button", {
											type: "button",
											className: "btn-base btn-primary",
											onClick: handleCreateSetting,
											disabled: !access?.canManageRoles || actionLoading,
											children: "Criar"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 934,
											columnNumber: 21
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 931,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 929,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [platformSettings.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Nenhuma configuração registrada ainda."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 941,
									columnNumber: 52
								}, this) : null, platformSettings.map((setting) => /* @__PURE__ */ jsxDEV("div", {
									className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
									children: [/* @__PURE__ */ jsxDEV("div", {
										className: "grid gap-2 md:grid-cols-[1fr_1.6fr_auto] md:items-center",
										children: [
											/* @__PURE__ */ jsxDEV("p", {
												className: "text-sm font-medium",
												children: setting.key
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 944,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ jsxDEV("input", {
												value: settingDrafts[setting.key] ?? setting.value,
												onChange: (event) => setSettingDrafts((previous) => ({
													...previous,
													[setting.key]: event.target.value
												})),
												className: "rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
												disabled: !access?.canManageRoles || actionLoading
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 945,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ jsxDEV("button", {
												type: "button",
												className: "btn-base btn-ghost",
												onClick: () => handleSaveSetting(setting.key),
												disabled: !access?.canManageRoles || actionLoading,
												children: "Salvar"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 949,
												columnNumber: 25
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 943,
										columnNumber: 23
									}, this), /* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											"atualizado por ",
											setting.updatedByName ?? setting.updatedByEmail ?? setting.updatedByUserId ?? "sistema",
											" em ",
											new Date(setting.updatedAt).toLocaleString("pt-BR")
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 953,
										columnNumber: 23
									}, this)]
								}, setting.key, true, {
									fileName: _jsxFileName,
									lineNumber: 942,
									columnNumber: 52
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 940,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 914,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("h2", {
									className: "text-lg font-semibold",
									children: "Auditoria administrativa consolidada"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 963,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Eventos de moderação, RBAC e configurações em um único timeline."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 964,
									columnNumber: 21
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 962,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-ghost",
										onClick: () => loadAdmin({ keepActionsError: true }),
										disabled: loading || actionLoading,
										children: "Aplicar filtros"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 967,
										columnNumber: 21
									}, this), /* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-ghost",
										onClick: handleExportConsolidatedAuditCsv,
										disabled: consolidatedAudit.length === 0,
										children: "Exportar CSV"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 972,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 966,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 961,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-3 md:grid-cols-4",
								children: [
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground",
										children: ["Tipo de evento", /* @__PURE__ */ jsxDEV("select", {
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											value: consolidatedTypeFilter,
											onChange: (event) => setConsolidatedTypeFilter(event.target.value),
											children: [
												/* @__PURE__ */ jsxDEV("option", {
													value: "all",
													children: "Todos"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 982,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "moderation",
													children: "Moderação"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 983,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "rbac",
													children: "RBAC"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 984,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "platform_setting",
													children: "Configuração"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 985,
													columnNumber: 23
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 981,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 979,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground md:col-span-1",
										children: ["Ator (nome/email)", /* @__PURE__ */ jsxDEV("input", {
											value: consolidatedActorFilter,
											onChange: (event) => setConsolidatedActorFilter(event.target.value),
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											placeholder: "Ex.: admin@empresa.com"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 991,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 989,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground",
										children: ["De", /* @__PURE__ */ jsxDEV("input", {
											type: "date",
											value: consolidatedFromFilter,
											onChange: (event) => setConsolidatedFromFilter(event.target.value),
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 996,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 994,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground",
										children: ["Até", /* @__PURE__ */ jsxDEV("input", {
											type: "date",
											value: consolidatedToFilter,
											onChange: (event) => setConsolidatedToFilter(event.target.value),
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1001,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 999,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 978,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [consolidatedAudit.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Sem eventos de auditoria para os filtros atuais."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1006,
									columnNumber: 53
								}, this) : null, consolidatedAudit.map((entry) => /* @__PURE__ */ jsxDEV("div", {
									className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
									children: [
										/* @__PURE__ */ jsxDEV("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ jsxDEV("p", {
												className: "text-sm font-medium",
												children: entry.target
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1009,
												columnNumber: 25
											}, this), /* @__PURE__ */ jsxDEV("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [/* @__PURE__ */ jsxDEV("span", {
													className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
													children: entry.eventType
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1011,
													columnNumber: 27
												}, this), /* @__PURE__ */ jsxDEV("span", {
													className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
													children: entry.action
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1012,
													columnNumber: 27
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1010,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1008,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ jsxDEV("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												"por ",
												entry.actorName ?? entry.actorEmail ?? entry.actorUserId ?? "sistema",
												" • ",
												new Date(entry.createdAt).toLocaleString("pt-BR")
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1015,
											columnNumber: 23
										}, this),
										entry.detail ? /* @__PURE__ */ jsxDEV("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: ["Detalhe: ", entry.detail]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1018,
											columnNumber: 39
										}, this) : null
									]
								}, entry.id, true, {
									fileName: _jsxFileName,
									lineNumber: 1007,
									columnNumber: 51
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1005,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 960,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [/* @__PURE__ */ jsxDEV("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("h2", {
								className: "text-lg font-semibold",
								children: "Auditoria de moderação"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1026,
								columnNumber: 21
							}, this), /* @__PURE__ */ jsxDEV("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Últimas decisões administrativas registradas na plataforma."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1027,
								columnNumber: 21
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1025,
								columnNumber: 19
							}, this), /* @__PURE__ */ jsxDEV("button", {
								type: "button",
								className: "btn-base btn-ghost",
								onClick: handleExportModerationAuditCsv,
								disabled: audit.length === 0,
								children: "Exportar CSV"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1029,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1024,
							columnNumber: 17
						}, this), /* @__PURE__ */ jsxDEV("div", {
							className: "mt-4 grid gap-2",
							children: [audit.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
								variant: "empty",
								message: "Sem registros de auditoria até o momento."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1035,
								columnNumber: 41
							}, this) : null, audit.map((entry) => /* @__PURE__ */ jsxDEV("div", {
								className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
								children: [
									/* @__PURE__ */ jsxDEV("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ jsxDEV("p", {
											className: "text-sm font-medium",
											children: entry.productName
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1038,
											columnNumber: 25
										}, this), /* @__PURE__ */ jsxDEV("span", {
											className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
											children: entry.action
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1039,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1037,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											"por ",
											entry.adminName,
											" (",
											entry.adminEmail,
											") em ",
											new Date(entry.createdAt).toLocaleString("pt-BR")
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1041,
										columnNumber: 23
									}, this),
									entry.reason ? /* @__PURE__ */ jsxDEV("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: ["Motivo: ", entry.reason]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1044,
										columnNumber: 39
									}, this) : null
								]
							}, entry.id, true, {
								fileName: _jsxFileName,
								lineNumber: 1036,
								columnNumber: 39
							}, this))]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1034,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1023,
						columnNumber: 15
					}, this),
					/* @__PURE__ */ jsxDEV("div", {
						className: "mt-6 rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("h2", {
									className: "text-lg font-semibold",
									children: "Auditoria de papéis (RBAC)"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1052,
									columnNumber: 21
								}, this), /* @__PURE__ */ jsxDEV("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Histórico imutável das mudanças de papéis administrativos."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1053,
									columnNumber: 21
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1051,
									columnNumber: 19
								}, this), /* @__PURE__ */ jsxDEV("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-ghost",
										onClick: () => loadAdmin({ keepActionsError: true }),
										disabled: loading || actionLoading,
										children: "Aplicar filtros"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1056,
										columnNumber: 21
									}, this), /* @__PURE__ */ jsxDEV("button", {
										type: "button",
										className: "btn-base btn-ghost",
										onClick: handleExportRoleAuditCsv,
										disabled: roleAudit.length === 0,
										children: "Exportar CSV"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1061,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1055,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1050,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-3 md:grid-cols-4",
								children: [
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground md:col-span-2",
										children: ["Usuário (nome ou email)", /* @__PURE__ */ jsxDEV("input", {
											value: roleAuditUserFilter,
											onChange: (event) => setRoleAuditUserFilter(event.target.value),
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											placeholder: "Ex.: joao@empresa.com"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1070,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1068,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground",
										children: ["Ação", /* @__PURE__ */ jsxDEV("select", {
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm",
											value: roleAuditActionFilter,
											onChange: (event) => setRoleAuditActionFilter(event.target.value),
											children: [
												/* @__PURE__ */ jsxDEV("option", {
													value: "all",
													children: "Todas"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1076,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "grant",
													children: "Concessão de acesso"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1077,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "revoke",
													children: "Remoção de acesso"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1078,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "change",
													children: "Troca de papel"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1079,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "promote_admin",
													children: "Promoção para admin"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1080,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ jsxDEV("option", {
													value: "demote_admin",
													children: "Rebaixamento de admin"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1081,
													columnNumber: 23
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1075,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1073,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground",
										children: ["De", /* @__PURE__ */ jsxDEV("input", {
											type: "date",
											value: roleAuditFromFilter,
											onChange: (event) => setRoleAuditFromFilter(event.target.value),
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1087,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1085,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ jsxDEV("label", {
										className: "text-sm text-muted-foreground",
										children: ["Até", /* @__PURE__ */ jsxDEV("input", {
											type: "date",
											value: roleAuditToFilter,
											onChange: (event) => setRoleAuditToFilter(event.target.value),
											className: "mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1092,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1090,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1067,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-2",
								children: [roleAudit.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
									variant: "empty",
									message: "Sem alterações de papéis registradas até o momento."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1097,
									columnNumber: 45
								}, this) : null, roleAudit.map((entry) => /* @__PURE__ */ jsxDEV("div", {
									className: "rounded-xl border border-border/50 bg-background/80 px-3 py-3",
									children: [
										/* @__PURE__ */ jsxDEV("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ jsxDEV("p", {
												className: "text-sm font-medium",
												children: [
													entry.userName,
													" (",
													entry.userEmail,
													")"
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1100,
												columnNumber: 25
											}, this), /* @__PURE__ */ jsxDEV("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [/* @__PURE__ */ jsxDEV("span", {
													className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
													children: entry.action
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1102,
													columnNumber: 27
												}, this), /* @__PURE__ */ jsxDEV("span", {
													className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground",
													children: [
														entry.previousRole,
														" → ",
														entry.newRole
													]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 1103,
													columnNumber: 27
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1101,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1099,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ jsxDEV("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												"por ",
												entry.changedByName ?? entry.changedByEmail ?? entry.changedByUserId ?? "sistema",
												" • origem ",
												entry.source,
												" • ",
												new Date(entry.createdAt).toLocaleString("pt-BR")
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1108,
											columnNumber: 23
										}, this),
										entry.reason ? /* @__PURE__ */ jsxDEV("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: ["Motivo: ", entry.reason]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1111,
											columnNumber: 39
										}, this) : null
									]
								}, entry.id, true, {
									fileName: _jsxFileName,
									lineNumber: 1098,
									columnNumber: 43
								}, this))]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1096,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1049,
						columnNumber: 15
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 634,
					columnNumber: 31
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: /* @__PURE__ */ jsxDEV(Link, {
						to: "/painel",
						className: "btn-base btn-ghost",
						children: "Voltar ao painel"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1118,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 1117,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 621,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 620,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 619,
		columnNumber: 10
	}, this);
}
//#endregion
export { AdminPage as component };
