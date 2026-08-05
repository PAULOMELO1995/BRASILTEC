import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, getRequestHost, getRequestProtocol, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  authenticateUser,
  buyProduct,
  getAdminOverview,
  getPaymentWebhookOpsSummary,
  runPaymentGatewayReconciliation,
  listAdminModerationQueue,
  listAdminModerationAudit,
  listAdminRoleAudit,
  listAdminConsolidatedAudit,
  listAdminUserRoles,
  listPlatformSettings,
  countAdminUsers,
  getUserAdminRole,
  createCheckoutOrder,
  createProduct,
  createSession,
  createUser,
  deleteSession,
  getFinanceSummary,
  getAffiliateSummary,
  getMarketplaceProductById,
  listMyNotifications,
  getDashboardSummary,
  listMarketplaceProducts,
  listMyEnrollments,
  listMyLearningTrack,
  listMyOrderTimeline,
  listMyOrders,
  listMyProducts,
  publishProduct,
  markAllMyNotificationsRead,
  markMyNotificationRead,
  moderateAdminProduct,
  setUserAdminRole,
  getSession,
  requestWithdrawal,
  requestPasswordReset,
  requestAffiliate,
  resetPasswordWithToken,
  transitionCheckoutOrderStatus,
  upsertPlatformSetting,
  updateMyLessonProgress,
  type OrderFilters,
  rotateSession,
  type OrderStatus,
  type PaymentMethod,
  type ProductModerationDecision,
  type AdminRole,
  type BusinessType,
} from "./auth-store";

const sessionCookieName = "brasiltec_session";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

type AttemptWindow = {
  count: number;
  resetAt: number;
};

type AdminPermission = "view" | "moderate" | "manage_roles";

const attemptStore = new Map<string, AttemptWindow>();

function setSessionCookie(token: string) {
  const protocol = getRequestProtocol();
  const host = getRequestHost();
  const isLocalHost = host.includes("localhost") || host.includes("127.0.0.1");

  setCookie(sessionCookieName, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: protocol === "https" && !isLocalHost,
    maxAge: 60 * 60 * 8,
  });
}

function normalizeKeyValue(value: string): string {
  return value.trim().toLowerCase();
}

function getRateLimitKey(action: "login" | "register", email: string): string {
  const host = getRequestHost().toLowerCase();
  return `${action}:${host}:${normalizeKeyValue(email)}`;
}

