import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import {
  assignAdminUserRoleData,
  getAdminConsolidatedAuditData,
  getAdminAccessData,
  getAdminData,
  getAdminModerationAuditData,
  getAdminModerationQueueData,
  getAdminPaymentOpsData,
  getAdminRoleAuditData,
  getAdminRoleDirectoryData,
  getPlatformSettingsData,
  getSessionData,
  moderateAdminProductDecision,
  runAdminPaymentReconciliationData,
  updatePlatformSettingData,
} from "@/lib/auth-server";

type AdminAccess = {
  role: "none" | "viewer" | "moderator" | "admin";
  canModerate: boolean;
  canManageRoles: boolean;
};

type AssignableAdminRole = "none" | "viewer" | "moderator" | "admin";

type AdminData = {
  userCount: number;
  productCount: number;
  publishedProductCount: number;
  draftProductCount: number;
  pendingReviewCount: number;
  rejectedProductCount: number;
  approvedOrdersCount: number;
  grossSalesCents: number;
  platformFeeRate: number;
  platformRevenueCents: number;
  categories: Array<{ category: string; productCount: number }>;
  latestUsers: Array<{ name: string; email: string; businessType: string; createdAt: string }>;
  latestProducts: Array<{
    id: string;
    ownerUserId: string;
    ownerName: string;
    name: string;
    category: string;
    status: "draft" | "published";
    moderationStatus: "pending_review" | "approved" | "rejected";
    moderationReason: string | null;
    priceCents: number;
    createdAt: string;
  }>;
};

type ModerationQueueItem = {
  id: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  category: string;
  status: "draft" | "published";
  moderationStatus: "pending_review" | "approved" | "rejected";
  moderationReason: string | null;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
};

type ModerationAuditItem = {
  id: string;
  productId: string;
  productName: string;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
  action: "approve" | "reject";
  reason: string | null;
  createdAt: string;
};

type AdminRoleDirectoryItem = {
  userId: string;
  name: string;
  email: string;
  businessType: string;
  role: "none" | AssignableAdminRole;
  assignedByUserId: string | null;
  source: string | null;
  approvedByUserId: string | null;
  approvedByName: string | null;
  approvedByEmail: string | null;
  approvedAt: string | null;
  approvalNote: string | null;
  updatedAt: string;
};

type AdminRoleAuditItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: "grant" | "revoke" | "change" | "promote_admin" | "demote_admin";
  previousRole: "none" | AssignableAdminRole;
  newRole: "none" | AssignableAdminRole;
  changedByUserId: string | null;
  changedByName: string | null;
  changedByEmail: string | null;
  source: string;
  reason: string | null;
  createdAt: string;
};