function enforceRateLimit(key: string): void {
  const now = Date.now();
  const current = attemptStore.get(key);

  if (!current || current.resetAt <= now) {
    attemptStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (current.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const waitSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new Error(`Muitas tentativas. Aguarde ${waitSeconds}s e tente novamente.`);
  }

  current.count += 1;
  attemptStore.set(key, current);
}

function clearRateLimit(key: string): void {
  attemptStore.delete(key);
}

function parseEnvEmailList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function readSessionCookie(): string {
  const token = getCookie(sessionCookieName);
  if (!token) {
    throw new Error("Sessão não encontrada.");
  }
  return token;
}

async function requireSessionUser() {
  const token = readSessionCookie();
  const session = await getSession(token);
  if (!session) {
    throw new Error("Sessão não encontrada.");
  }
  return session.user;
}

function resolveAdminRoleFromEnv(email: string): AdminRole {
  const normalizedEmail = email.trim().toLowerCase();
  const admins = parseEnvEmailList(process.env["ADMIN_EMAILS"]);
  const moderators = parseEnvEmailList(process.env["MODERATOR_EMAILS"]);
  const viewers = parseEnvEmailList(process.env["ADMIN_VIEWER_EMAILS"]);

  const hasRoleConfig = admins.length > 0 || moderators.length > 0 || viewers.length > 0;

  if (!hasRoleConfig) {
    return "none";
  }

  if (admins.includes(normalizedEmail)) return "admin";
  if (moderators.includes(normalizedEmail)) return "moderator";
  if (viewers.includes(normalizedEmail)) return "viewer";
  return "none";
}

async function resolveAdminRole(user: { id: string; email: string }): Promise<AdminRole> {
  const persisted = await getUserAdminRole(user.id);
  if (persisted !== "none") {
    return persisted;
  }

  const fromEnv = resolveAdminRoleFromEnv(user.email);
  if (fromEnv !== "none") {
    await setUserAdminRole(user.id, fromEnv, null, "env-sync");
    return fromEnv;
  }

  const hasAnyRoleConfig =
    parseEnvEmailList(process.env["ADMIN_EMAILS"]).length > 0 ||
    parseEnvEmailList(process.env["MODERATOR_EMAILS"]).length > 0 ||
    parseEnvEmailList(process.env["ADMIN_VIEWER_EMAILS"]).length > 0;

  // For local/unconfigured environments, bootstrap first access as admin to preserve existing developer workflow.
  if (!hasAnyRoleConfig) {
    await setUserAdminRole(user.id, "admin", null, "local-bootstrap");
    return "admin";
  }

  return "none";
}

function hasAdminPermission(role: AdminRole, permission: AdminPermission): boolean {
  if (permission === "view") {
    return role === "viewer" || role === "moderator" || role === "admin";
  }
  if (permission === "moderate") {
    return role === "moderator" || role === "admin";
  }
  if (permission === "manage_roles") {
    return role === "admin";
  }
  return false;
}

async function requireAdminAccess(user: { id: string; email: string }, permission: AdminPermission = "view"): Promise<AdminRole> {
  const role = await resolveAdminRole(user);
  if (!hasAdminPermission(role, permission)) {
    throw new Error("Acesso administrativo não autorizado.");
  }
  return role;
}

const businessTypes = ["Produtor digital", "Infoprodutor", "Afiliado", "Agência", "E-commerce", "Serviços"] as const;

const registerSchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().email(),
  password: z.string().min(8),
  businessType: z.enum(businessTypes),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

const supportContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  senderEmail: z.string().trim().email(),
  recipientEmail: z.string().trim().email().optional(),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(12),
  password: z.string().min(8),
});

const createProductSchema = z.object({
  name: z.string().trim().min(3),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2),
  priceCents: z.number().int().positive(),
});

const publishProductSchema = z.object({
  productId: z.string().trim().min(6),
});

const buyProductSchema = z.object({
  productId: z.string().trim().min(6),
  paymentMethod: z.enum(["PIX", "Cartão", "Transferência", "Boleto"]),
});

const transitionOrderSchema = z.object({
  orderId: z.string().trim().min(6),
  status: z.enum(["approved", "declined", "refunded"]),
});

const orderTimelineSchema = z.object({
  orderId: z.string().trim().min(6),
});

const learningTrackSchema = z.object({
  productId: z.string().trim().min(6),
});

const lessonProgressSchema = z.object({
  lessonId: z.string().trim().min(6),
  completed: z.boolean(),
});

const orderFiltersSchema = z.object({
  status: z.enum(["pending", "approved", "declined", "refunded"]).optional(),
  productId: z.string().trim().min(6).optional(),
  fromCreatedAt: z.string().datetime().optional(),
  toCreatedAt: z.string().datetime().optional(),
});

const marketplaceProductSchema = z.object({
  productId: z.string().trim().min(6),
});

const requestWithdrawalSchema = z.object({
  amountCents: z.number().int().positive(),
  method: z.string().trim().min(2),
});

const readNotificationSchema = z.object({
  notificationId: z.string().trim().min(6),
});

const adminModerationQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  status: z.enum(["pending_review", "approved", "rejected"]).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  fromCreatedAt: z.string().datetime().optional(),
  toCreatedAt: z.string().datetime().optional(),
});

const adminModerationAuditQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
});

const adminConsolidatedAuditQuerySchema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
  eventType: z.enum(["moderation", "rbac", "platform_setting"]).optional(),
  actorQuery: z.string().trim().min(2).max(120).optional(),
  fromCreatedAt: z.string().datetime().optional(),
  toCreatedAt: z.string().datetime().optional(),
});

const adminRoleDirectoryQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
});

const adminRoleAuditQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  userQuery: z.string().trim().min(2).max(120).optional(),
  action: z.enum(["grant", "revoke", "change", "promote_admin", "demote_admin"]).optional(),
  fromCreatedAt: z.string().datetime().optional(),
  toCreatedAt: z.string().datetime().optional(),
});

const adminRoleAssignmentSchema = z.object({
  userId: z.string().trim().min(6),
  role: z.enum(["none", "viewer", "moderator", "admin"]),
  confirmAdminPromotion: z.boolean().optional(),
  approvalNote: z.string().trim().max(300).optional(),
});

const adminPlatformSettingsQuerySchema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
});

const adminPaymentOpsQuerySchema = z.object({
  hours: z.number().int().min(1).max(168).optional(),
  failureLimit: z.number().int().min(1).max(50).optional(),
});

const adminPaymentReconcileSchema = z.object({
  limit: z.number().int().min(1).max(300).optional(),
  minOrderAgeMinutes: z.number().int().min(0).max(1440).optional(),
});

function supportRateLimitKey(senderEmail: string, recipientEmail: string): string {
  const host = getRequestHost().toLowerCase();
  return `support:${host}:${normalizeKeyValue(senderEmail)}:${normalizeKeyValue(recipientEmail)}`;
}

function supportRecipientsAllowlist(): string[] {
  const fromEnv = parseEnvEmailList(process.env["SUPPORT_ALLOWED_RECIPIENTS"]);
  const defaultRecipient = normalizeKeyValue(process.env["SUPPORT_DEFAULT_RECIPIENT"] ?? "suporte@brasiltec.com");
  if (defaultRecipient && !fromEnv.includes(defaultRecipient)) {
    fromEnv.push(defaultRecipient);
  }
  return fromEnv;
}

function resolveSupportRecipient(requestedRecipient: string | undefined): string {
  const allowlist = supportRecipientsAllowlist();
  const normalizedRequested = requestedRecipient ? normalizeKeyValue(requestedRecipient) : "";

  if (!normalizedRequested) {
    if (allowlist.length === 0) {
      throw new Error("Nenhum destinatário de suporte foi configurado.");
    }
    return allowlist[0] as string;
  }

  if (!allowlist.includes(normalizedRequested)) {
    throw new Error("Destinatário de suporte não autorizado.");
  }

  return normalizedRequested;
}

type SupportEmailDispatchInput = {
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  message: string;
};

type SupportEmailDispatchResult = {
  delivered: boolean;
  provider: "resend" | "log";
  messageId: string | null;
};