type PlatformSettingItem = {
  key: string;
  value: string;
  updatedByUserId: string | null;
  updatedByName: string | null;
  updatedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

type ConsolidatedAuditItem = {
  id: string;
  eventType: "moderation" | "rbac" | "platform_setting";
  action: string;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  target: string;
  detail: string | null;
  createdAt: string;
};

type PaymentWebhookFailureItem = {
  id: string;
  provider: string;
  eventId: string;
  orderId: string | null;
  eventStatus: string | null;
  processingResult: string | null;
  createdAt: string;
  processedAt: string | null;
};

type PaymentOpsData = {
  windowHours: number;
  totalEvents: number;
  pendingProcessing: number;
  appliedEvents: number;
  failedEvents: number;
  lastEventAt: string | null;
  lastSuccessAt: string | null;
  recentFailures: PaymentWebhookFailureItem[];
};

type PaymentReconciliationData = {
  provider: "mercado_pago";
  checkedOrders: number;
  updatedOrders: number;
  unchangedOrders: number;
  skippedOrders: number;
  issues: Array<{ orderId: string; message: string }>;
  startedAt: string;
  completedAt: string;
};

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const normalized = value == null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>): void {
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

function toIsoStartOfDay(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

function toIsoEndOfDay(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T23:59:59.999`).toISOString();
}

function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [audit, setAudit] = useState<ModerationAuditItem[]>([]);
  const [roleDirectory, setRoleDirectory] = useState<AdminRoleDirectoryItem[]>([]);
  const [roleAudit, setRoleAudit] = useState<AdminRoleAuditItem[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingItem[]>([]);
  const [consolidatedAudit, setConsolidatedAudit] = useState<ConsolidatedAuditItem[]>([]);
  const [paymentOps, setPaymentOps] = useState<PaymentOpsData | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AssignableAdminRole>>({});
  const [settingDrafts, setSettingDrafts] = useState<Record<string, string>>({});
  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending_review" | "approved" | "rejected">("pending_review");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [roleAuditUserFilter, setRoleAuditUserFilter] = useState("");
  const [roleAuditActionFilter, setRoleAuditActionFilter] = useState<"all" | "grant" | "revoke" | "change" | "promote_admin" | "demote_admin">("all");
  const [roleAuditFromFilter, setRoleAuditFromFilter] = useState("");
  const [roleAuditToFilter, setRoleAuditToFilter] = useState("");
  const [consolidatedTypeFilter, setConsolidatedTypeFilter] = useState<"all" | "moderation" | "rbac" | "platform_setting">("all");
  const [consolidatedActorFilter, setConsolidatedActorFilter] = useState("");
  const [consolidatedFromFilter, setConsolidatedFromFilter] = useState("");
  const [consolidatedToFilter, setConsolidatedToFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reconcilingPayments, setReconcilingPayments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentActionStatus, setPaymentActionStatus] = useState<string | null>(null);

  const publishRate = useMemo(() => {
    if (!data || data.productCount === 0) return 0;
    return Math.round((data.publishedProductCount / data.productCount) * 100);
  }, [data]);

  const buildRoleAuditFilters = () => {
    const fromCreatedAt = toIsoStartOfDay(roleAuditFromFilter);
    const toCreatedAt = toIsoEndOfDay(roleAuditToFilter);

    return {
      ...(roleAuditUserFilter.trim() ? { userQuery: roleAuditUserFilter.trim() } : {}),
      ...(roleAuditActionFilter !== "all" ? { action: roleAuditActionFilter } : {}),
      ...(fromCreatedAt ? { fromCreatedAt } : {}),
      ...(toCreatedAt ? { toCreatedAt } : {}),
    };
  };

  const handleExportModerationAuditCsv = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(
      `auditoria-moderacao-${timestamp}.csv`,
      ["id", "produto_id", "produto", "admin_id", "admin_nome", "admin_email", "acao", "motivo", "criado_em"],
      audit.map((entry) => [
        entry.id,
        entry.productId,
        entry.productName,
        entry.adminUserId,
        entry.adminName,
        entry.adminEmail,
        entry.action,
        entry.reason,
        entry.createdAt,
      ]),
    );
  };

  const handleExportRoleAuditCsv = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(
      `auditoria-rbac-${timestamp}.csv`,
      ["id", "usuario_id", "usuario_nome", "usuario_email", "acao", "papel_anterior", "novo_papel", "alterado_por_id", "alterado_por_nome", "alterado_por_email", "origem", "motivo", "criado_em"],
      roleAudit.map((entry) => [
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
        entry.createdAt,
      ]),
    );
  };

  const buildConsolidatedAuditFilters = () => {
    const fromCreatedAt = toIsoStartOfDay(consolidatedFromFilter);
    const toCreatedAt = toIsoEndOfDay(consolidatedToFilter);

    return {
      ...(consolidatedTypeFilter !== "all" ? { eventType: consolidatedTypeFilter } : {}),
      ...(consolidatedActorFilter.trim() ? { actorQuery: consolidatedActorFilter.trim() } : {}),
      ...(fromCreatedAt ? { fromCreatedAt } : {}),
      ...(toCreatedAt ? { toCreatedAt } : {}),
    };
  };

  const handleExportConsolidatedAuditCsv = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(
      `auditoria-consolidada-${timestamp}.csv`,
      ["id", "tipo_evento", "acao", "ator_id", "ator_nome", "ator_email", "alvo", "detalhe", "criado_em"],
      consolidatedAudit.map((entry) => [
        entry.id,
        entry.eventType,
        entry.action,
        entry.actorUserId,
        entry.actorName,
        entry.actorEmail,
        entry.target,
        entry.detail,
        entry.createdAt,
      ]),
    );
  };

  const loadAdmin = (options?: { keepActionsError?: boolean }) => {
    setLoading(true);
    setError(null);
    if (!options?.keepActionsError) {
      setActionError(null);
    }

    getSessionData()
      .then((session) => {
        const typedSession = session as { user: { id: string } };
        setCurrentUserId(typedSession.user.id);
        return (
        Promise.all([
          getAdminData(),
          getAdminAccessData(),
          getAdminPaymentOpsData({ data: { hours: 24, failureLimit: 8 } }),
          getAdminModerationQueueData({
            data: {
              limit: 20,
              status: statusFilter,
              ...(categoryFilter.trim() ? { category: categoryFilter.trim() } : {}),
            },
          }),
          getAdminModerationAuditData({ data: { limit: 12 } }),
          getAdminRoleDirectoryData({ data: { limit: 30 } }),
          getAdminRoleAuditData({
            data: {
              limit: 20,
              ...buildRoleAuditFilters(),
            },
          }),
          getPlatformSettingsData({ data: { limit: 100 } }),
          getAdminConsolidatedAuditData({
            data: {
              limit: 30,
              ...buildConsolidatedAuditFilters(),
            },
          }),
        ])
        );
      })
      .then(([overview, accessData, paymentOpsData, moderationQueue, moderationAudit, roles, roleAuditData, settingsData, consolidatedData]) => {
        setData(overview as AdminData);
        setAccess(accessData as AdminAccess);
        setPaymentOps(paymentOpsData as PaymentOpsData);
        setQueue((moderationQueue as ModerationQueueItem[]) ?? []);
        setAudit((moderationAudit as ModerationAuditItem[]) ?? []);
        const typedRoles = (roles as AdminRoleDirectoryItem[]) ?? [];
        setRoleAudit((roleAuditData as AdminRoleAuditItem[]) ?? []);
        const typedSettings = (settingsData as PlatformSettingItem[]) ?? [];
        setPlatformSettings(typedSettings);
        setConsolidatedAudit((consolidatedData as ConsolidatedAuditItem[]) ?? []);
        setRoleDirectory(typedRoles);
        setSettingDrafts((previous) => {
          const next: Record<string, string> = {};
          for (const setting of typedSettings) {
            next[setting.key] = previous[setting.key] ?? setting.value;
          }
          return next;
        });
        setRoleDrafts((previous) => {
          const next: Record<string, AssignableAdminRole> = {};
          for (const entry of typedRoles) {
            next[entry.userId] = previous[entry.userId] ?? entry.role;
          }
          return next;
        });
        setError(null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Não foi possível carregar o painel admin.";
        if (message.toLowerCase().includes("sessão")) {
          window.location.assign("/login");
          return;
        }
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdmin();
  }, [statusFilter]);

  async function handleModerationDecision(item: ModerationQueueItem, decision: "approve" | "reject") {
    const reason =
      decision === "reject"
        ? window.prompt(`Informe o motivo da rejeição para "${item.name}" (mínimo 5 caracteres):`, item.moderationReason ?? "")
        : undefined;

    if (decision === "reject" && (!reason || reason.trim().length < 5)) {
      setActionError("Rejeição cancelada: informe um motivo com ao menos 5 caracteres.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await moderateAdminProductDecision({
        data: {
          productId: item.id,
          decision,
          reason: reason?.trim() || undefined,
        },
      });

      const [overview, accessData, paymentOpsData, moderationQueue, moderationAudit, roles, roleAuditData, settingsData, consolidatedData] = await Promise.all([
        getAdminData(),
        getAdminAccessData(),
        getAdminPaymentOpsData({ data: { hours: 24, failureLimit: 8 } }),
        getAdminModerationQueueData({
          data: {
            limit: 20,
            status: statusFilter,
            ...(categoryFilter.trim() ? { category: categoryFilter.trim() } : {}),
          },
        }),
        getAdminModerationAuditData({ data: { limit: 12 } }),
        getAdminRoleDirectoryData({ data: { limit: 30 } }),
        getAdminRoleAuditData({
          data: {
            limit: 20,
            ...buildRoleAuditFilters(),
          },
        }),
        getPlatformSettingsData({ data: { limit: 100 } }),
        getAdminConsolidatedAuditData({
          data: {
            limit: 30,
            ...buildConsolidatedAuditFilters(),
          },
        }),
      ]);
      setData(overview as AdminData);
      setAccess(accessData as AdminAccess);
      setPaymentOps(paymentOpsData as PaymentOpsData);
      setQueue((moderationQueue as ModerationQueueItem[]) ?? []);
      setAudit((moderationAudit as ModerationAuditItem[]) ?? []);
      setRoleAudit((roleAuditData as AdminRoleAuditItem[]) ?? []);
      const typedSettings = (settingsData as PlatformSettingItem[]) ?? [];
      setPlatformSettings(typedSettings);
      setConsolidatedAudit((consolidatedData as ConsolidatedAuditItem[]) ?? []);
      const typedRoles = (roles as AdminRoleDirectoryItem[]) ?? [];
      setRoleDirectory(typedRoles);
      setSettingDrafts((previous) => {
        const next: Record<string, string> = {};
        for (const setting of typedSettings) {
          next[setting.key] = previous[setting.key] ?? setting.value;
        }
        return next;
      });
      setRoleDrafts((previous) => {
        const next: Record<string, AssignableAdminRole> = {};
        for (const roleEntry of typedRoles) {
          next[roleEntry.userId] = previous[roleEntry.userId] ?? roleEntry.role;
        }
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível aplicar a decisão de moderação.";
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssignRole(entry: AdminRoleDirectoryItem) {
    const nextRole = roleDrafts[entry.userId] ?? entry.role;
    let confirmAdminPromotion = false;
    let approvalNote: string | undefined;

    if (entry.role !== "admin" && nextRole === "admin") {
      const confirmation = window.prompt(
        `Confirma promoção de ${entry.email} para admin? Digite PROMOVER ADMIN para continuar.`,
        "",
      );
      if ((confirmation ?? "").trim().toUpperCase() !== "PROMOVER ADMIN") {
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
      await assignAdminUserRoleData({
        data: {
          userId: entry.userId,
          role: nextRole,
          confirmAdminPromotion,
          approvalNote,
        },
      });

      const [overview, accessData, paymentOpsData, moderationQueue, moderationAudit, roles, roleAuditData, settingsData, consolidatedData] = await Promise.all([
        getAdminData(),
        getAdminAccessData(),
        getAdminPaymentOpsData({ data: { hours: 24, failureLimit: 8 } }),
        getAdminModerationQueueData({
          data: {
            limit: 20,
            status: statusFilter,
            ...(categoryFilter.trim() ? { category: categoryFilter.trim() } : {}),
          },
        }),
        getAdminModerationAuditData({ data: { limit: 12 } }),
        getAdminRoleDirectoryData({ data: { limit: 30 } }),
        getAdminRoleAuditData({
          data: {
            limit: 20,
            ...buildRoleAuditFilters(),
          },
        }),
        getPlatformSettingsData({ data: { limit: 100 } }),
        getAdminConsolidatedAuditData({
          data: {
            limit: 30,
            ...buildConsolidatedAuditFilters(),
          },
        }),
      ]);

      setData(overview as AdminData);
      setAccess(accessData as AdminAccess);
  setPaymentOps(paymentOpsData as PaymentOpsData);
      setQueue((moderationQueue as ModerationQueueItem[]) ?? []);
      setAudit((moderationAudit as ModerationAuditItem[]) ?? []);
      setRoleAudit((roleAuditData as AdminRoleAuditItem[]) ?? []);
      const typedSettings = (settingsData as PlatformSettingItem[]) ?? [];
      setPlatformSettings(typedSettings);
      setConsolidatedAudit((consolidatedData as ConsolidatedAuditItem[]) ?? []);
      const typedRoles = (roles as AdminRoleDirectoryItem[]) ?? [];
      setRoleDirectory(typedRoles);
      setSettingDrafts((previous) => {
        const next: Record<string, string> = {};
        for (const setting of typedSettings) {
          next[setting.key] = previous[setting.key] ?? setting.value;
        }
        return next;
      });
      setRoleDrafts((previous) => {
        const next: Record<string, AssignableAdminRole> = {};
        for (const roleEntry of typedRoles) {
          next[roleEntry.userId] = previous[roleEntry.userId] ?? roleEntry.role;
        }
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível atualizar o papel do usuário.";
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveSetting(settingKey: string) {
    const nextValue = (settingDrafts[settingKey] ?? "").trim();
    if (!nextValue) {
      setActionError("Informe um valor válido para a configuração.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      await updatePlatformSettingData({ data: { key: settingKey, value: nextValue } });
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
      await updatePlatformSettingData({ data: { key, value } });
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
    if (!access?.canManageRoles || reconcilingPayments) {
      return;
    }

    setReconcilingPayments(true);
    setPaymentActionStatus(null);
    setActionError(null);

    try {
      const result = (await runAdminPaymentReconciliationData({
        data: {
          limit: 50,
          minOrderAgeMinutes: 2,
        },
      })) as PaymentReconciliationData;

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

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated p-7 md:p-9">
          <span className="eyebrow">Admin</span>
          <h1 className="mt-2 text-3xl">Painel administrativo inicial</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Visão operacional de usuários, catálogo e receita para suporte à moderação e governança da plataforma.
          </p>
          {access ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Papel atual: <span className="font-semibold">{access.role}</span> {access.canModerate ? "• pode moderar" : "• somente leitura"}
            </p>
          ) : null}

          {loading ? <StatusNotice variant="loading" message="Carregando visão administrativa..." className="mt-6" /> : null}
          {error ? <StatusNotice variant="error" message={error} className="mt-6" /> : null}

          {!loading && data ? (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Usuários totais</p>
                  <p className="mt-2 text-3xl font-semibold">{data.userCount}</p>
                </article>
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Produtos no catálogo</p>
                  <p className="mt-2 text-3xl font-semibold">{data.productCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Publicados: {data.publishedProductCount} • Rascunhos: {data.draftProductCount}</p>
                </article>
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Receita da plataforma</p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(data.platformRevenueCents)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Taxa: {Math.round(data.platformFeeRate * 100)}% sobre {formatCurrency(data.grossSalesCents)}</p>
                </article>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Pedidos aprovados</p>
                  <p className="mt-2 text-2xl font-semibold">{data.approvedOrdersCount}</p>
                </article>
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Taxa de publicação</p>
                  <p className="mt-2 text-2xl font-semibold">{publishRate}%</p>
                </article>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Pendentes de revisão</p>
                  <p className="mt-2 text-2xl font-semibold">{data.pendingReviewCount}</p>
                </article>
                <article className="panel p-5">
                  <p className="text-sm text-muted-foreground">Produtos rejeitados</p>
                  <p className="mt-2 text-2xl font-semibold">{data.rejectedProductCount}</p>
                </article>
              </div>

              {paymentOps ? (
                <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5" data-testid="payment-ops-section">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Saúde operacional de pagamentos</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Janela dos últimos {paymentOps.windowHours}h para monitorar webhook, falhas e aplicação de eventos.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {access?.canManageRoles ? (
                        <button
                          type="button"
                          className="btn-base btn-primary"
                          onClick={handleRunPaymentReconciliation}
                          disabled={loading || actionLoading || reconcilingPayments}
                        >
                          {reconcilingPayments ? "Conciliando..." : "Rodar conciliação agora"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn-base btn-ghost"
                        onClick={() => loadAdmin({ keepActionsError: true })}
                        disabled={loading || actionLoading || reconcilingPayments}
                      >
                        Atualizar pagamentos
                      </button>
                    </div>
                  </div>

                  {paymentActionStatus ? <StatusNotice variant="success" message={paymentActionStatus} className="mt-4" /> : null}

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <article className="panel p-4">
                      <p className="text-xs text-muted-foreground">Eventos recebidos</p>
                      <p className="mt-2 text-2xl font-semibold">{paymentOps.totalEvents}</p>
                    </article>
                    <article className="panel p-4">
                      <p className="text-xs text-muted-foreground">Aplicados com sucesso</p>
                      <p className="mt-2 text-2xl font-semibold">{paymentOps.appliedEvents}</p>
                    </article>
                    <article className="panel p-4">
                      <p className="text-xs text-muted-foreground">Falhas processadas</p>
                      <p className="mt-2 text-2xl font-semibold">{paymentOps.failedEvents}</p>
                    </article>
                    <article className="panel p-4">
                      <p className="text-xs text-muted-foreground">Pendentes de processamento</p>
                      <p className="mt-2 text-2xl font-semibold">{paymentOps.pendingProcessing}</p>
                    </article>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <article className="panel p-4">
                      <p className="text-xs text-muted-foreground">Último evento</p>
                      <p className="mt-2 text-sm font-medium">
                        {paymentOps.lastEventAt ? new Date(paymentOps.lastEventAt).toLocaleString("pt-BR") : "Sem eventos no período"}
                      </p>
                    </article>
                    <article className="panel p-4">
                      <p className="text-xs text-muted-foreground">Última aplicação com sucesso</p>
                      <p className="mt-2 text-sm font-medium">
                        {paymentOps.lastSuccessAt ? new Date(paymentOps.lastSuccessAt).toLocaleString("pt-BR") : "Sem aplicação no período"}
                      </p>
                    </article>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <h3 className="text-sm font-semibold">Últimas falhas de webhook</h3>
                    {paymentOps.recentFailures.length === 0 ? (
                      <StatusNotice variant="success" message="Nenhuma falha registrada na janela atual." />
                    ) : null}
                    {paymentOps.recentFailures.map((failure) => (
                      <div key={failure.id} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">{failure.provider} • evento {failure.eventId}</p>
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
                            {failure.eventStatus ?? "sem status"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          pedido: {failure.orderId ?? "não vinculado"} • resultado: {failure.processingResult ?? "sem detalhe"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          recebido em {new Date(failure.createdAt).toLocaleString("pt-BR")}
                          {failure.processedAt ? ` • processado em ${new Date(failure.processedAt).toLocaleString("pt-BR")}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-border/60 bg-background/70 p-5">
                  <h2 className="text-lg font-semibold">Categorias mais usadas</h2>
                  <div className="mt-4 grid gap-2">
                    {data.categories.length === 0 ? <StatusNotice variant="empty" message="Sem produtos cadastrados até o momento." /> : null}
                    {data.categories.map((entry) => (
                      <div key={entry.category} className="flex items-center justify-between rounded-xl border border-border/50 bg-background/80 px-3 py-2">
                        <span className="text-sm">{entry.category}</span>
                        <span className="text-sm font-semibold">{entry.productCount}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-border/60 bg-background/70 p-5">
                  <h2 className="text-lg font-semibold">Últimos usuários</h2>
                  <div className="mt-4 grid gap-2">
                    {data.latestUsers.length === 0 ? <StatusNotice variant="empty" message="Nenhum usuário encontrado." /> : null}
                    {data.latestUsers.map((user) => (
                      <div key={`${user.email}-${user.createdAt}`} className="rounded-xl border border-border/50 bg-background/80 px-3 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email} • {user.businessType}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5" data-testid="role-management-section">
                <h2 className="text-lg font-semibold">Últimos produtos</h2>
                <div className="mt-4 grid gap-2">
                  {data.latestProducts.length === 0 ? <StatusNotice variant="empty" message="Nenhum produto cadastrado." /> : null}
                  {data.latestProducts.map((product) => (
                    <div key={product.id} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">{product.status}</span>
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">mod: {product.moderationStatus}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.category} • {formatCurrency(product.priceCents)} • por {product.ownerName}
                      </p>
                      {product.moderationReason ? <p className="mt-1 text-xs text-muted-foreground">Motivo: {product.moderationReason}</p> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Fila de moderação</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-base btn-ghost"
                      onClick={() => loadAdmin()}
                      disabled={loading || actionLoading}
                    >
                      Atualizar fila
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="text-sm text-muted-foreground">
                    Status
                    <select
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as "pending_review" | "approved" | "rejected")}
                    >
                      <option value="pending_review">Pendentes</option>
                      <option value="approved">Aprovados</option>
                      <option value="rejected">Rejeitados</option>
                    </select>
                  </label>

                  <label className="text-sm text-muted-foreground md:col-span-2">
                    Categoria (opcional)
                    <div className="mt-1 flex gap-2">
                      <input
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                        placeholder="Ex.: Educação"
                      />
                      <button
                        type="button"
                        className="btn-base btn-ghost"
                        disabled={loading || actionLoading}
                        onClick={() => loadAdmin({ keepActionsError: true })}
                      >
                        Filtrar
                      </button>
                    </div>
                  </label>
                </div>

                {actionError ? <StatusNotice variant="error" message={actionError} className="mt-4" /> : null}
                {access && !access.canModerate ? (
                  <StatusNotice variant="empty" message="Seu papel atual permite apenas visualização. Ações de moderação exigem perfil moderator/admin." className="mt-4" />
                ) : null}

                <div className="mt-4 grid gap-2">
                  {queue.length === 0 ? <StatusNotice variant="empty" message="Sem produtos pendentes de moderação." /> : null}
                  {queue.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category} • {formatCurrency(item.priceCents)} • {item.ownerName} ({item.ownerEmail})
                          </p>
                        </div>
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">{item.moderationStatus}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {statusFilter === "pending_review" && access?.canModerate ? (
                          <>
                            <button
                              type="button"
                              className="btn-base btn-primary"
                              disabled={actionLoading}
                              onClick={() => handleModerationDecision(item, "approve")}
                            >
                              Aprovar
                            </button>
                            <button
                              type="button"
                              className="btn-base btn-ghost"
                              disabled={actionLoading}
                              onClick={() => handleModerationDecision(item, "reject")}
                            >
                              Rejeitar
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Gestão de papéis administrativos</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Defina acesso de visualização, moderação e administração por usuário.</p>
                    <p className="mt-1 text-xs text-muted-foreground">Promoções para admin exigem confirmação secundária explícita.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-base btn-ghost"
                    onClick={() => loadAdmin({ keepActionsError: true })}
                    disabled={loading || actionLoading}
                  >
                    Atualizar papéis
                  </button>
                </div>

                {access && !access.canManageRoles ? (
                  <StatusNotice
                    variant="empty"
                    message="Somente admins podem alterar papéis. Seu usuário tem acesso apenas para consulta de papéis."
                    className="mt-4"
                  />
                ) : null}

                <div className="mt-4 grid gap-2">
                  {roleDirectory.length === 0 ? <StatusNotice variant="empty" message="Nenhum usuário disponível para gestão de papéis." /> : null}
                  {roleDirectory.map((entry) => {
                    const selectedRole = roleDrafts[entry.userId] ?? entry.role;
                    const isSelf = currentUserId === entry.userId;
                    const assignmentMeta = entry.source ? `origem: ${entry.source}` : "origem: sem papel definido";
                    const approvalMeta =
                      entry.role === "admin" && entry.approvedAt
                        ? `aprovado por ${entry.approvedByName ?? entry.approvedByEmail ?? entry.approvedByUserId ?? "desconhecido"} em ${new Date(entry.approvedAt).toLocaleString("pt-BR")}`
                        : null;

                    return (
                      <div key={entry.userId} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3" data-testid="role-management-row">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">{entry.email} • {entry.businessType}</p>
                            <p className="text-xs text-muted-foreground">Papel atual: {entry.role} • {assignmentMeta}</p>
                            {approvalMeta ? <p className="text-xs text-muted-foreground">{approvalMeta}</p> : null}
                            {entry.role === "admin" && entry.approvalNote ? (
                              <p className="text-xs text-muted-foreground">Justificativa: {entry.approvalNote}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                              value={selectedRole}
                              onChange={(event) => {
                                const role = event.target.value as AssignableAdminRole;
                                setRoleDrafts((previous) => ({
                                  ...previous,
                                  [entry.userId]: role,
                                }));
                              }}
                              disabled={!access?.canManageRoles || actionLoading}
                              aria-label={`Papel de ${entry.email}`}
                            >
                              <option value="none">none</option>
                              <option value="viewer">viewer</option>
                              <option value="moderator">moderator</option>
                              <option value="admin">admin</option>
                            </select>
                            <button
                              type="button"
                              className="btn-base btn-primary"
                              disabled={!access?.canManageRoles || actionLoading || (isSelf && selectedRole !== "admin")}
                              onClick={() => handleAssignRole(entry)}
                              aria-label={`Salvar papel de ${entry.email}`}
                            >
                              Salvar papel
                            </button>
                          </div>
                        </div>
                        {isSelf ? (
                          <p className="mt-2 text-xs text-muted-foreground">Seu usuário não pode ser rebaixado por esta tela para evitar bloqueio administrativo.</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Configurações da plataforma</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Parâmetros versionados com trilha de auditoria de alteração.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-base btn-ghost"
                    onClick={() => loadAdmin({ keepActionsError: true })}
                    disabled={loading || actionLoading}
                  >
                    Atualizar configurações
                  </button>
                </div>

                {access && !access.canManageRoles ? (
                  <StatusNotice
                    variant="empty"
                    message="Somente admins podem alterar configurações. Seu usuário tem acesso apenas de consulta."
                    className="mt-4"
                  />
                ) : null}

                <div className="mt-4 rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                  <p className="text-xs text-muted-foreground">Criar nova configuração</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1.4fr_auto]">
                    <input
                      value={newSettingKey}
                      onChange={(event) => setNewSettingKey(event.target.value)}
                      className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      placeholder="chave.exemplo"
                      disabled={!access?.canManageRoles || actionLoading}
                    />
                    <input
                      value={newSettingValue}
                      onChange={(event) => setNewSettingValue(event.target.value)}
                      className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      placeholder="valor"
                      disabled={!access?.canManageRoles || actionLoading}
                    />
                    <button
                      type="button"
                      className="btn-base btn-primary"
                      onClick={handleCreateSetting}
                      disabled={!access?.canManageRoles || actionLoading}
                    >
                      Criar
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {platformSettings.length === 0 ? <StatusNotice variant="empty" message="Nenhuma configuração registrada ainda." /> : null}
                  {platformSettings.map((setting) => (
                    <div key={setting.key} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                      <div className="grid gap-2 md:grid-cols-[1fr_1.6fr_auto] md:items-center">
                        <p className="text-sm font-medium">{setting.key}</p>
                        <input
                          value={settingDrafts[setting.key] ?? setting.value}
                          onChange={(event) =>
                            setSettingDrafts((previous) => ({
                              ...previous,
                              [setting.key]: event.target.value,
                            }))
                          }
                          className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                          disabled={!access?.canManageRoles || actionLoading}
                        />
                        <button
                          type="button"
                          className="btn-base btn-ghost"
                          onClick={() => handleSaveSetting(setting.key)}
                          disabled={!access?.canManageRoles || actionLoading}
                        >
                          Salvar
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        atualizado por {setting.updatedByName ?? setting.updatedByEmail ?? setting.updatedByUserId ?? "sistema"} em {new Date(setting.updatedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Auditoria administrativa consolidada</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Eventos de moderação, RBAC e configurações em um único timeline.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-base btn-ghost"
                      onClick={() => loadAdmin({ keepActionsError: true })}
                      disabled={loading || actionLoading}
                    >
                      Aplicar filtros
                    </button>
                    <button
                      type="button"
                      className="btn-base btn-ghost"
                      onClick={handleExportConsolidatedAuditCsv}
                      disabled={consolidatedAudit.length === 0}
                    >
                      Exportar CSV
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <label className="text-sm text-muted-foreground">
                    Tipo de evento
                    <select
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      value={consolidatedTypeFilter}
                      onChange={(event) =>
                        setConsolidatedTypeFilter(event.target.value as "all" | "moderation" | "rbac" | "platform_setting")
                      }
                    >
                      <option value="all">Todos</option>
                      <option value="moderation">Moderação</option>
                      <option value="rbac">RBAC</option>
                      <option value="platform_setting">Configuração</option>
                    </select>
                  </label>

                  <label className="text-sm text-muted-foreground md:col-span-1">
                    Ator (nome/email)
                    <input
                      value={consolidatedActorFilter}
                      onChange={(event) => setConsolidatedActorFilter(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      placeholder="Ex.: admin@empresa.com"
                    />
                  </label>

                  <label className="text-sm text-muted-foreground">
                    De
                    <input
                      type="date"
                      value={consolidatedFromFilter}
                      onChange={(event) => setConsolidatedFromFilter(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="text-sm text-muted-foreground">
                    Até
                    <input
                      type="date"
                      value={consolidatedToFilter}
                      onChange={(event) => setConsolidatedToFilter(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-2">
                  {consolidatedAudit.length === 0 ? <StatusNotice variant="empty" message="Sem eventos de auditoria para os filtros atuais." /> : null}
                  {consolidatedAudit.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{entry.target}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">{entry.eventType}</span>
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">{entry.action}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        por {entry.actorName ?? entry.actorEmail ?? entry.actorUserId ?? "sistema"} • {new Date(entry.createdAt).toLocaleString("pt-BR")}
                      </p>
                      {entry.detail ? <p className="mt-1 text-xs text-muted-foreground">Detalhe: {entry.detail}</p> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Auditoria de moderação</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Últimas decisões administrativas registradas na plataforma.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-base btn-ghost"
                    onClick={handleExportModerationAuditCsv}
                    disabled={audit.length === 0}
                  >
                    Exportar CSV
                  </button>
                </div>

                <div className="mt-4 grid gap-2">
                  {audit.length === 0 ? <StatusNotice variant="empty" message="Sem registros de auditoria até o momento." /> : null}
                  {audit.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{entry.productName}</p>
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">{entry.action}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        por {entry.adminName} ({entry.adminEmail}) em {new Date(entry.createdAt).toLocaleString("pt-BR")}
                      </p>
                      {entry.reason ? <p className="mt-1 text-xs text-muted-foreground">Motivo: {entry.reason}</p> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Auditoria de papéis (RBAC)</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Histórico imutável das mudanças de papéis administrativos.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-base btn-ghost"
                      onClick={() => loadAdmin({ keepActionsError: true })}
                      disabled={loading || actionLoading}
                    >
                      Aplicar filtros
                    </button>
                    <button
                      type="button"
                      className="btn-base btn-ghost"
                      onClick={handleExportRoleAuditCsv}
                      disabled={roleAudit.length === 0}
                    >
                      Exportar CSV
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <label className="text-sm text-muted-foreground md:col-span-2">
                    Usuário (nome ou email)
                    <input
                      value={roleAuditUserFilter}
                      onChange={(event) => setRoleAuditUserFilter(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      placeholder="Ex.: joao@empresa.com"
                    />
                  </label>

                  <label className="text-sm text-muted-foreground">
                    Ação
                    <select
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      value={roleAuditActionFilter}
                      onChange={(event) =>
                        setRoleAuditActionFilter(
                          event.target.value as "all" | "grant" | "revoke" | "change" | "promote_admin" | "demote_admin",
                        )
                      }
                    >
                      <option value="all">Todas</option>
                      <option value="grant">Concessão de acesso</option>
                      <option value="revoke">Remoção de acesso</option>
                      <option value="change">Troca de papel</option>
                      <option value="promote_admin">Promoção para admin</option>
                      <option value="demote_admin">Rebaixamento de admin</option>
                    </select>
                  </label>

                  <label className="text-sm text-muted-foreground">
                    De
                    <input
                      type="date"
                      value={roleAuditFromFilter}
                      onChange={(event) => setRoleAuditFromFilter(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="text-sm text-muted-foreground">
                    Até
                    <input
                      type="date"
                      value={roleAuditToFilter}
                      onChange={(event) => setRoleAuditToFilter(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-2">
                  {roleAudit.length === 0 ? <StatusNotice variant="empty" message="Sem alterações de papéis registradas até o momento." /> : null}
                  {roleAudit.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-border/50 bg-background/80 px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{entry.userName} ({entry.userEmail})</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">{entry.action}</span>
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
                            {entry.previousRole} → {entry.newRole}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        por {entry.changedByName ?? entry.changedByEmail ?? entry.changedByUserId ?? "sistema"} • origem {entry.source} • {new Date(entry.createdAt).toLocaleString("pt-BR")}
                      </p>
                      {entry.reason ? <p className="mt-1 text-xs text-muted-foreground">Motivo: {entry.reason}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/painel" className="btn-base btn-ghost">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