async function dispatchSupportEmail(input: SupportEmailDispatchInput): Promise<SupportEmailDispatchResult> {
  const provider = (process.env["SUPPORT_EMAIL_PROVIDER"] ?? "log").trim().toLowerCase();

  if (provider === "resend") {
    const apiKey = process.env["SUPPORT_EMAIL_API_KEY"]?.trim();
    const fromEmail = process.env["SUPPORT_EMAIL_FROM"]?.trim();
    if (!apiKey || !fromEmail) {
      throw new Error("Configuração de email incompleta: defina SUPPORT_EMAIL_API_KEY e SUPPORT_EMAIL_FROM.");
    }

    const payload = {
      from: fromEmail,
      to: [input.recipientEmail],
      subject: `[Suporte Brasiltec] ${input.subject}`,
      text: [
        `Nome: ${input.senderName}`,
        `Email: ${input.senderEmail}`,
        `Destinatário: ${input.recipientEmail}`,
        "",
        "Mensagem:",
        input.message,
      ].join("\n"),
      reply_to: input.senderEmail,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Falha no envio de email (${response.status}): ${body}`);
    }

    const result = (await response.json()) as { id?: string };
    return {
      delivered: true,
      provider: "resend",
      messageId: result.id ?? null,
    };
  }

  if (provider !== "log") {
    throw new Error("Provedor de email inválido. Use SUPPORT_EMAIL_PROVIDER=log ou resend.");
  }

  console.info("[support-email:log]", {
    to: input.recipientEmail,
    from: input.senderEmail,
    senderName: input.senderName,
    subject: input.subject,
    message: input.message,
  });

  return {
    delivered: false,
    provider: "log",
    messageId: null,
  };
}

const adminPlatformSettingUpsertSchema = z.object({
  key: z.string().trim().min(3).max(80).regex(/^[a-z0-9._-]+$/i, "Chave inválida. Use letras, números, ponto, traço e underscore."),
  value: z.string().trim().min(1).max(500),
});

const adminModerationDecisionSchema = z
  .object({
    productId: z.string().trim().min(6),
    decision: z.enum(["approve", "reject"]),
    reason: z.string().trim().max(300).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && (!value.reason || value.reason.length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um motivo de ao menos 5 caracteres para rejeição.",
        path: ["reason"],
      });
    }
  });

export const getAffiliateData = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return getAffiliateSummary(user.id);
});

export const requestAffiliateAccess = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return requestAffiliate(user.id);
});

export const registerUser = createServerFn({ method: "POST" })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    const rateLimitKey = getRateLimitKey("register", data.email);
    enforceRateLimit(rateLimitKey);

    const user = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      businessType: data.businessType as BusinessType,
    });

    const session = await createSession(user.id);
    setSessionCookie(session.tokenHash);
    clearRateLimit(rateLimitKey);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessType: user.businessType,
      },
    };
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const rateLimitKey = getRateLimitKey("login", data.email);
    enforceRateLimit(rateLimitKey);

    const user = await authenticateUser({
      email: data.email,
      password: data.password,
    });

    const session = await createSession(user.id);
    setSessionCookie(session.tokenHash);
    clearRateLimit(rateLimitKey);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessType: user.businessType,
      },
    };
  });

export const getSessionData = createServerFn({ method: "POST" })
  .handler(async () => {
    const token = readSessionCookie();
    const session = await getSession(token);
    if (!session) {
      throw new Error("Sessão não encontrada.");
    }

    const rotated = await rotateSession(token);
    if (rotated) {
      setSessionCookie(rotated.token);
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        businessType: session.user.businessType,
      },
    };
  });

export const logoutUser = createServerFn({ method: "POST" })
  .handler(async () => {
    const token = getCookie(sessionCookieName);
    if (token) {
      await deleteSession(token);
    }
    deleteCookie(sessionCookieName, { path: "/" });
    return { ok: true };
  });

export const requestPasswordResetEmail = createServerFn({ method: "POST" })
  .validator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const result = await requestPasswordReset(data.email);
    return result;
  });

export const sendSupportContactEmail = createServerFn({ method: "POST" })
  .validator(supportContactSchema)
  .handler(async ({ data }) => {
    const recipientEmail = resolveSupportRecipient(data.recipientEmail);
    const key = supportRateLimitKey(data.senderEmail, recipientEmail);
    enforceRateLimit(key);

    const dispatchResult = await dispatchSupportEmail({
      senderName: data.name,
      senderEmail: data.senderEmail,
      recipientEmail,
      subject: data.subject,
      message: data.message,
    });

    clearRateLimit(key);

    return {
      ok: true as const,
      recipientEmail,
      provider: dispatchResult.provider,
      delivered: dispatchResult.delivered,
      messageId: dispatchResult.messageId,
    };
  });

export const resetPasswordByToken = createServerFn({ method: "POST" })
  .validator(resetPasswordSchema)
  .handler(async ({ data }) => {
    await resetPasswordWithToken(data.token, data.password);
    return { ok: true };
  });

export const getDashboardData = createServerFn({ method: "POST" }).handler(async () => getDashboardSummary());

export const getAdminData = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  await requireAdminAccess(user, "view");
  return getAdminOverview();
});

export const getAdminPaymentOpsData = createServerFn({ method: "POST" })
  .validator(adminPaymentOpsQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");
    return getPaymentWebhookOpsSummary(data?.hours ?? 24, data?.failureLimit ?? 10);
  });

export const runAdminPaymentReconciliationData = createServerFn({ method: "POST" })
  .validator(adminPaymentReconcileSchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "manage_roles");

    const options: { limit?: number; minOrderAgeMinutes?: number } = {
      ...(data?.limit !== undefined ? { limit: data.limit } : {}),
      ...(data?.minOrderAgeMinutes !== undefined ? { minOrderAgeMinutes: data.minOrderAgeMinutes } : {}),
    };

    return runPaymentGatewayReconciliation(Object.keys(options).length > 0 ? options : undefined);
  });

export const getAdminAccessData = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  const role = await requireAdminAccess(user, "view");
  return {
    role,
    canModerate: hasAdminPermission(role, "moderate"),
    canManageRoles: hasAdminPermission(role, "manage_roles"),
  };
});

export const getAdminRoleDirectoryData = createServerFn({ method: "POST" })
  .validator(adminRoleDirectoryQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");
    return listAdminUserRoles(data?.limit ?? 30);
  });

export const getPlatformSettingsData = createServerFn({ method: "POST" })
  .validator(adminPlatformSettingsQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");
    return listPlatformSettings(data?.limit ?? 100);
  });

export const updatePlatformSettingData = createServerFn({ method: "POST" })
  .validator(adminPlatformSettingUpsertSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "manage_roles");
    return upsertPlatformSetting(data.key, data.value, user.id);
  });

export const getAdminRoleAuditData = createServerFn({ method: "POST" })
  .validator(adminRoleAuditQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");
    const filters = {
      ...(data?.userQuery ? { userQuery: data.userQuery } : {}),
      ...(data?.action ? { action: data.action } : {}),
      ...(data?.fromCreatedAt ? { fromCreatedAt: data.fromCreatedAt } : {}),
      ...(data?.toCreatedAt ? { toCreatedAt: data.toCreatedAt } : {}),
    };

    return listAdminRoleAudit(data?.limit ?? 20, filters);
  });

export const assignAdminUserRoleData = createServerFn({ method: "POST" })
  .validator(adminRoleAssignmentSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "manage_roles");

    const currentRole = await getUserAdminRole(data.userId);
    const isAdminPromotion = currentRole !== "admin" && data.role === "admin";
    if (isAdminPromotion && !data.confirmAdminPromotion) {
      throw new Error("Promoção para admin exige segunda confirmação explícita.");
    }
    if (isAdminPromotion && (!data.approvalNote || data.approvalNote.trim().length < 5)) {
      throw new Error("Promoção para admin exige justificativa com ao menos 5 caracteres.");
    }

    const isAdminDowngrade = currentRole === "admin" && data.role !== "admin";
    if (isAdminDowngrade) {
      const adminCount = await countAdminUsers();
      if (adminCount <= 1) {
        throw new Error("Operação bloqueada: não é permitido remover ou rebaixar o último admin da plataforma.");
      }
    }

    if (user.id === data.userId && data.role !== "admin") {
      throw new Error("Não é permitido remover seu próprio acesso administrativo principal.");
    }

    await setUserAdminRole(data.userId, data.role, user.id, "admin-panel", {
      approvedByUserId: isAdminPromotion ? user.id : null,
      approvalNote: isAdminPromotion ? data.approvalNote ?? null : null,
    });
    return { ok: true };
  });

export const getAdminModerationQueueData = createServerFn({ method: "POST" })
  .validator(adminModerationQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");
    const filters = {
      ...(data?.status ? { status: data.status } : {}),
      ...(data?.category ? { category: data.category } : {}),
      ...(data?.fromCreatedAt ? { fromCreatedAt: data.fromCreatedAt } : {}),
      ...(data?.toCreatedAt ? { toCreatedAt: data.toCreatedAt } : {}),
    };

    return listAdminModerationQueue(data?.limit ?? 20, filters);
  });

export const getAdminModerationAuditData = createServerFn({ method: "POST" })
  .validator(adminModerationAuditQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");
    return listAdminModerationAudit(data?.limit ?? 20);
  });

export const getAdminConsolidatedAuditData = createServerFn({ method: "POST" })
  .validator(adminConsolidatedAuditQuerySchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "view");

    const filters = {
      ...(data?.eventType ? { eventType: data.eventType } : {}),
      ...(data?.actorQuery ? { actorQuery: data.actorQuery } : {}),
      ...(data?.fromCreatedAt ? { fromCreatedAt: data.fromCreatedAt } : {}),
      ...(data?.toCreatedAt ? { toCreatedAt: data.toCreatedAt } : {}),
    };

    return listAdminConsolidatedAudit(data?.limit ?? 30, filters);
  });

export const moderateAdminProductDecision = createServerFn({ method: "POST" })
  .validator(adminModerationDecisionSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await requireAdminAccess(user, "moderate");
    return moderateAdminProduct(user.id, data.productId, data.decision as ProductModerationDecision, data.reason ?? null);
  });

export const createProductDraft = createServerFn({ method: "POST" })
  .validator(createProductSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return createProduct(user.id, data);
  });

export const publishProductById = createServerFn({ method: "POST" })
  .validator(publishProductSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return publishProduct(user.id, data.productId);
  });

export const getMyProducts = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return listMyProducts(user.id);
});

export const getMarketplaceProducts = createServerFn({ method: "POST" }).handler(async () => listMarketplaceProducts());

export const getMarketplaceProductDetails = createServerFn({ method: "POST" })
  .validator(marketplaceProductSchema)
  .handler(async ({ data }) => {
    return getMarketplaceProductById(data.productId);
  });

export const buyMarketplaceProduct = createServerFn({ method: "POST" })
  .validator(buyProductSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return buyProduct(user.id, data.productId, data.paymentMethod as PaymentMethod);
  });

export const createMarketplaceCheckoutOrder = createServerFn({ method: "POST" })
  .validator(buyProductSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return createCheckoutOrder(user.id, data.productId, data.paymentMethod as PaymentMethod);
  });

export const transitionMarketplaceOrderStatus = createServerFn({ method: "POST" })
  .validator(transitionOrderSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return transitionCheckoutOrderStatus(user.id, data.orderId, data.status as Exclude<OrderStatus, "pending">);
  });

export const getMyOrders = createServerFn({ method: "POST" })
  .validator(orderFiltersSchema.optional())
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    const filters: OrderFilters = {
      status: data?.status,
      productId: data?.productId,
      fromCreatedAt: data?.fromCreatedAt,
      toCreatedAt: data?.toCreatedAt,
    };
    return listMyOrders(user.id, filters);
  });

export const getMyOrderTimeline = createServerFn({ method: "POST" })
  .validator(orderTimelineSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return listMyOrderTimeline(user.id, data.orderId);
  });

export const getMyLearningTrack = createServerFn({ method: "POST" })
  .validator(learningTrackSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return listMyLearningTrack(user.id, data.productId);
  });

export const setLessonProgress = createServerFn({ method: "POST" })
  .validator(lessonProgressSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return updateMyLessonProgress(user.id, data.lessonId, data.completed);
  });

export const getMyEnrollments = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return listMyEnrollments(user.id);
});

export const getFinanceData = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return getFinanceSummary(user.id);
});

export const createWithdrawalRequest = createServerFn({ method: "POST" })
  .validator(requestWithdrawalSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    return requestWithdrawal(user.id, data.amountCents, data.method);
  });

export const getMyNotificationsData = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  return listMyNotifications(user.id, 30);
});

export const readMyNotification = createServerFn({ method: "POST" })
  .validator(readNotificationSchema)
  .handler(async ({ data }) => {
    const user = await requireSessionUser();
    await markMyNotificationRead(user.id, data.notificationId);
    return { ok: true };
  });

export const readAllMyNotifications = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireSessionUser();
  await markAllMyNotificationsRead(user.id);
  return { ok: true };
});
