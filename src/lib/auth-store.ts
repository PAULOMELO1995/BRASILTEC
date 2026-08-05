import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ensureDatabaseSchema, isPostgresEnabled, isSqliteEnabled, postgresQuery, sqliteAll, sqliteGet, sqliteRun } from "./db";

export type BusinessType = "Produtor digital" | "Infoprodutor" | "Afiliado" | "Agência" | "E-commerce" | "Serviços";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  businessType: BusinessType;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionRecord = {
  tokenHash: string;
  userId: string;
  createdAt: string;
  lastLoginAt: string;
  expiresAt: string;
};

export type ProductStatus = "draft" | "published";
export type ProductModerationStatus = "pending_review" | "approved" | "rejected";
export type ProductModerationDecision = "approve" | "reject";
export type AdminRole = "none" | "viewer" | "moderator" | "admin";
export type OrderStatus = "pending" | "approved" | "declined" | "refunded";
export type PaymentMethod = "PIX" | "Cartão" | "Transferência" | "Boleto";
export type PaymentProvider = "mock" | "gateway_webhook";
export type PaymentWebhookStatus = Exclude<OrderStatus, "pending">;

export type CheckoutOrderResult = {
  orderId: string;
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  paymentReference: string | null;
  providerCheckoutUrl: string | null;
};

export type ProcessPaymentWebhookInput = {
  provider: string;
  eventId: string;
  orderId: string;
  status: PaymentWebhookStatus;
  providerPaymentId?: string | null;
  signature?: string | null;
  payload?: string | null;
  skipSignatureValidation?: boolean;
};

export type ProcessPaymentWebhookResult = {
  accepted: boolean;
  duplicate: boolean;
  applied: boolean;
  orderId: string;
  orderStatus: OrderStatus | null;
  message: string;
};

export type OrderRecord = {
  id: string;
  buyerUserId: string;
  productId: string;
  productName: string;
  amountCents: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderFilters = {
  status?: OrderStatus | undefined;
  productId?: string | undefined;
  fromCreatedAt?: string | undefined;
  toCreatedAt?: string | undefined;
};

export type OrderTimelineEvent = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

export type ProductRecord = {
  id: string;
  ownerUserId: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  status: ProductStatus;
  moderationStatus: ProductModerationStatus;
  moderationReason: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type EnrollmentRecord = {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  productName: string;
  productDescription: string;
};

export type LearningLessonRecord = {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
};

export type LearningModuleRecord = {
  id: string;
  productId: string;
  title: string;
  sortOrder: number;
  lessons: LearningLessonRecord[];
};

export type FinanceSummary = {
  grossSalesCents: number;
  platformFeeRate: number;
  platformFeeCents: number;
  netSalesCents: number;
  withdrawApprovedCents: number;
  withdrawRequestedCents: number;
  reservedWithdrawCents: number;
  availableBalanceCents: number;
  recentWithdrawals: Array<{
    id: string;
    amountCents: number;
    method: string;
    status: string;
    createdAt: string;
  }>;
};

type AffiliateStatus = "pending" | "approved" | "rejected";

export type AffiliateSummary = {
  id: string;
  status: AffiliateStatus;
  referralCode: string;
  referralLink: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = "order_approved" | "withdrawal_requested" | "affiliate_pending";

export type NotificationRecord = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type AdminCategorySummary = {
  category: string;
  productCount: number;
};

export type AdminProductSummary = {
  id: string;
  ownerUserId: string;
  ownerName: string;
  name: string;
  category: string;
  status: ProductStatus;
  moderationStatus: ProductModerationStatus;
  moderationReason: string | null;
  priceCents: number;
  createdAt: string;
};

export type AdminModerationQueueItem = {
  id: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  category: string;
  status: ProductStatus;
  moderationStatus: ProductModerationStatus;
  moderationReason: string | null;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminModerationQueueFilters = {
  status?: ProductModerationStatus;
  category?: string;
  fromCreatedAt?: string;
  toCreatedAt?: string;
};

export type AdminModerationAuditLog = {
  id: string;
  productId: string;
  productName: string;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
  action: ProductModerationDecision;
  reason: string | null;
  createdAt: string;
};

export type AdminUserRoleDirectoryItem = {
  userId: string;
  name: string;
  email: string;
  businessType: BusinessType;
  role: AdminRole;
  assignedByUserId: string | null;
  source: string | null;
  approvedByUserId: string | null;
  approvedByName: string | null;
  approvedByEmail: string | null;
  approvedAt: string | null;
  approvalNote: string | null;
  updatedAt: string;
};

export type AdminRoleAuditLog = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: "grant" | "revoke" | "change" | "promote_admin" | "demote_admin";
  previousRole: AdminRole;
  newRole: AdminRole;
  changedByUserId: string | null;
  changedByName: string | null;
  changedByEmail: string | null;
  source: string;
  reason: string | null;
  createdAt: string;
};

export type AdminRoleAuditFilters = {
  userQuery?: string;
  action?: "grant" | "revoke" | "change" | "promote_admin" | "demote_admin";
  fromCreatedAt?: string;
  toCreatedAt?: string;
};

export type PlatformSettingRecord = {
  key: string;
  value: string;
  updatedByUserId: string | null;
  updatedByName: string | null;
  updatedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminConsolidatedAuditEventType = "moderation" | "rbac" | "platform_setting";

export type AdminConsolidatedAuditLog = {
  id: string;
  eventType: AdminConsolidatedAuditEventType;
  action: string;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  target: string;
  detail: string | null;
  createdAt: string;
};

export type AdminConsolidatedAuditFilters = {
  eventType?: AdminConsolidatedAuditEventType;
  actorQuery?: string;
  fromCreatedAt?: string;
  toCreatedAt?: string;
};

export type AdminOverview = {
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
  categories: AdminCategorySummary[];
  latestUsers: Array<Pick<UserRecord, "name" | "email" | "businessType" | "createdAt">>;
  latestProducts: AdminProductSummary[];
};

export type PaymentWebhookFailureRecord = {
  id: string;
  provider: string;
  eventId: string;
  orderId: string | null;
  eventStatus: string | null;
  processingResult: string | null;
  createdAt: string;
  processedAt: string | null;
};

export type PaymentWebhookOpsSummary = {
  windowHours: number;
  totalEvents: number;
  pendingProcessing: number;
  appliedEvents: number;
  failedEvents: number;
  lastEventAt: string | null;
  lastSuccessAt: string | null;
  recentFailures: PaymentWebhookFailureRecord[];
};

export type PaymentReconciliationIssue = {
  orderId: string;
  message: string;
};

export type PaymentReconciliationSummary = {
  provider: "mercado_pago";
  checkedOrders: number;
  updatedOrders: number;
  unchangedOrders: number;
  skippedOrders: number;
  issues: PaymentReconciliationIssue[];
  startedAt: string;
  completedAt: string;
};

type PasswordResetRecord = {
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
};

export type PasswordResetRequestResult = {
  ok: true;
  resetToken?: string;
};

type StoreFile = {
  users: UserRecord[];
  sessions: SessionRecord[];
  passwordResets: PasswordResetRecord[];
  notifications: NotificationRecord[];
};

const storePath = join(process.cwd(), ".data", "brasiltec-store.json");
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;
const SESSION_CLEANUP_INTERVAL_MS = 1000 * 60 * 5;
const PASSWORD_RESET_DURATION_MS = 1000 * 60 * 30;
const PLATFORM_FEE_RATE = 0.1;

type SessionRotationFallback = {
  nextTokenDigest: string;
  expiresAtMs: number;
};

const sessionRotationFallbacks = new Map<string, SessionRotationFallback>();

let lastSessionCleanupAt = 0;

const emptyStore: StoreFile = {
  users: [],
  sessions: [],
  passwordResets: [],
  notifications: [],
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function toOrderStatus(raw: string): OrderStatus {
  if (raw === "approved" || raw === "pending" || raw === "declined" || raw === "refunded") {
    return raw;
  }
  if (raw === "failed") {
    return "declined";
  }
  return "pending";
}

function toModerationStatus(raw: string | null | undefined): ProductModerationStatus {
  if (raw === "pending_review" || raw === "approved" || raw === "rejected") {
    return raw;
  }
  return "approved";
}

function toAdminRole(raw: string | null | undefined): AdminRole {
  if (raw === "viewer" || raw === "moderator" || raw === "admin") {
    return raw;
  }
  return "none";
}

function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (current === "pending" && (next === "approved" || next === "declined")) return true;
  if (current === "approved" && next === "refunded") return true;
  return false;
}

function resolvePaymentProviderMode(): PaymentProvider {
  return process.env["PAYMENT_GATEWAY_MODE"] === "webhook" ? "gateway_webhook" : "mock";
}

function isMercadoPagoGatewaySelected(): boolean {
  const raw = process.env["PAYMENT_GATEWAY_PROVIDER"];
  if (!raw) return true;
  return raw.trim().toLowerCase() === "mercado_pago";
}

function requiredMercadoPagoAccessToken(): string {
  const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"]?.trim();
  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado para checkout real.");
  }
  return accessToken;
}

function resolvePaymentReturnBaseUrl(): string | null {
  const baseUrl = process.env["APP_BASE_URL"]?.trim() ?? process.env["VITE_APP_BASE_URL"]?.trim() ?? "";
  if (!baseUrl) return null;
  return baseUrl.replace(/\/+$/, "");
}

function resolveWebhookNotificationUrl(): string | null {
  const explicitUrl = process.env["PAYMENT_WEBHOOK_URL"]?.trim();
  if (explicitUrl) return explicitUrl;

  const baseUrl = resolvePaymentReturnBaseUrl();
  if (!baseUrl) return null;
  return `${baseUrl}/api/payments/webhook`;
}

function buildPaymentReference(orderId: string): string {
  const suffix = orderId.replace(/[^a-z0-9]/gi, "").slice(-10).toUpperCase();
  return `BT-${suffix}`;
}

async function getUserEmailByIdPostgres(userId: string): Promise<string | null> {
  const rows = await postgresQuery<{ email: string }>(
    `SELECT email FROM users WHERE id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0]?.email ?? null;
}

async function getUserEmailByIdSqlite(userId: string): Promise<string | null> {
  const row = await sqliteGet<{ email: string }>(
    `SELECT email FROM users WHERE id = ? LIMIT 1`,
    [userId],
  );
  return row?.email ?? null;
}

function buildMercadoPagoPaymentMethods(method: PaymentMethod): {
  excluded_payment_types?: Array<{ id: string }>;
  installments?: number;
} {
  if (method === "PIX") {
    return { excluded_payment_types: [{ id: "ticket" }, { id: "credit_card" }, { id: "debit_card" }, { id: "prepaid_card" }] };
  }
  if (method === "Boleto") {
    return { excluded_payment_types: [{ id: "bank_transfer" }, { id: "credit_card" }, { id: "debit_card" }, { id: "prepaid_card" }] };
  }
  if (method === "Cartão") {
    return { excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }], installments: 12 };
  }
  return {};
}

async function createMercadoPagoCheckoutPreference(input: {
  orderId: string;
  paymentReference: string;
  title: string;
  amountCents: number;
  payerEmail: string | null;
  paymentMethod: PaymentMethod;
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const accessToken = requiredMercadoPagoAccessToken();
  const currency = (process.env["MERCADO_PAGO_CURRENCY"] ?? "BRL").trim().toUpperCase();
  const amount = Math.max(input.amountCents / 100, 0.01);
  const baseUrl = resolvePaymentReturnBaseUrl();
  const notificationUrl = resolveWebhookNotificationUrl();

  const payload: {
    external_reference: string;
    items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
    }>;
    metadata: { order_id: string; payment_reference: string };
    back_urls?: { success: string; failure: string; pending: string };
    auto_return?: "approved";
    payer?: { email: string };
    notification_url?: string;
    payment_methods?: { excluded_payment_types?: Array<{ id: string }>; installments?: number };
  } = {
    external_reference: input.orderId,
    items: [
      {
        id: input.orderId,
        title: input.title,
        quantity: 1,
        unit_price: Number(amount.toFixed(2)),
        currency_id: currency,
      },
    ],
    metadata: {
      order_id: input.orderId,
      payment_reference: input.paymentReference,
    },
  };

  if (baseUrl) {
    payload.back_urls = {
      success: `${baseUrl}/checkout?payment=success&orderId=${encodeURIComponent(input.orderId)}`,
      failure: `${baseUrl}/checkout?payment=failure&orderId=${encodeURIComponent(input.orderId)}`,
      pending: `${baseUrl}/checkout?payment=pending&orderId=${encodeURIComponent(input.orderId)}`,
    };
    payload.auto_return = "approved";
  }

  if (input.payerEmail) {
    payload.payer = { email: input.payerEmail };
  }

  if (notificationUrl) {
    payload.notification_url = notificationUrl;
  }

  const methodRestrictions = buildMercadoPagoPaymentMethods(input.paymentMethod);
  if (Object.keys(methodRestrictions).length > 0) {
    payload.payment_methods = methodRestrictions;
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "x-idempotency-key": input.orderId,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 240);
    throw new Error(`Mercado Pago retornou erro ao criar preferência (${response.status}): ${details}`);
  }

  const body = (await response.json()) as {
    id?: unknown;
    init_point?: unknown;
    sandbox_init_point?: unknown;
  };

  const preferenceId = typeof body.id === "string" ? body.id : "";
  const checkoutUrl =
    typeof body.init_point === "string" && body.init_point
      ? body.init_point
      : typeof body.sandbox_init_point === "string" && body.sandbox_init_point
        ? body.sandbox_init_point
        : "";

  if (!preferenceId || !checkoutUrl) {
    throw new Error("Mercado Pago respondeu sem dados de preferência válidos.");
  }

  return { preferenceId, checkoutUrl };
}

function validateWebhookSignature(payload: string, signature: string | null | undefined): void {
  const expectedSecret = process.env["PAYMENT_WEBHOOK_SECRET"];
  if (!expectedSecret) {
    // When no secret is configured, keep development workflow simple.
    return;
  }

  if (!signature) {
    throw new Error("Assinatura do webhook ausente.");
  }

  const expected = createHmac("sha256", expectedSecret).update(payload).digest("hex");
  const received = signature.trim();
  if (expected.length !== received.length) {
    throw new Error("Assinatura do webhook inválida.");
  }

  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
    throw new Error("Assinatura do webhook inválida.");
  }
}

function sessionExpiryIso(): string {
  return new Date(Date.now() + SESSION_DURATION_MS).toISOString();
}

function sessionRotationIntervalMs(): number {
  const raw = Number(process.env["SESSION_ROTATION_INTERVAL_SECONDS"] ?? "1200");
  const seconds = Number.isFinite(raw) ? Math.max(60, Math.min(24 * 60 * 60, Math.trunc(raw))) : 1200;
  return seconds * 1000;
}

function sessionRotationGraceMs(): number {
  const raw = Number(process.env["SESSION_ROTATION_GRACE_SECONDS"] ?? "20");
  const seconds = Number.isFinite(raw) ? Math.max(5, Math.min(300, Math.trunc(raw))) : 20;
  return seconds * 1000;
}

function registerSessionRotationFallback(previousDigest: string, nextDigest: string): void {
  sessionRotationFallbacks.set(previousDigest, {
    nextTokenDigest: nextDigest,
    expiresAtMs: Date.now() + sessionRotationGraceMs(),
  });
}

function resolveSessionRotationFallback(digest: string): string | null {
  const fallback = sessionRotationFallbacks.get(digest);
  if (!fallback) return null;
  if (fallback.expiresAtMs <= Date.now()) {
    sessionRotationFallbacks.delete(digest);
    return null;
  }
  return fallback.nextTokenDigest;
}

function shouldRotateSessionByLastLogin(lastLoginAtIso: string): boolean {
  const lastLoginAtMs = new Date(lastLoginAtIso).getTime();
  if (!Number.isFinite(lastLoginAtMs)) return true;
  return Date.now() - lastLoginAtMs >= sessionRotationIntervalMs();
}

function passwordResetExpiryIso(): string {
  return new Date(Date.now() + PASSWORD_RESET_DURATION_MS).toISOString();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isSessionExpired(session: SessionRecord): boolean {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

function retentionByBusiness(users: UserRecord[]): Record<BusinessType, number> {
  const byBusiness: Record<BusinessType, number> = {
    "Produtor digital": 0,
    Infoprodutor: 0,
    Afiliado: 0,
    "Agência": 0,
    "E-commerce": 0,
    "Serviços": 0,
  };

  for (const user of users) {
    byBusiness[user.businessType] += 1;
  }

  return byBusiness;
}

async function readStoreFile(): Promise<StoreFile> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      passwordResets: Array.isArray(parsed.passwordResets) ? parsed.passwordResets : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    };
  } catch {
    return { ...emptyStore };
  }
}

async function writeStoreFile(store: StoreFile): Promise<void> {
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function shouldRunSessionCleanup(now: number): boolean {
  return now - lastSessionCleanupAt >= SESSION_CLEANUP_INTERVAL_MS;
}

async function cleanupExpiredSessionsLocal(force = false): Promise<void> {
  const now = Date.now();
  if (!force && !shouldRunSessionCleanup(now)) return;

  const store = await readStoreFile();
  const activeSessions = store.sessions.filter((candidate) => !isSessionExpired(candidate));
  if (activeSessions.length !== store.sessions.length) {
    store.sessions = activeSessions;
    await writeStoreFile(store);
  }

  lastSessionCleanupAt = now;
}

async function cleanupExpiredSessionsPostgres(force = false): Promise<void> {
  const now = Date.now();
  if (!force && !shouldRunSessionCleanup(now)) return;

  await ensureDatabaseSchema();
  await postgresQuery(`DELETE FROM sessions WHERE expires_at <= NOW()`);
  lastSessionCleanupAt = now;
}

async function cleanupExpiredSessionsSqlite(force = false): Promise<void> {
  const now = Date.now();
  if (!force && !shouldRunSessionCleanup(now)) return;

  await sqliteRun(`DELETE FROM sessions WHERE expires_at <= ?`, [nowIso()]);
  lastSessionCleanupAt = now;
}

async function cleanupExpiredSessions(force = false): Promise<void> {
  if (isPostgresEnabled()) {
    await cleanupExpiredSessionsPostgres(force);
    return;
  }

  if (isSqliteEnabled()) {
    await cleanupExpiredSessionsSqlite(force);
    return;
  }

  await cleanupExpiredSessionsLocal(force);
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) return false;

  const derivedKey = scryptSync(password, salt, 64);
  const storedKeyBuffer = Buffer.from(storedKey, "hex");

  if (storedKeyBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKeyBuffer, derivedKey);
}

function mapUserRow(row: {
  id: string;
  name: string;
  email: string;
  business_type: string;
  password_hash: string;
  created_at: Date | string;
  updated_at: Date | string;
}): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    businessType: row.business_type as BusinessType,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function mapSessionRow(row: {
  token_hash: string;
  user_id: string;
  created_at: Date | string;
  last_login_at: Date | string;
  expires_at: Date | string;
}): SessionRecord {
  return {
    tokenHash: row.token_hash,
    userId: row.user_id,
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: new Date(row.last_login_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
  };
}

function toProductRecord(row: {
  id: string;
  owner_user_id: string;
  name: string;
  description: string;
  category: string;
  price_cents: number | string;
  status: string;
  moderation_status?: string | null;
  moderation_reason?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  published_at: Date | string | null;
}): ProductRecord {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceCents: Number(row.price_cents),
    status: row.status as ProductStatus,
    moderationStatus: toModerationStatus(row.moderation_status),
    moderationReason: row.moderation_reason ?? null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  };
}

function validateProductOwnership(userId: string, product: ProductRecord): void {
  if (product.ownerUserId !== userId) {
    throw new Error("Produto não encontrado para este usuário.");
  }
}

function createId(seed: string): string {
  return createHash("sha256").update(seed).digest("hex").slice(0, 24);
}

async function listMyProductsPostgres(userId: string): Promise<ProductRecord[]> {
  const rows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    created_at: Date | string;
    updated_at: Date | string;
    published_at: Date | string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE owner_user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map(toProductRecord);
}

async function listMyProductsSqlite(userId: string): Promise<ProductRecord[]> {
  const rows = await sqliteAll<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: number;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE owner_user_id = ?
     ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map(toProductRecord);
}

async function listMarketplaceProductsPostgres(): Promise<ProductRecord[]> {
  const rows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    created_at: Date | string;
    updated_at: Date | string;
    published_at: Date | string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE status = 'published'
       AND COALESCE(moderation_status, 'approved') <> 'rejected'
     ORDER BY published_at DESC NULLS LAST, created_at DESC`,
  );

  return rows.map(toProductRecord);
}

async function listMarketplaceProductsSqlite(): Promise<ProductRecord[]> {
  const rows = await sqliteAll<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: number;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE status = 'published'
       AND IFNULL(moderation_status, 'approved') <> 'rejected'
     ORDER BY published_at DESC, created_at DESC`,
  );

  return rows.map(toProductRecord);
}

async function createProductPostgres(userId: string, input: { name: string; description: string; category: string; priceCents: number }): Promise<ProductRecord> {
  const now = nowIso();
  const product: ProductRecord = {
    id: createId(`${userId}:${input.name}:${now}`),
    ownerUserId: userId,
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    priceCents: Math.max(100, Math.round(input.priceCents)),
    status: "draft",
    moderationStatus: "pending_review",
    moderationReason: null,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };

  await postgresQuery(
    `INSERT INTO products (id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      product.id,
      product.ownerUserId,
      product.name,
      product.description,
      product.category,
      product.priceCents,
      product.status,
      product.moderationStatus,
      product.moderationReason,
      product.createdAt,
      product.updatedAt,
      product.publishedAt,
    ],
  );

  return product;
}

async function createProductSqlite(userId: string, input: { name: string; description: string; category: string; priceCents: number }): Promise<ProductRecord> {
  const now = nowIso();
  const product: ProductRecord = {
    id: createId(`${userId}:${input.name}:${now}`),
    ownerUserId: userId,
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    priceCents: Math.max(100, Math.round(input.priceCents)),
    status: "draft",
    moderationStatus: "pending_review",
    moderationReason: null,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };

  await sqliteRun(
    `INSERT INTO products (id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.id,
      product.ownerUserId,
      product.name,
      product.description,
      product.category,
      product.priceCents,
      product.status,
      product.moderationStatus,
      product.moderationReason,
      product.createdAt,
      product.updatedAt,
      product.publishedAt,
    ],
  );

  return product;
}

async function publishProductPostgres(userId: string, productId: string): Promise<ProductRecord> {
  const rows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: string;
    status: string;
    created_at: Date | string;
    updated_at: Date | string;
    published_at: Date | string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = $1
     LIMIT 1`,
    [productId],
  );

  const current = rows[0] ? toProductRecord(rows[0]) : null;
  if (!current) throw new Error("Produto não encontrado.");
  validateProductOwnership(userId, current);

  const now = nowIso();
  await postgresQuery(
    `UPDATE products
     SET status = 'published', moderation_status = 'pending_review', moderation_reason = NULL, updated_at = $2, published_at = COALESCE(published_at, $2)
     WHERE id = $1`,
    [productId, now],
  );

  await ensureDefaultLearningTrackPostgres({
    ...current,
    status: "published",
    moderationStatus: "pending_review",
    moderationReason: null,
    updatedAt: now,
    publishedAt: current.publishedAt ?? now,
  });

  return {
    ...current,
    status: "published",
    moderationStatus: "pending_review",
    moderationReason: null,
    updatedAt: now,
    publishedAt: current.publishedAt ?? now,
  };
}

async function publishProductSqlite(userId: string, productId: string): Promise<ProductRecord> {
  const row = await sqliteGet<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: number;
    status: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [productId],
  );

  const current = row ? toProductRecord(row) : null;
  if (!current) throw new Error("Produto não encontrado.");
  validateProductOwnership(userId, current);

  const now = nowIso();
  await sqliteRun(
    `UPDATE products
     SET status = 'published', moderation_status = 'pending_review', moderation_reason = NULL, updated_at = ?, published_at = COALESCE(published_at, ?)
     WHERE id = ?`,
    [now, now, productId],
  );

  await ensureDefaultLearningTrackSqlite({
    ...current,
    status: "published",
    moderationStatus: "pending_review",
    moderationReason: null,
    updatedAt: now,
    publishedAt: current.publishedAt ?? now,
  });

  return {
    ...current,
    status: "published",
    moderationStatus: "pending_review",
    moderationReason: null,
    updatedAt: now,
    publishedAt: current.publishedAt ?? now,
  };
}

async function findPublishedProductPostgres(productId: string): Promise<ProductRecord | null> {
  const rows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    created_at: Date | string;
    updated_at: Date | string;
    published_at: Date | string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE id = $1
       AND status = 'published'
       AND COALESCE(moderation_status, 'approved') <> 'rejected'
     LIMIT 1`,
    [productId],
  );

  return rows[0] ? toProductRecord(rows[0]) : null;
}

async function findPublishedProductSqlite(productId: string): Promise<ProductRecord | null> {
  const row = await sqliteGet<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: number;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE id = ?
       AND status = 'published'
       AND IFNULL(moderation_status, 'approved') <> 'rejected'
     LIMIT 1`,
    [productId],
  );

  return row ? toProductRecord(row) : null;
}

async function ensureDefaultLearningTrackPostgres(product: ProductRecord): Promise<void> {
  const existing = await postgresQuery<{ id: string }>(
    `SELECT id FROM product_modules WHERE product_id = $1 LIMIT 1`,
    [product.id],
  );
  if (existing.length > 0) return;

  const now = nowIso();
  const moduleId = createId(`module:${product.id}:1`);
  const lessonId = createId(`lesson:${product.id}:1`);

  await postgresQuery(
    `INSERT INTO product_modules (id, product_id, title, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, 1, $4, $4)`,
    [moduleId, product.id, "Módulo 1 - Introdução", now],
  );

  await postgresQuery(
    `INSERT INTO product_lessons (id, product_id, module_id, title, content, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 1, $6, $6)`,
    [lessonId, product.id, moduleId, "Aula 1 - Boas-vindas", product.description, now],
  );
}

async function ensureDefaultLearningTrackSqlite(product: ProductRecord): Promise<void> {
  const existing = await sqliteGet<{ id: string }>(
    `SELECT id FROM product_modules WHERE product_id = ? LIMIT 1`,
    [product.id],
  );
  if (existing) return;

  const now = nowIso();
  const moduleId = createId(`module:${product.id}:1`);
  const lessonId = createId(`lesson:${product.id}:1`);

  await sqliteRun(
    `INSERT INTO product_modules (id, product_id, title, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)`,
    [moduleId, product.id, "Módulo 1 - Introdução", now, now],
  );

  await sqliteRun(
    `INSERT INTO product_lessons (id, product_id, module_id, title, content, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    [lessonId, product.id, moduleId, "Aula 1 - Boas-vindas", product.description, now, now],
  );
}

async function listLearningTrackPostgres(userId: string, productId: string): Promise<LearningModuleRecord[]> {
  const enrollment = await postgresQuery<{ id: string }>(
    `SELECT id FROM enrollments WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
    [userId, productId],
  );
  if (enrollment.length === 0) {
    throw new Error("Sem acesso ao conteúdo deste produto.");
  }

  const productRows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: string;
    status: string;
    created_at: Date | string;
    updated_at: Date | string;
    published_at: Date | string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = $1
     LIMIT 1`,
    [productId],
  );
  if (productRows[0]) {
    await ensureDefaultLearningTrackPostgres(toProductRecord(productRows[0]));
  }

  const rows = await postgresQuery<{
    module_id: string;
    module_title: string;
    module_sort_order: number;
    lesson_id: string | null;
    lesson_title: string | null;
    lesson_content: string | null;
    lesson_sort_order: number | null;
    completed_at: Date | string | null;
  }>(
    `SELECT m.id AS module_id,
            m.title AS module_title,
            m.sort_order AS module_sort_order,
            l.id AS lesson_id,
            l.title AS lesson_title,
            l.content AS lesson_content,
            l.sort_order AS lesson_sort_order,
            lp.completed_at
     FROM product_modules m
     LEFT JOIN product_lessons l ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $2
     WHERE m.product_id = $1
     ORDER BY m.sort_order ASC, l.sort_order ASC`,
    [productId, userId],
  );

  const byModule = new Map<string, LearningModuleRecord>();

  for (const row of rows) {
    if (!byModule.has(row.module_id)) {
      byModule.set(row.module_id, {
        id: row.module_id,
        productId,
        title: row.module_title,
        sortOrder: Number(row.module_sort_order),
        lessons: [],
      });
    }

    if (row.lesson_id && row.lesson_title && row.lesson_content !== null) {
      byModule.get(row.module_id)?.lessons.push({
        id: row.lesson_id,
        moduleId: row.module_id,
        title: row.lesson_title,
        content: row.lesson_content,
        sortOrder: Number(row.lesson_sort_order ?? 0),
        completed: Boolean(row.completed_at),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
      });
    }
  }

  return Array.from(byModule.values());
}

async function listLearningTrackSqlite(userId: string, productId: string): Promise<LearningModuleRecord[]> {
  const enrollment = await sqliteGet<{ id: string }>(
    `SELECT id FROM enrollments WHERE user_id = ? AND product_id = ? LIMIT 1`,
    [userId, productId],
  );
  if (!enrollment) {
    throw new Error("Sem acesso ao conteúdo deste produto.");
  }

  const productRow = await sqliteGet<{
    id: string;
    owner_user_id: string;
    name: string;
    description: string;
    category: string;
    price_cents: number;
    status: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  }>(
    `SELECT id, owner_user_id, name, description, category, price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [productId],
  );
  if (productRow) {
    await ensureDefaultLearningTrackSqlite(toProductRecord(productRow));
  }

  const rows = await sqliteAll<{
    module_id: string;
    module_title: string;
    module_sort_order: number;
    lesson_id: string | null;
    lesson_title: string | null;
    lesson_content: string | null;
    lesson_sort_order: number | null;
    completed_at: string | null;
  }>(
    `SELECT m.id AS module_id,
            m.title AS module_title,
            m.sort_order AS module_sort_order,
            l.id AS lesson_id,
            l.title AS lesson_title,
            l.content AS lesson_content,
            l.sort_order AS lesson_sort_order,
            lp.completed_at
     FROM product_modules m
     LEFT JOIN product_lessons l ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE m.product_id = ?
     ORDER BY m.sort_order ASC, l.sort_order ASC`,
    [userId, productId],
  );

  const byModule = new Map<string, LearningModuleRecord>();

  for (const row of rows) {
    if (!byModule.has(row.module_id)) {
      byModule.set(row.module_id, {
        id: row.module_id,
        productId,
        title: row.module_title,
        sortOrder: Number(row.module_sort_order),
        lessons: [],
      });
    }

    if (row.lesson_id && row.lesson_title && row.lesson_content !== null) {
      byModule.get(row.module_id)?.lessons.push({
        id: row.lesson_id,
        moduleId: row.module_id,
        title: row.lesson_title,
        content: row.lesson_content,
        sortOrder: Number(row.lesson_sort_order ?? 0),
        completed: Boolean(row.completed_at),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
      });
    }
  }

  return Array.from(byModule.values());
}

async function updateLessonProgressPostgres(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<{ productId: string; progressPercent: number; completedLessons: number; totalLessons: number }> {
  const lessonRows = await postgresQuery<{ product_id: string }>(
    `SELECT l.product_id
     FROM product_lessons l
     JOIN enrollments e ON e.product_id = l.product_id
     WHERE l.id = $1 AND e.user_id = $2
     LIMIT 1`,
    [lessonId, userId],
  );
  const lesson = lessonRows[0];
  if (!lesson) {
    throw new Error("Aula não encontrada para este usuário.");
  }

  const now = nowIso();
  await postgresQuery(
    `INSERT INTO lesson_progress (id, user_id, product_id, lesson_id, completed_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT (user_id, lesson_id)
     DO UPDATE SET completed_at = EXCLUDED.completed_at, updated_at = EXCLUDED.updated_at`,
    [createId(`lesson-progress:${userId}:${lessonId}`), userId, lesson.product_id, lessonId, completed ? now : null, now],
  );

  const totals = await postgresQuery<{ total_lessons: string; completed_lessons: string }>(
    `SELECT
      (SELECT COUNT(*)::text FROM product_lessons WHERE product_id = $1) AS total_lessons,
      (SELECT COUNT(*)::text FROM lesson_progress WHERE user_id = $2 AND product_id = $1 AND completed_at IS NOT NULL) AS completed_lessons`,
    [lesson.product_id, userId],
  );

  const totalLessons = Number(totals[0]?.total_lessons ?? 0);
  const completedLessons = Number(totals[0]?.completed_lessons ?? 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  await postgresQuery(
    `UPDATE enrollments
     SET progress_percent = $1, updated_at = $2
     WHERE user_id = $3 AND product_id = $4`,
    [progressPercent, now, userId, lesson.product_id],
  );

  return { productId: lesson.product_id, progressPercent, completedLessons, totalLessons };
}

async function updateLessonProgressSqlite(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<{ productId: string; progressPercent: number; completedLessons: number; totalLessons: number }> {
  const lesson = await sqliteGet<{ product_id: string }>(
    `SELECT l.product_id
     FROM product_lessons l
     JOIN enrollments e ON e.product_id = l.product_id
     WHERE l.id = ? AND e.user_id = ?
     LIMIT 1`,
    [lessonId, userId],
  );
  if (!lesson) {
    throw new Error("Aula não encontrada para este usuário.");
  }

  const now = nowIso();
  await sqliteRun(
    `INSERT INTO lesson_progress (id, user_id, product_id, lesson_id, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, lesson_id)
     DO UPDATE SET completed_at = excluded.completed_at, updated_at = excluded.updated_at`,
    [createId(`lesson-progress:${userId}:${lessonId}`), userId, lesson.product_id, lessonId, completed ? now : null, now, now],
  );

  const totalRow = await sqliteGet<{ total_lessons: number }>(
    `SELECT COUNT(*) AS total_lessons FROM product_lessons WHERE product_id = ?`,
    [lesson.product_id],
  );
  const completedRow = await sqliteGet<{ completed_lessons: number }>(
    `SELECT COUNT(*) AS completed_lessons
     FROM lesson_progress
     WHERE user_id = ? AND product_id = ? AND completed_at IS NOT NULL`,
    [userId, lesson.product_id],
  );

  const totalLessons = Number(totalRow?.total_lessons ?? 0);
  const completedLessons = Number(completedRow?.completed_lessons ?? 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  await sqliteRun(
    `UPDATE enrollments
     SET progress_percent = ?, updated_at = ?
     WHERE user_id = ? AND product_id = ?`,
    [progressPercent, now, userId, lesson.product_id],
  );

  return { productId: lesson.product_id, progressPercent, completedLessons, totalLessons };
}

async function buyProductPostgres(userId: string, productId: string, paymentMethod: PaymentMethod): Promise<{ orderId: string; enrollmentId: string }> {
  const product = await findPublishedProductPostgres(productId);
  if (!product) throw new Error("Produto indisponível para compra.");

  const now = nowIso();
  const orderId = createId(`order:${userId}:${product.id}:${now}`);
  const enrollmentId = createId(`enrollment:${userId}:${product.id}:${now}`);

  await postgresQuery(
    `INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'approved', $6, $6)`,
    [orderId, userId, product.id, product.priceCents, paymentMethod, now],
  );

  await postgresQuery(
    `INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES ($1, $2, 'approved', $3, $4)`,
    [createId(`order-event:approved:${orderId}:${now}`), orderId, 'Compra aprovada no checkout.', now],
  );

  await postgresQuery(
    `INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 0, $5, $5)
     ON CONFLICT (user_id, product_id) DO UPDATE SET updated_at = EXCLUDED.updated_at`,
    [enrollmentId, userId, product.id, orderId, now],
  );

  return { orderId, enrollmentId };
}

async function buyProductSqlite(userId: string, productId: string, paymentMethod: PaymentMethod): Promise<{ orderId: string; enrollmentId: string }> {
  const product = await findPublishedProductSqlite(productId);
  if (!product) throw new Error("Produto indisponível para compra.");

  const now = nowIso();
  const orderId = createId(`order:${userId}:${product.id}:${now}`);
  const enrollmentId = createId(`enrollment:${userId}:${product.id}:${now}`);

  await sqliteRun(
    `INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)`,
    [orderId, userId, product.id, product.priceCents, paymentMethod, now, now],
  );

  await sqliteRun(
    `INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES (?, ?, 'approved', ?, ?)`,
    [createId(`order-event:approved:${orderId}:${now}`), orderId, "Compra aprovada no checkout.", now],
  );

  await sqliteRun(
    `INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)
     ON CONFLICT(user_id, product_id) DO UPDATE SET updated_at = excluded.updated_at`,
    [enrollmentId, userId, product.id, orderId, now, now],
  );

  return { orderId, enrollmentId };
}

async function createCheckoutOrderPostgres(userId: string, productId: string, paymentMethod: PaymentMethod): Promise<CheckoutOrderResult> {
  const product = await findPublishedProductPostgres(productId);
  if (!product) throw new Error("Produto indisponível para compra.");

  const now = nowIso();
  const orderId = createId(`order:${userId}:${product.id}:${now}`);
  const paymentProvider = resolvePaymentProviderMode();
  const paymentReference = buildPaymentReference(orderId);
  let providerStatus = "created";
  let providerPaymentId: string | null = null;
  let providerCheckoutUrl: string | null = null;

  if (paymentProvider === "gateway_webhook" && isMercadoPagoGatewaySelected()) {
    const payerEmail = await getUserEmailByIdPostgres(userId);
    const preference = await createMercadoPagoCheckoutPreference({
      orderId,
      paymentReference,
      title: product.name,
      amountCents: product.priceCents,
      payerEmail,
      paymentMethod,
    });
    providerPaymentId = preference.preferenceId;
    providerCheckoutUrl = preference.checkoutUrl;
    providerStatus = "preference_created";
  }

  await postgresQuery(
    `INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, payment_provider, provider_payment_id, provider_status, payment_reference, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $10)`,
    [orderId, userId, product.id, product.priceCents, paymentMethod, paymentProvider, providerPaymentId, providerStatus, paymentReference, now],
  );

  await postgresQuery(
    `INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES ($1, $2, 'pending', $3, $4)`,
    [createId(`order-event:pending:${orderId}:${now}`), orderId, 'Pedido criado e aguardando confirmação de pagamento.', now],
  );

  return {
    orderId,
    status: "pending",
    paymentProvider,
    paymentReference,
    providerCheckoutUrl,
  };
}

async function createCheckoutOrderSqlite(userId: string, productId: string, paymentMethod: PaymentMethod): Promise<CheckoutOrderResult> {
  const product = await findPublishedProductSqlite(productId);
  if (!product) throw new Error("Produto indisponível para compra.");

  const now = nowIso();
  const orderId = createId(`order:${userId}:${product.id}:${now}`);
  const paymentProvider = resolvePaymentProviderMode();
  const paymentReference = buildPaymentReference(orderId);
  let providerStatus = "created";
  let providerPaymentId: string | null = null;
  let providerCheckoutUrl: string | null = null;

  if (paymentProvider === "gateway_webhook" && isMercadoPagoGatewaySelected()) {
    const payerEmail = await getUserEmailByIdSqlite(userId);
    const preference = await createMercadoPagoCheckoutPreference({
      orderId,
      paymentReference,
      title: product.name,
      amountCents: product.priceCents,
      payerEmail,
      paymentMethod,
    });
    providerPaymentId = preference.preferenceId;
    providerCheckoutUrl = preference.checkoutUrl;
    providerStatus = "preference_created";
  }

  await sqliteRun(
    `INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, payment_provider, provider_payment_id, provider_status, payment_reference, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [orderId, userId, product.id, product.priceCents, paymentMethod, paymentProvider, providerPaymentId, providerStatus, paymentReference, now, now],
  );

  await sqliteRun(
    `INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES (?, ?, 'pending', ?, ?)`,
    [createId(`order-event:pending:${orderId}:${now}`), orderId, "Pedido criado e aguardando confirmação de pagamento.", now],
  );

  return {
    orderId,
    status: "pending",
    paymentProvider,
    paymentReference,
    providerCheckoutUrl,
  };
}

async function transitionOrderStatusPostgres(
  userId: string,
  orderId: string,
  nextStatus: Exclude<OrderStatus, "pending">,
): Promise<{ orderId: string; status: OrderStatus; enrollmentCreated: boolean }> {
  const rows = await postgresQuery<{
    id: string;
    buyer_user_id: string;
    product_id: string;
    status: string;
    updated_at: Date | string;
  }>(
    `SELECT id, buyer_user_id, product_id, status, updated_at
     FROM orders
     WHERE id = $1 AND buyer_user_id = $2
     LIMIT 1`,
    [orderId, userId],
  );

  const current = rows[0];
  if (!current) throw new Error("Pedido não encontrado.");

  const currentStatus = toOrderStatus(current.status);
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw new Error(`Transição inválida de status: ${currentStatus} -> ${nextStatus}.`);
  }

  const now = nowIso();
  let enrollmentCreated = false;

  if (currentStatus !== nextStatus) {
    await postgresQuery(
      `UPDATE orders
       SET status = $1, updated_at = $2
       WHERE id = $3 AND buyer_user_id = $4`,
      [nextStatus, now, orderId, userId],
    );

    await postgresQuery(
      `INSERT INTO order_events (id, order_id, status, note, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [createId(`order-event:${nextStatus}:${orderId}:${now}`), orderId, nextStatus, `Status alterado para ${nextStatus}.`, now],
    );
  }

  if (nextStatus === "approved" && currentStatus !== "approved") {
    const enrollmentId = createId(`enrollment:${userId}:${current.product_id}:${now}`);
    await postgresQuery(
      `INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, $5, $5)
       ON CONFLICT (user_id, product_id) DO UPDATE SET updated_at = EXCLUDED.updated_at`,
      [enrollmentId, userId, current.product_id, orderId, now],
    );
    await createNotification(
      userId,
      "order_approved",
      "Compra aprovada",
      "Seu pagamento foi confirmado e o conteúdo já está disponível na área de membros.",
      "/membros",
    );
    enrollmentCreated = true;
  }

  return { orderId, status: nextStatus, enrollmentCreated };
}

async function transitionOrderStatusSqlite(
  userId: string,
  orderId: string,
  nextStatus: Exclude<OrderStatus, "pending">,
): Promise<{ orderId: string; status: OrderStatus; enrollmentCreated: boolean }> {
  const current = await sqliteGet<{
    id: string;
    buyer_user_id: string;
    product_id: string;
    status: string;
    updated_at: string;
  }>(
    `SELECT id, buyer_user_id, product_id, status, updated_at
     FROM orders
     WHERE id = ? AND buyer_user_id = ?
     LIMIT 1`,
    [orderId, userId],
  );

  if (!current) throw new Error("Pedido não encontrado.");

  const currentStatus = toOrderStatus(current.status);
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw new Error(`Transição inválida de status: ${currentStatus} -> ${nextStatus}.`);
  }

  const now = nowIso();
  let enrollmentCreated = false;

  if (currentStatus !== nextStatus) {
    await sqliteRun(
      `UPDATE orders
       SET status = ?, updated_at = ?
       WHERE id = ? AND buyer_user_id = ?`,
      [nextStatus, now, orderId, userId],
    );

    await sqliteRun(
      `INSERT INTO order_events (id, order_id, status, note, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [createId(`order-event:${nextStatus}:${orderId}:${now}`), orderId, nextStatus, `Status alterado para ${nextStatus}.`, now],
    );
  }

  if (nextStatus === "approved" && currentStatus !== "approved") {
    const enrollmentId = createId(`enrollment:${userId}:${current.product_id}:${now}`);
    await sqliteRun(
      `INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET updated_at = excluded.updated_at`,
      [enrollmentId, userId, current.product_id, orderId, now, now],
    );
    await createNotification(
      userId,
      "order_approved",
      "Compra aprovada",
      "Seu pagamento foi confirmado e o conteúdo já está disponível na área de membros.",
      "/membros",
    );
    enrollmentCreated = true;
  }

  return { orderId, status: nextStatus, enrollmentCreated };
}

async function processPaymentWebhookPostgres(input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookResult> {
  const now = nowIso();
  const payload = input.payload ?? "";
  if (!input.skipSignatureValidation) {
    validateWebhookSignature(payload, input.signature);
  }

  const insertRows = await postgresQuery<{ id: string }>(
    `INSERT INTO payment_webhook_events (id, provider, event_id, order_id, event_status, signature, payload, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (provider, event_id) DO NOTHING
     RETURNING id`,
    [createId(`payment-webhook:${input.provider}:${input.eventId}:${now}`), input.provider, input.eventId, input.orderId, input.status, input.signature ?? null, payload, now],
  );

  if (insertRows.length === 0) {
    const duplicate = await postgresQuery<{ status: string }>(
      `SELECT status FROM orders WHERE id = $1 LIMIT 1`,
      [input.orderId],
    );
    return {
      accepted: true,
      duplicate: true,
      applied: false,
      orderId: input.orderId,
      orderStatus: duplicate[0] ? toOrderStatus(duplicate[0].status) : null,
      message: "Evento já processado.",
    };
  }

  const orderRows = await postgresQuery<{
    id: string;
    buyer_user_id: string;
    status: string;
  }>(
    `SELECT id, buyer_user_id, status
     FROM orders
     WHERE id = $1
     LIMIT 1`,
    [input.orderId],
  );

  const order = orderRows[0];
  if (!order) {
    await postgresQuery(
      `UPDATE payment_webhook_events
       SET processed_at = $1, processing_result = $2
       WHERE provider = $3 AND event_id = $4`,
      [now, "order_not_found", input.provider, input.eventId],
    );
    return {
      accepted: true,
      duplicate: false,
      applied: false,
      orderId: input.orderId,
      orderStatus: null,
      message: "Pedido não encontrado para o evento recebido.",
    };
  }

  const current = toOrderStatus(order.status);
  if (!canTransitionOrderStatus(current, input.status)) {
    await postgresQuery(
      `UPDATE payment_webhook_events
       SET processed_at = $1, processing_result = $2
       WHERE provider = $3 AND event_id = $4`,
      [now, `invalid_transition:${current}->${input.status}`, input.provider, input.eventId],
    );
    return {
      accepted: true,
      duplicate: false,
      applied: false,
      orderId: input.orderId,
      orderStatus: current,
      message: `Transição inválida recebida pelo gateway (${current} -> ${input.status}).`,
    };
  }

  await transitionOrderStatusPostgres(order.buyer_user_id, order.id, input.status);

  await postgresQuery(
    `UPDATE orders
     SET payment_provider = $1,
         provider_payment_id = COALESCE($2, provider_payment_id),
         provider_status = $3,
         updated_at = $4
     WHERE id = $5`,
    ["gateway_webhook", input.providerPaymentId ?? null, input.status, now, order.id],
  );

  await postgresQuery(
    `UPDATE payment_webhook_events
     SET processed_at = $1, processing_result = $2
     WHERE provider = $3 AND event_id = $4`,
    [now, `applied:${input.status}`, input.provider, input.eventId],
  );

  return {
    accepted: true,
    duplicate: false,
    applied: current !== input.status,
    orderId: input.orderId,
    orderStatus: input.status,
    message: "Evento de pagamento processado com sucesso.",
  };
}

async function processPaymentWebhookSqlite(input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookResult> {
  const now = nowIso();
  const payload = input.payload ?? "";
  if (!input.skipSignatureValidation) {
    validateWebhookSignature(payload, input.signature);
  }

  const existing = await sqliteGet<{ id: string }>(
    `SELECT id FROM payment_webhook_events WHERE provider = ? AND event_id = ? LIMIT 1`,
    [input.provider, input.eventId],
  );

  if (existing) {
    const duplicate = await sqliteGet<{ status: string }>(
      `SELECT status FROM orders WHERE id = ? LIMIT 1`,
      [input.orderId],
    );
    return {
      accepted: true,
      duplicate: true,
      applied: false,
      orderId: input.orderId,
      orderStatus: duplicate ? toOrderStatus(duplicate.status) : null,
      message: "Evento já processado.",
    };
  }

  await sqliteRun(
    `INSERT INTO payment_webhook_events (id, provider, event_id, order_id, event_status, signature, payload, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [createId(`payment-webhook:${input.provider}:${input.eventId}:${now}`), input.provider, input.eventId, input.orderId, input.status, input.signature ?? null, payload, now],
  );

  const order = await sqliteGet<{
    id: string;
    buyer_user_id: string;
    status: string;
  }>(
    `SELECT id, buyer_user_id, status
     FROM orders
     WHERE id = ?
     LIMIT 1`,
    [input.orderId],
  );

  if (!order) {
    await sqliteRun(
      `UPDATE payment_webhook_events
       SET processed_at = ?, processing_result = ?
       WHERE provider = ? AND event_id = ?`,
      [now, "order_not_found", input.provider, input.eventId],
    );
    return {
      accepted: true,
      duplicate: false,
      applied: false,
      orderId: input.orderId,
      orderStatus: null,
      message: "Pedido não encontrado para o evento recebido.",
    };
  }

  const current = toOrderStatus(order.status);
  if (!canTransitionOrderStatus(current, input.status)) {
    await sqliteRun(
      `UPDATE payment_webhook_events
       SET processed_at = ?, processing_result = ?
       WHERE provider = ? AND event_id = ?`,
      [now, `invalid_transition:${current}->${input.status}`, input.provider, input.eventId],
    );
    return {
      accepted: true,
      duplicate: false,
      applied: false,
      orderId: input.orderId,
      orderStatus: current,
      message: `Transição inválida recebida pelo gateway (${current} -> ${input.status}).`,
    };
  }

  await transitionOrderStatusSqlite(order.buyer_user_id, order.id, input.status);

  await sqliteRun(
    `UPDATE orders
     SET payment_provider = ?,
         provider_payment_id = COALESCE(?, provider_payment_id),
         provider_status = ?,
         updated_at = ?
     WHERE id = ?`,
    ["gateway_webhook", input.providerPaymentId ?? null, input.status, now, order.id],
  );

  await sqliteRun(
    `UPDATE payment_webhook_events
     SET processed_at = ?, processing_result = ?
     WHERE provider = ? AND event_id = ?`,
    [now, `applied:${input.status}`, input.provider, input.eventId],
  );

  return {
    accepted: true,
    duplicate: false,
    applied: current !== input.status,
    orderId: input.orderId,
    orderStatus: input.status,
    message: "Evento de pagamento processado com sucesso.",
  };
}

async function listMyOrdersPostgres(userId: string, filters?: OrderFilters): Promise<OrderRecord[]> {
  const where: string[] = ["o.buyer_user_id = $1"];
  const params: unknown[] = [userId];

  if (filters?.status) {
    params.push(filters.status);
    where.push(`o.status = $${params.length}`);
  }

  if (filters?.productId) {
    params.push(filters.productId);
    where.push(`o.product_id = $${params.length}`);
  }

  if (filters?.fromCreatedAt) {
    params.push(filters.fromCreatedAt);
    where.push(`o.created_at >= $${params.length}`);
  }

  if (filters?.toCreatedAt) {
    params.push(filters.toCreatedAt);
    where.push(`o.created_at <= $${params.length}`);
  }

  const rows = await postgresQuery<{
    id: string;
    buyer_user_id: string;
    product_id: string;
    product_name: string;
    amount_cents: string;
    payment_method: PaymentMethod;
    status: string;
    created_at: Date | string;
    updated_at: Date | string;
  }>(
    `SELECT o.id,
            o.buyer_user_id,
            o.product_id,
            p.name AS product_name,
            o.amount_cents::text AS amount_cents,
            o.payment_method,
            o.status,
            o.created_at,
            o.updated_at
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE ${where.join(" AND ")}
     ORDER BY o.created_at DESC`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    buyerUserId: row.buyer_user_id,
    productId: row.product_id,
    productName: row.product_name,
    amountCents: Number(row.amount_cents),
    paymentMethod: row.payment_method,
    status: toOrderStatus(row.status),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function listMyOrdersSqlite(userId: string, filters?: OrderFilters): Promise<OrderRecord[]> {
  const where: string[] = ["o.buyer_user_id = ?"];
  const params: unknown[] = [userId];

  if (filters?.status) {
    params.push(filters.status);
    where.push("o.status = ?");
  }

  if (filters?.productId) {
    params.push(filters.productId);
    where.push("o.product_id = ?");
  }

  if (filters?.fromCreatedAt) {
    params.push(filters.fromCreatedAt);
    where.push("o.created_at >= ?");
  }

  if (filters?.toCreatedAt) {
    params.push(filters.toCreatedAt);
    where.push("o.created_at <= ?");
  }

  const rows = await sqliteAll<{
    id: string;
    buyer_user_id: string;
    product_id: string;
    product_name: string;
    amount_cents: number;
    payment_method: PaymentMethod;
    status: string;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT o.id,
            o.buyer_user_id,
            o.product_id,
            p.name AS product_name,
            o.amount_cents,
            o.payment_method,
            o.status,
            o.created_at,
            o.updated_at
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE ${where.join(" AND ")}
     ORDER BY o.created_at DESC`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    buyerUserId: row.buyer_user_id,
    productId: row.product_id,
    productName: row.product_name,
    amountCents: Number(row.amount_cents),
    paymentMethod: row.payment_method,
    status: toOrderStatus(row.status),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function listOrderTimelinePostgres(userId: string, orderId: string): Promise<OrderTimelineEvent[]> {
  const rows = await postgresQuery<{
    id: string;
    order_id: string;
    status: string;
    note: string | null;
    created_at: Date | string;
  }>(
    `SELECT e.id, e.order_id, e.status, e.note, e.created_at
     FROM order_events e
     JOIN orders o ON o.id = e.order_id
     WHERE e.order_id = $1 AND o.buyer_user_id = $2
     ORDER BY e.created_at ASC`,
    [orderId, userId],
  );

  return rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    status: toOrderStatus(row.status),
    note: row.note,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listOrderTimelineSqlite(userId: string, orderId: string): Promise<OrderTimelineEvent[]> {
  const rows = await sqliteAll<{
    id: string;
    order_id: string;
    status: string;
    note: string | null;
    created_at: string;
  }>(
    `SELECT e.id, e.order_id, e.status, e.note, e.created_at
     FROM order_events e
     JOIN orders o ON o.id = e.order_id
     WHERE e.order_id = ? AND o.buyer_user_id = ?
     ORDER BY e.created_at ASC`,
    [orderId, userId],
  );

  return rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    status: toOrderStatus(row.status),
    note: row.note,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listEnrollmentsPostgres(userId: string): Promise<EnrollmentRecord[]> {
  const rows = await postgresQuery<{
    id: string;
    user_id: string;
    product_id: string;
    order_id: string;
    progress_percent: string;
    created_at: Date | string;
    updated_at: Date | string;
    product_name: string;
    product_description: string;
  }>(
    `SELECT e.id, e.user_id, e.product_id, e.order_id, e.progress_percent::text AS progress_percent,
            e.created_at, e.updated_at, p.name AS product_name, p.description AS product_description
     FROM enrollments e
     JOIN products p ON p.id = e.product_id
     WHERE e.user_id = $1
     ORDER BY e.created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    orderId: row.order_id,
    progressPercent: Number(row.progress_percent),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    productName: row.product_name,
    productDescription: row.product_description,
  }));
}

async function listEnrollmentsSqlite(userId: string): Promise<EnrollmentRecord[]> {
  const rows = await sqliteAll<{
    id: string;
    user_id: string;
    product_id: string;
    order_id: string;
    progress_percent: number;
    created_at: string;
    updated_at: string;
    product_name: string;
    product_description: string;
  }>(
    `SELECT e.id, e.user_id, e.product_id, e.order_id, e.progress_percent,
            e.created_at, e.updated_at, p.name AS product_name, p.description AS product_description
     FROM enrollments e
     JOIN products p ON p.id = e.product_id
     WHERE e.user_id = ?
     ORDER BY e.created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    orderId: row.order_id,
    progressPercent: Number(row.progress_percent),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    productName: row.product_name,
    productDescription: row.product_description,
  }));
}

async function getFinanceSummaryPostgres(userId: string): Promise<FinanceSummary> {
  const grossRow = await postgresQuery<{ total: string }>(
    `SELECT COALESCE(SUM(o.amount_cents), 0)::text AS total
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE p.owner_user_id = $1 AND o.status = 'approved'`,
    [userId],
  );

  const withdrawRows = await postgresQuery<{ status: string; total: string }>(
    `SELECT status, COALESCE(SUM(amount_cents), 0)::text AS total
     FROM withdrawals
     WHERE user_id = $1 AND status IN ('requested', 'approved')
     GROUP BY status`,
    [userId],
  );

  const recentRows = await postgresQuery<{
    id: string;
    amount_cents: string;
    method: string;
    status: string;
    created_at: Date | string;
  }>(
    `SELECT id, amount_cents::text AS amount_cents, method, status, created_at
     FROM withdrawals
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId],
  );

  const grossSalesCents = Number(grossRow[0]?.total ?? 0);
  const withdrawRequestedCents = Number(withdrawRows.find((row) => row.status === "requested")?.total ?? 0);
  const withdrawApprovedCents = Number(withdrawRows.find((row) => row.status === "approved")?.total ?? 0);
  const reservedWithdrawCents = withdrawRequestedCents + withdrawApprovedCents;
  const platformFeeCents = Math.round(grossSalesCents * PLATFORM_FEE_RATE);
  const netSalesCents = Math.max(0, grossSalesCents - platformFeeCents);

  return {
    grossSalesCents,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformFeeCents,
    netSalesCents,
    withdrawApprovedCents,
    withdrawRequestedCents,
    reservedWithdrawCents,
    availableBalanceCents: Math.max(0, netSalesCents - reservedWithdrawCents),
    recentWithdrawals: recentRows.map((row) => ({
      id: row.id,
      amountCents: Number(row.amount_cents),
      method: row.method,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
}

async function getFinanceSummarySqlite(userId: string): Promise<FinanceSummary> {
  const grossRow = await sqliteGet<{ total: number }>(
    `SELECT COALESCE(SUM(o.amount_cents), 0) AS total
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE p.owner_user_id = ? AND o.status = 'approved'`,
    [userId],
  );

  const withdrawRows = await sqliteAll<{ status: string; total: number }>(
    `SELECT status, COALESCE(SUM(amount_cents), 0) AS total
     FROM withdrawals
     WHERE user_id = ? AND status IN ('requested', 'approved')
     GROUP BY status`,
    [userId],
  );

  const recentRows = await sqliteAll<{
    id: string;
    amount_cents: number;
    method: string;
    status: string;
    created_at: string;
  }>(
    `SELECT id, amount_cents, method, status, created_at
     FROM withdrawals
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId],
  );

  const grossSalesCents = Number(grossRow?.total ?? 0);
  const withdrawRequestedCents = Number(withdrawRows.find((row) => row.status === "requested")?.total ?? 0);
  const withdrawApprovedCents = Number(withdrawRows.find((row) => row.status === "approved")?.total ?? 0);
  const reservedWithdrawCents = withdrawRequestedCents + withdrawApprovedCents;
  const platformFeeCents = Math.round(grossSalesCents * PLATFORM_FEE_RATE);
  const netSalesCents = Math.max(0, grossSalesCents - platformFeeCents);

  return {
    grossSalesCents,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformFeeCents,
    netSalesCents,
    withdrawApprovedCents,
    withdrawRequestedCents,
    reservedWithdrawCents,
    availableBalanceCents: Math.max(0, netSalesCents - reservedWithdrawCents),
    recentWithdrawals: recentRows.map((row) => ({
      id: row.id,
      amountCents: Number(row.amount_cents),
      method: row.method,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
}

function mapNotificationRow(row: {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read_at: Date | string | null;
  created_at: Date | string;
}): NotificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    link: row.link,
    readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function createNotificationPostgres(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string | null,
): Promise<void> {
  const now = nowIso();
  const id = createId(`notification:${type}:${userId}:${now}:${title}`);
  await postgresQuery(
    `INSERT INTO notifications (id, user_id, type, title, message, link, read_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NULL, $7)`,
    [id, userId, type, title, message, link, now],
  );
}

async function createNotificationSqlite(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string | null,
): Promise<void> {
  const now = nowIso();
  const id = createId(`notification:${type}:${userId}:${now}:${title}`);
  await sqliteRun(
    `INSERT INTO notifications (id, user_id, type, title, message, link, read_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
    [id, userId, type, title, message, link, now],
  );
}

async function createNotificationLocal(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string | null,
): Promise<void> {
  const store = await readStoreFile();
  const now = nowIso();
  store.notifications.unshift({
    id: createId(`notification:${type}:${userId}:${now}:${title}`),
    userId,
    type,
    title,
    message,
    link,
    readAt: null,
    createdAt: now,
  });
  store.notifications = store.notifications.slice(0, 200);
  await writeStoreFile(store);
}

async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string | null,
): Promise<void> {
  if (isPostgresEnabled()) {
    await createNotificationPostgres(userId, type, title, message, link);
    return;
  }

  if (isSqliteEnabled()) {
    await createNotificationSqlite(userId, type, title, message, link);
    return;
  }

  await createNotificationLocal(userId, type, title, message, link);
}

async function listNotificationsPostgres(userId: string, limit: number): Promise<NotificationRecord[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const rows = await postgresQuery<{
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read_at: Date | string | null;
    created_at: Date | string;
  }>(
    `SELECT id, user_id, type, title, message, link, read_at, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, safeLimit],
  );

  return rows.map(mapNotificationRow);
}

async function listNotificationsSqlite(userId: string, limit: number): Promise<NotificationRecord[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const rows = await sqliteAll<{
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read_at: string | null;
    created_at: string;
  }>(
    `SELECT id, user_id, type, title, message, link, read_at, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, safeLimit],
  );

  return rows.map(mapNotificationRow);
}

async function listNotificationsLocal(userId: string, limit: number): Promise<NotificationRecord[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const store = await readStoreFile();
  return store.notifications
    .filter((item) => item.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, safeLimit);
}

async function markNotificationReadPostgres(userId: string, notificationId: string): Promise<void> {
  await postgresQuery(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, $3)
     WHERE user_id = $1 AND id = $2`,
    [userId, notificationId, nowIso()],
  );
}

async function markNotificationReadSqlite(userId: string, notificationId: string): Promise<void> {
  await sqliteRun(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, ?)
     WHERE user_id = ? AND id = ?`,
    [nowIso(), userId, notificationId],
  );
}

async function markNotificationReadLocal(userId: string, notificationId: string): Promise<void> {
  const store = await readStoreFile();
  const now = nowIso();
  store.notifications = store.notifications.map((item) =>
    item.userId === userId && item.id === notificationId && !item.readAt ? { ...item, readAt: now } : item,
  );
  await writeStoreFile(store);
}

async function markAllNotificationsReadPostgres(userId: string): Promise<void> {
  await postgresQuery(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, $2)
     WHERE user_id = $1`,
    [userId, nowIso()],
  );
}

async function markAllNotificationsReadSqlite(userId: string): Promise<void> {
  await sqliteRun(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, ?)
     WHERE user_id = ?`,
    [nowIso(), userId],
  );
}

async function markAllNotificationsReadLocal(userId: string): Promise<void> {
  const store = await readStoreFile();
  const now = nowIso();
  store.notifications = store.notifications.map((item) => (item.userId === userId && !item.readAt ? { ...item, readAt: now } : item));
  await writeStoreFile(store);
}

async function requestWithdrawalPostgres(userId: string, amountCents: number, method: string): Promise<{ id: string }> {
  const summary = await getFinanceSummaryPostgres(userId);
  const normalizedAmount = Math.max(100, Math.round(amountCents));
  if (normalizedAmount > summary.availableBalanceCents) {
    throw new Error("Saldo insuficiente para saque.");
  }

  const now = nowIso();
  const id = createId(`withdraw:${userId}:${now}:${normalizedAmount}`);
  await postgresQuery(
    `INSERT INTO withdrawals (id, user_id, amount_cents, method, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'requested', $5, $5)`,
    [id, userId, normalizedAmount, method, now],
  );

  await createNotification(
    userId,
    "withdrawal_requested",
    "Saque solicitado",
    "Recebemos sua solicitação de saque e ela já está em análise.",
    "/financeiro",
  );

  return { id };
}

async function requestWithdrawalSqlite(userId: string, amountCents: number, method: string): Promise<{ id: string }> {
  const summary = await getFinanceSummarySqlite(userId);
  const normalizedAmount = Math.max(100, Math.round(amountCents));
  if (normalizedAmount > summary.availableBalanceCents) {
    throw new Error("Saldo insuficiente para saque.");
  }

  const now = nowIso();
  const id = createId(`withdraw:${userId}:${now}:${normalizedAmount}`);
  await sqliteRun(
    `INSERT INTO withdrawals (id, user_id, amount_cents, method, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'requested', ?, ?)`,
    [id, userId, normalizedAmount, method, now, now],
  );

  await createNotification(
    userId,
    "withdrawal_requested",
    "Saque solicitado",
    "Recebemos sua solicitação de saque e ela já está em análise.",
    "/financeiro",
  );

  return { id };
}

async function getAffiliateSummaryPostgres(userId: string): Promise<AffiliateSummary | null> {
  const rows = await postgresQuery<{
    id: string;
    status: string;
    referral_code: string;
    note: string | null;
    created_at: Date | string;
    updated_at: Date | string;
  }>(
    `SELECT id, status, referral_code, note, created_at, updated_at
     FROM affiliates
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    status: row.status as AffiliateStatus,
    referralCode: row.referral_code,
    referralLink: `/marketplace?ref=${encodeURIComponent(row.referral_code)}`,
    note: row.note,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function getAffiliateSummarySqlite(userId: string): Promise<AffiliateSummary | null> {
  const row = await sqliteGet<{
    id: string;
    status: string;
    referral_code: string;
    note: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, status, referral_code, note, created_at, updated_at
     FROM affiliates
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  if (!row) return null;

  return {
    id: row.id,
    status: row.status as AffiliateStatus,
    referralCode: row.referral_code,
    referralLink: `/marketplace?ref=${encodeURIComponent(row.referral_code)}`,
    note: row.note,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function requestAffiliatePostgres(userId: string): Promise<AffiliateSummary> {
  const now = nowIso();
  const existing = await getAffiliateSummaryPostgres(userId);
  if (existing) {
    if (existing.status !== "pending") {
      await postgresQuery(
        `UPDATE affiliates
         SET status = 'pending', note = NULL, updated_at = $2
         WHERE user_id = $1`,
        [userId, now],
      );
      const refreshed = await getAffiliateSummaryPostgres(userId);
      if (refreshed) return refreshed;
    }
    return existing;
  }

  const id = createId(`affiliate:${userId}:${now}`);
  const referralCode = createHash("sha256").update(`ref:${userId}`).digest("hex").slice(0, 10);
  await postgresQuery(
    `INSERT INTO affiliates (id, user_id, status, referral_code, note, created_at, updated_at)
     VALUES ($1, $2, 'pending', $3, NULL, $4, $4)`,
    [id, userId, referralCode, now],
  );

  await createNotification(
    userId,
    "affiliate_pending",
    "Afiliação solicitada",
    "Sua solicitação de afiliação foi registrada e está em análise.",
    "/afiliados",
  );

  const created = await getAffiliateSummaryPostgres(userId);
  if (!created) throw new Error("Não foi possível criar solicitação de afiliação.");
  return created;
}

async function requestAffiliateSqlite(userId: string): Promise<AffiliateSummary> {
  const now = nowIso();
  const existing = await getAffiliateSummarySqlite(userId);
  if (existing) {
    if (existing.status !== "pending") {
      await sqliteRun(
        `UPDATE affiliates
         SET status = 'pending', note = NULL, updated_at = ?
         WHERE user_id = ?`,
        [now, userId],
      );
      const refreshed = await getAffiliateSummarySqlite(userId);
      if (refreshed) return refreshed;
    }
    return existing;
  }

  const id = createId(`affiliate:${userId}:${now}`);
  const referralCode = createHash("sha256").update(`ref:${userId}`).digest("hex").slice(0, 10);
  await sqliteRun(
    `INSERT INTO affiliates (id, user_id, status, referral_code, note, created_at, updated_at)
     VALUES (?, ?, 'pending', ?, NULL, ?, ?)`,
    [id, userId, referralCode, now, now],
  );

  await createNotification(
    userId,
    "affiliate_pending",
    "Afiliação solicitada",
    "Sua solicitação de afiliação foi registrada e está em análise.",
    "/afiliados",
  );

  const created = await getAffiliateSummarySqlite(userId);
  if (!created) throw new Error("Não foi possível criar solicitação de afiliação.");
  return created;
}

async function listUsersPostgres(): Promise<UserRecord[]> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{
    id: string;
    name: string;
    email: string;
    business_type: string;
    password_hash: string;
    created_at: Date | string;
    updated_at: Date | string;
  }>(
    `SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`,
  );
  return rows.map(mapUserRow);
}

async function countUsersPostgres(): Promise<number> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM users`);
  return Number(rows[0]?.total ?? 0);
}

async function createUserPostgres(input: {
  name: string;
  email: string;
  password: string;
  businessType: BusinessType;
}): Promise<UserRecord> {
  await ensureDatabaseSchema();
  const email = normalizeEmail(input.email);

  const existing = await postgresQuery<{ id: string }>(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
  if (existing.length > 0) {
    throw new Error("Já existe um cadastro com este email.");
  }

  const now = nowIso();
  const user: UserRecord = {
    id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
    name: input.name.trim(),
    email,
    businessType: input.businessType,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };

  await postgresQuery(
    `INSERT INTO users (id, name, email, business_type, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.id, user.name, user.email, user.businessType, user.passwordHash, user.createdAt, user.updatedAt],
  );

  return user;
}

async function findUserByEmailPostgres(emailInput: string): Promise<UserRecord | null> {
  await ensureDatabaseSchema();
  const email = normalizeEmail(emailInput);

  const rows = await postgresQuery<{
    id: string;
    name: string;
    email: string;
    business_type: string;
    password_hash: string;
    created_at: Date | string;
    updated_at: Date | string;
  }>(
    `SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return rows[0] ? mapUserRow(rows[0]) : null;
}

async function authenticateUserPostgres(input: { email: string; password: string }): Promise<UserRecord> {
  const user = await findUserByEmailPostgres(input.email);
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Email ou senha inválidos.");
  }

  user.updatedAt = nowIso();
  await postgresQuery(`UPDATE users SET updated_at = $2 WHERE id = $1`, [user.id, user.updatedAt]);
  return user;
}

async function createSessionPostgres(userId: string): Promise<SessionRecord> {
  await ensureDatabaseSchema();
  await cleanupExpiredSessionsPostgres();
  const now = nowIso();
  const token = randomBytes(24).toString("hex");
  const tokenDigest = hashToken(token);
  const expiresAt = sessionExpiryIso();

  await postgresQuery(`DELETE FROM sessions WHERE user_id = $1 OR expires_at <= NOW()`, [userId]);
  await postgresQuery(
    `INSERT INTO sessions (token_hash, user_id, created_at, last_login_at, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [tokenDigest, userId, now, now, expiresAt],
  );

  return {
    tokenHash: token,
    userId,
    createdAt: now,
    lastLoginAt: now,
    expiresAt,
  };
}

async function getSessionPostgres(token: string): Promise<{ session: SessionRecord; user: UserRecord } | null> {
  await ensureDatabaseSchema();
  await cleanupExpiredSessionsPostgres();
  const tokenDigest = hashToken(token);

  const queryRowsByDigest = async (digest: string) =>
    postgresQuery<{
    token_hash: string;
    user_id: string;
    created_at: Date | string;
    last_login_at: Date | string;
    expires_at: Date | string;
    id: string;
    name: string;
    email: string;
    business_type: string;
    password_hash: string;
    user_created_at: Date | string;
    user_updated_at: Date | string;
  }>(
    `SELECT s.token_hash, s.user_id, s.created_at, s.last_login_at, s.expires_at,
            u.id, u.name, u.email, u.business_type, u.password_hash,
            u.created_at AS user_created_at, u.updated_at AS user_updated_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
     LIMIT 1`,
    [digest],
  );

  let rows = await queryRowsByDigest(tokenDigest);

  let row = rows[0];
  let resolvedDigest = tokenDigest;
  if (!row) {
    const fallbackDigest = resolveSessionRotationFallback(tokenDigest);
    if (fallbackDigest) {
      rows = await queryRowsByDigest(fallbackDigest);
      row = rows[0];
      resolvedDigest = fallbackDigest;
    }
  }

  if (!row) return null;

  const updatedAt = nowIso();
  await postgresQuery(`UPDATE sessions SET last_login_at = $2 WHERE token_hash = $1`, [resolvedDigest, updatedAt]);

  return {
    session: {
      tokenHash: row.token_hash,
      userId: row.user_id,
      createdAt: new Date(row.created_at).toISOString(),
      lastLoginAt: updatedAt,
      expiresAt: new Date(row.expires_at).toISOString(),
    },
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      businessType: row.business_type as BusinessType,
      passwordHash: row.password_hash,
      createdAt: new Date(row.user_created_at).toISOString(),
      updatedAt: new Date(row.user_updated_at).toISOString(),
    },
  };
}

async function deleteSessionPostgres(token: string): Promise<void> {
  await ensureDatabaseSchema();
  const tokenDigest = hashToken(token);
  await postgresQuery(`DELETE FROM sessions WHERE token_hash = $1`, [tokenDigest]);
}

async function requestPasswordResetPostgres(emailInput: string): Promise<PasswordResetRequestResult> {
  await ensureDatabaseSchema();
  const user = await findUserByEmailPostgres(emailInput);
  if (!user) return { ok: true };

  const createdAt = nowIso();
  const expiresAt = passwordResetExpiryIso();
  const token = randomBytes(24).toString("hex");
  const tokenDigest = hashToken(token);

  await postgresQuery(`DELETE FROM password_resets WHERE user_id = $1 OR expires_at <= NOW() OR used_at IS NOT NULL`, [user.id]);
  await postgresQuery(
    `INSERT INTO password_resets (token_hash, user_id, created_at, expires_at, used_at)
     VALUES ($1, $2, $3, $4, NULL)`,
    [tokenDigest, user.id, createdAt, expiresAt],
  );

  return { ok: true, resetToken: token };
}

async function resetPasswordWithTokenPostgres(token: string, newPassword: string): Promise<void> {
  await ensureDatabaseSchema();
  const tokenDigest = hashToken(token);

  const rows = await postgresQuery<{
    user_id: string;
    expires_at: Date | string;
    used_at: Date | string | null;
  }>(
    `SELECT user_id, expires_at, used_at
     FROM password_resets
     WHERE token_hash = $1
     LIMIT 1`,
    [tokenDigest],
  );

  const reset = rows[0];
  if (!reset) {
    throw new Error("Token de recuperação inválido.");
  }

  if (reset.used_at) {
    throw new Error("Este token já foi utilizado.");
  }

  if (new Date(reset.expires_at).getTime() <= Date.now()) {
    throw new Error("Token de recuperação expirado.");
  }

  const updatedAt = nowIso();
  await postgresQuery(`UPDATE users SET password_hash = $2, updated_at = $3 WHERE id = $1`, [reset.user_id, hashPassword(newPassword), updatedAt]);
  await postgresQuery(`UPDATE password_resets SET used_at = $2 WHERE token_hash = $1`, [tokenDigest, updatedAt]);
  await postgresQuery(`DELETE FROM sessions WHERE user_id = $1`, [reset.user_id]);
}

async function listUsersSqlite(): Promise<UserRecord[]> {
  const rows = await sqliteAll<{
    id: string;
    name: string;
    email: string;
    business_type: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`,
  );

  return rows.map((row) =>
    mapUserRow({
      ...row,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  );
}

async function countUsersSqlite(): Promise<number> {
  const row = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM users`);
  return Number(row?.total ?? 0);
}

async function createUserSqlite(input: {
  name: string;
  email: string;
  password: string;
  businessType: BusinessType;
}): Promise<UserRecord> {
  const email = normalizeEmail(input.email);
  const existing = await sqliteGet<{ id: string }>(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
  if (existing) {
    throw new Error("Já existe um cadastro com este email.");
  }

  const now = nowIso();
  const user: UserRecord = {
    id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
    name: input.name.trim(),
    email,
    businessType: input.businessType,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };

  await sqliteRun(
    `INSERT INTO users (id, name, email, business_type, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.id, user.name, user.email, user.businessType, user.passwordHash, user.createdAt, user.updatedAt],
  );

  return user;
}

async function findUserByEmailSqlite(emailInput: string): Promise<UserRecord | null> {
  const email = normalizeEmail(emailInput);

  const row = await sqliteGet<{
    id: string;
    name: string;
    email: string;
    business_type: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  if (!row) return null;
  return mapUserRow({
    ...row,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
}

async function authenticateUserSqlite(input: { email: string; password: string }): Promise<UserRecord> {
  const user = await findUserByEmailSqlite(input.email);

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Email ou senha inválidos.");
  }

  user.updatedAt = nowIso();
  await sqliteRun(`UPDATE users SET updated_at = ? WHERE id = ?`, [user.updatedAt, user.id]);
  return user;
}

async function createSessionSqlite(userId: string): Promise<SessionRecord> {
  await cleanupExpiredSessionsSqlite();

  const now = nowIso();
  const token = randomBytes(24).toString("hex");
  const tokenDigest = hashToken(token);
  const expiresAt = sessionExpiryIso();

  await sqliteRun(`DELETE FROM sessions WHERE user_id = ? OR expires_at <= ?`, [userId, now]);
  await sqliteRun(
    `INSERT INTO sessions (token_hash, user_id, created_at, last_login_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [tokenDigest, userId, now, now, expiresAt],
  );

  return {
    tokenHash: token,
    userId,
    createdAt: now,
    lastLoginAt: now,
    expiresAt,
  };
}

async function getSessionSqlite(token: string): Promise<{ session: SessionRecord; user: UserRecord } | null> {
  await cleanupExpiredSessionsSqlite();
  const tokenDigest = hashToken(token);

  const queryRowByDigest = async (digest: string) =>
    sqliteGet<{
    token_hash: string;
    user_id: string;
    created_at: string;
    last_login_at: string;
    expires_at: string;
    id: string;
    name: string;
    email: string;
    business_type: string;
    password_hash: string;
    user_created_at: string;
    user_updated_at: string;
  }>(
    `SELECT s.token_hash, s.user_id, s.created_at, s.last_login_at, s.expires_at,
            u.id, u.name, u.email, u.business_type, u.password_hash,
            u.created_at AS user_created_at, u.updated_at AS user_updated_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?
     LIMIT 1`,
    [digest],
  );

  let row = await queryRowByDigest(tokenDigest);
  let resolvedDigest = tokenDigest;
  if (!row) {
    const fallbackDigest = resolveSessionRotationFallback(tokenDigest);
    if (fallbackDigest) {
      row = await queryRowByDigest(fallbackDigest);
      resolvedDigest = fallbackDigest;
    }
  }

  if (!row) return null;

  const updatedAt = nowIso();
  await sqliteRun(`UPDATE sessions SET last_login_at = ? WHERE token_hash = ?`, [updatedAt, resolvedDigest]);

  return {
    session: {
      tokenHash: row.token_hash,
      userId: row.user_id,
      createdAt: new Date(row.created_at).toISOString(),
      lastLoginAt: updatedAt,
      expiresAt: new Date(row.expires_at).toISOString(),
    },
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      businessType: row.business_type as BusinessType,
      passwordHash: row.password_hash,
      createdAt: new Date(row.user_created_at).toISOString(),
      updatedAt: new Date(row.user_updated_at).toISOString(),
    },
  };
}

async function deleteSessionSqlite(token: string): Promise<void> {
  const tokenDigest = hashToken(token);
  await sqliteRun(`DELETE FROM sessions WHERE token_hash = ?`, [tokenDigest]);
}

async function requestPasswordResetSqlite(emailInput: string): Promise<PasswordResetRequestResult> {
  const user = await findUserByEmailSqlite(emailInput);
  if (!user) return { ok: true };

  const createdAt = nowIso();
  const expiresAt = passwordResetExpiryIso();
  const token = randomBytes(24).toString("hex");
  const tokenDigest = hashToken(token);

  await sqliteRun(`DELETE FROM password_resets WHERE user_id = ? OR expires_at <= ? OR used_at IS NOT NULL`, [user.id, createdAt]);
  await sqliteRun(
    `INSERT INTO password_resets (token_hash, user_id, created_at, expires_at, used_at)
     VALUES (?, ?, ?, ?, NULL)`,
    [tokenDigest, user.id, createdAt, expiresAt],
  );

  return { ok: true, resetToken: token };
}

async function resetPasswordWithTokenSqlite(token: string, newPassword: string): Promise<void> {
  const tokenDigest = hashToken(token);
  const reset = await sqliteGet<{
    user_id: string;
    expires_at: string;
    used_at: string | null;
  }>(
    `SELECT user_id, expires_at, used_at
     FROM password_resets
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenDigest],
  );

  if (!reset) {
    throw new Error("Token de recuperação inválido.");
  }

  if (reset.used_at) {
    throw new Error("Este token já foi utilizado.");
  }

  if (new Date(reset.expires_at).getTime() <= Date.now()) {
    throw new Error("Token de recuperação expirado.");
  }

  const updatedAt = nowIso();
  await sqliteRun(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`, [hashPassword(newPassword), updatedAt, reset.user_id]);
  await sqliteRun(`UPDATE password_resets SET used_at = ? WHERE token_hash = ?`, [updatedAt, tokenDigest]);
  await sqliteRun(`DELETE FROM sessions WHERE user_id = ?`, [reset.user_id]);
}

async function rotateSessionSqlite(token: string): Promise<{ token: string; session: SessionRecord } | null> {
  await cleanupExpiredSessionsSqlite();
  const oldDigest = hashToken(token);

  const row = await sqliteGet<{
    user_id: string;
    created_at: string;
    last_login_at: string;
  }>(`SELECT user_id, created_at, last_login_at FROM sessions WHERE token_hash = ? LIMIT 1`, [oldDigest]);

  if (!row) return null;
  if (!shouldRotateSessionByLastLogin(row.last_login_at)) return null;

  const rotatedToken = randomBytes(24).toString("hex");
  const rotatedDigest = hashToken(rotatedToken);
  const lastLoginAt = nowIso();
  const expiresAt = sessionExpiryIso();

  await sqliteRun(
    `UPDATE sessions
     SET token_hash = ?,
         last_login_at = ?,
         expires_at = ?
     WHERE token_hash = ?`,
    [rotatedDigest, lastLoginAt, expiresAt, oldDigest],
  );

  registerSessionRotationFallback(oldDigest, rotatedDigest);

  return {
    token: rotatedToken,
    session: {
      tokenHash: rotatedDigest,
      userId: row.user_id,
      createdAt: new Date(row.created_at).toISOString(),
      lastLoginAt,
      expiresAt,
    },
  };
}

async function getDashboardSummarySqlite(): Promise<{
  userCount: number;
  sessionCount: number;
  sessionsExpiringSoon: number;
  byBusiness: Record<BusinessType, number>;
  latestUsers: Array<Pick<UserRecord, "name" | "email" | "businessType" | "createdAt">>;
}> {
  await cleanupExpiredSessionsSqlite();

  const userCountRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM users`);
  const sessionCountRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM sessions`);

  const businessRows = await sqliteAll<{ business_type: string; total: number }>(
    `SELECT business_type, COUNT(*) AS total FROM users GROUP BY business_type`,
  );

  const latestRows = await sqliteAll<{
    name: string;
    email: string;
    business_type: string;
    created_at: string;
  }>(
    `SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`,
  );

  const sessions = await sqliteAll<{ expires_at: string }>(`SELECT expires_at FROM sessions`);
  const sessionsExpiringSoon = sessions.filter((session) => {
    const timeToExpire = new Date(session.expires_at).getTime() - Date.now();
    return timeToExpire > 0 && timeToExpire <= 1000 * 60 * 60;
  }).length;

  const byBusiness: Record<BusinessType, number> = {
    "Produtor digital": 0,
    Infoprodutor: 0,
    Afiliado: 0,
    "Agência": 0,
    "E-commerce": 0,
    "Serviços": 0,
  };

  for (const row of businessRows) {
    const key = row.business_type as BusinessType;
    if (key in byBusiness) {
      byBusiness[key] = Number(row.total);
    }
  }

  return {
    userCount: Number(userCountRow?.total ?? 0),
    sessionCount: Number(sessionCountRow?.total ?? 0),
    sessionsExpiringSoon,
    byBusiness,
    latestUsers: latestRows.map((row) => ({
      name: row.name,
      email: row.email,
      businessType: row.business_type as BusinessType,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
}

async function getDashboardSummaryPostgres(): Promise<{
  userCount: number;
  sessionCount: number;
  sessionsExpiringSoon: number;
  byBusiness: Record<BusinessType, number>;
  latestUsers: Array<Pick<UserRecord, "name" | "email" | "businessType" | "createdAt">>;
}> {
  await ensureDatabaseSchema();
  await cleanupExpiredSessionsPostgres();

  const userCountRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM users`);
  const sessionCountRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM sessions`);
  const expiringRows = await postgresQuery<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM sessions WHERE expires_at > NOW() AND expires_at <= NOW() + INTERVAL '1 hour'`,
  );

  const businessRows = await postgresQuery<{ business_type: string; total: string }>(
    `SELECT business_type, COUNT(*)::text AS total FROM users GROUP BY business_type`,
  );

  const latestRows = await postgresQuery<{
    name: string;
    email: string;
    business_type: string;
    created_at: Date | string;
  }>(
    `SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`,
  );

  const byBusiness: Record<BusinessType, number> = {
    "Produtor digital": 0,
    Infoprodutor: 0,
    Afiliado: 0,
    "Agência": 0,
    "E-commerce": 0,
    "Serviços": 0,
  };

  for (const row of businessRows) {
    const key = row.business_type as BusinessType;
    if (key in byBusiness) {
      byBusiness[key] = Number(row.total);
    }
  }

  return {
    userCount: Number(userCountRows[0]?.total ?? 0),
    sessionCount: Number(sessionCountRows[0]?.total ?? 0),
    sessionsExpiringSoon: Number(expiringRows[0]?.total ?? 0),
    byBusiness,
    latestUsers: latestRows.map((row) => ({
      name: row.name,
      email: row.email,
      businessType: row.business_type as BusinessType,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
}

export async function listUsers(): Promise<UserRecord[]> {
  if (isPostgresEnabled()) return listUsersPostgres();
  if (isSqliteEnabled()) return listUsersSqlite();

  const store = await readStoreFile();
  return [...store.users].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function countUsers(): Promise<number> {
  if (isPostgresEnabled()) return countUsersPostgres();
  if (isSqliteEnabled()) return countUsersSqlite();

  const store = await readStoreFile();
  return store.users.length;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  businessType: BusinessType;
}): Promise<UserRecord> {
  if (isPostgresEnabled()) return createUserPostgres(input);
  if (isSqliteEnabled()) return createUserSqlite(input);

  const store = await readStoreFile();
  const email = normalizeEmail(input.email);
  if (store.users.some((user) => normalizeEmail(user.email) === email)) {
    throw new Error("Já existe um cadastro com este email.");
  }

  const now = nowIso();
  const user: UserRecord = {
    id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
    name: input.name.trim(),
    email,
    businessType: input.businessType,
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  await writeStoreFile(store);
  return user;
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<UserRecord> {
  if (isPostgresEnabled()) return authenticateUserPostgres(input);
  if (isSqliteEnabled()) return authenticateUserSqlite(input);

  const store = await readStoreFile();
  const email = normalizeEmail(input.email);
  const user = store.users.find((candidate) => normalizeEmail(candidate.email) === email);

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Email ou senha inválidos.");
  }

  user.updatedAt = nowIso();
  await writeStoreFile(store);
  return user;
}

export async function requestPasswordReset(emailInput: string): Promise<PasswordResetRequestResult> {
  if (isPostgresEnabled()) return requestPasswordResetPostgres(emailInput);
  if (isSqliteEnabled()) return requestPasswordResetSqlite(emailInput);

  const store = await readStoreFile();
  const email = normalizeEmail(emailInput);
  const user = store.users.find((candidate) => normalizeEmail(candidate.email) === email);
  if (!user) {
    return { ok: true };
  }

  const createdAt = nowIso();
  const expiresAt = passwordResetExpiryIso();
  const token = randomBytes(24).toString("hex");
  const tokenDigest = hashToken(token);

  store.passwordResets = store.passwordResets.filter(
    (candidate) => candidate.userId !== user.id && candidate.expiresAt > createdAt && !candidate.usedAt,
  );

  store.passwordResets.push({
    tokenHash: tokenDigest,
    userId: user.id,
    createdAt,
    expiresAt,
    usedAt: null,
  });

  await writeStoreFile(store);
  return { ok: true, resetToken: token };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  if (isPostgresEnabled()) return resetPasswordWithTokenPostgres(token, newPassword);
  if (isSqliteEnabled()) return resetPasswordWithTokenSqlite(token, newPassword);

  const store = await readStoreFile();
  const tokenDigest = hashToken(token);
  const reset = store.passwordResets.find((candidate) => candidate.tokenHash === tokenDigest);

  if (!reset) {
    throw new Error("Token de recuperação inválido.");
  }

  if (reset.usedAt) {
    throw new Error("Este token já foi utilizado.");
  }

  if (new Date(reset.expiresAt).getTime() <= Date.now()) {
    throw new Error("Token de recuperação expirado.");
  }

  const user = store.users.find((candidate) => candidate.id === reset.userId);
  if (!user) {
    throw new Error("Usuário não encontrado para redefinir senha.");
  }

  const updatedAt = nowIso();
  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = updatedAt;
  reset.usedAt = updatedAt;
  store.sessions = store.sessions.filter((candidate) => candidate.userId !== user.id);

  await writeStoreFile(store);
}

export async function createSession(userId: string): Promise<SessionRecord> {
  if (isPostgresEnabled()) return createSessionPostgres(userId);
  if (isSqliteEnabled()) return createSessionSqlite(userId);

  await cleanupExpiredSessionsLocal();
  const store = await readStoreFile();
  const now = nowIso();
  const rawToken = randomBytes(24).toString("hex");
  const expiresAt = sessionExpiryIso();

  const session: SessionRecord = {
    tokenHash: hashToken(rawToken),
    userId,
    createdAt: now,
    lastLoginAt: now,
    expiresAt,
  };

  store.sessions = store.sessions.filter((candidate) => candidate.userId !== userId && !isSessionExpired(candidate));
  store.sessions.push(session);
  await writeStoreFile(store);
  return {
    ...session,
    tokenHash: rawToken,
  };
}

export async function getSession(token: string): Promise<{ session: SessionRecord; user: UserRecord } | null> {
  if (isPostgresEnabled()) return getSessionPostgres(token);
  if (isSqliteEnabled()) return getSessionSqlite(token);

  await cleanupExpiredSessionsLocal();
  const store = await readStoreFile();
  const tokenDigest = hashToken(token);
  const fallbackDigest = resolveSessionRotationFallback(tokenDigest);
  const resolvedDigest = fallbackDigest ?? tokenDigest;
  const session = store.sessions.find((candidate) => candidate.tokenHash === resolvedDigest);
  if (!session) return null;

  const user = store.users.find((candidate) => candidate.id === session.userId);
  if (!user) return null;

  session.lastLoginAt = nowIso();
  await writeStoreFile(store);

  return { session, user };
}

async function rotateSessionPostgres(token: string): Promise<{ token: string; session: SessionRecord } | null> {
  await ensureDatabaseSchema();
  await cleanupExpiredSessionsPostgres();

  const oldDigest = hashToken(token);
  const rows = await postgresQuery<{
    user_id: string;
    created_at: Date | string;
    last_login_at: Date | string;
  }>(`SELECT user_id, created_at, last_login_at FROM sessions WHERE token_hash = $1 LIMIT 1`, [oldDigest]);

  const sessionRow = rows[0];
  if (!sessionRow) return null;
  if (!shouldRotateSessionByLastLogin(String(sessionRow.last_login_at))) return null;

  const rotatedToken = randomBytes(24).toString("hex");
  const rotatedDigest = hashToken(rotatedToken);
  const lastLoginAt = nowIso();
  const expiresAt = sessionExpiryIso();

  await postgresQuery(
    `UPDATE sessions
     SET token_hash = $2,
         last_login_at = $3,
         expires_at = $4
     WHERE token_hash = $1`,
    [oldDigest, rotatedDigest, lastLoginAt, expiresAt],
  );

  registerSessionRotationFallback(oldDigest, rotatedDigest);

  return {
    token: rotatedToken,
    session: {
      tokenHash: rotatedDigest,
      userId: sessionRow.user_id,
      createdAt: new Date(sessionRow.created_at).toISOString(),
      lastLoginAt,
      expiresAt,
    },
  };
}

async function rotateSessionLocal(token: string): Promise<{ token: string; session: SessionRecord } | null> {
  await cleanupExpiredSessionsLocal();

  const store = await readStoreFile();
  const tokenDigest = hashToken(token);
  const session = store.sessions.find((candidate) => candidate.tokenHash === tokenDigest);
  if (!session) return null;
  if (!shouldRotateSessionByLastLogin(session.lastLoginAt)) return null;

  const rotatedToken = randomBytes(24).toString("hex");
  const rotatedDigest = hashToken(rotatedToken);

  session.tokenHash = rotatedDigest;
  session.lastLoginAt = nowIso();
  session.expiresAt = sessionExpiryIso();
  await writeStoreFile(store);

  registerSessionRotationFallback(tokenDigest, rotatedDigest);

  return {
    token: rotatedToken,
    session: {
      ...session,
    },
  };
}

export async function rotateSession(token: string): Promise<{ token: string; session: SessionRecord } | null> {
  if (isPostgresEnabled()) return rotateSessionPostgres(token);
  if (isSqliteEnabled()) return rotateSessionSqlite(token);
  return rotateSessionLocal(token);
}

export async function deleteSession(token: string): Promise<void> {
  if (isPostgresEnabled()) {
    await deleteSessionPostgres(token);
    return;
  }

  if (isSqliteEnabled()) {
    await deleteSessionSqlite(token);
    return;
  }

  const store = await readStoreFile();
  const tokenDigest = hashToken(token);
  store.sessions = store.sessions.filter((candidate) => candidate.tokenHash !== tokenDigest);
  await writeStoreFile(store);
}

export async function listMyProducts(userId: string): Promise<ProductRecord[]> {
  if (isPostgresEnabled()) return listMyProductsPostgres(userId);
  if (isSqliteEnabled()) return listMyProductsSqlite(userId);
  throw new Error("Persistência de produtos não configurada.");
}

export async function listMarketplaceProducts(): Promise<ProductRecord[]> {
  if (isPostgresEnabled()) return listMarketplaceProductsPostgres();
  if (isSqliteEnabled()) return listMarketplaceProductsSqlite();
  throw new Error("Persistência de produtos não configurada.");
}

export async function getMarketplaceProductById(productId: string): Promise<ProductRecord | null> {
  if (isPostgresEnabled()) return findPublishedProductPostgres(productId);
  if (isSqliteEnabled()) return findPublishedProductSqlite(productId);
  throw new Error("Persistência de produtos não configurada.");
}

export async function createProduct(
  userId: string,
  input: { name: string; description: string; category: string; priceCents: number },
): Promise<ProductRecord> {
  if (isPostgresEnabled()) return createProductPostgres(userId, input);
  if (isSqliteEnabled()) return createProductSqlite(userId, input);
  throw new Error("Persistência de produtos não configurada.");
}

export async function publishProduct(userId: string, productId: string): Promise<ProductRecord> {
  if (isPostgresEnabled()) return publishProductPostgres(userId, productId);
  if (isSqliteEnabled()) return publishProductSqlite(userId, productId);
  throw new Error("Persistência de produtos não configurada.");
}

export async function buyProduct(userId: string, productId: string, paymentMethod: PaymentMethod): Promise<{ orderId: string; enrollmentId: string }> {
  if (isPostgresEnabled()) return buyProductPostgres(userId, productId, paymentMethod);
  if (isSqliteEnabled()) return buyProductSqlite(userId, productId, paymentMethod);
  throw new Error("Persistência de pedidos não configurada.");
}

export async function createCheckoutOrder(
  userId: string,
  productId: string,
  paymentMethod: PaymentMethod,
): Promise<CheckoutOrderResult> {
  if (isPostgresEnabled()) return createCheckoutOrderPostgres(userId, productId, paymentMethod);
  if (isSqliteEnabled()) return createCheckoutOrderSqlite(userId, productId, paymentMethod);
  throw new Error("Persistência de pedidos não configurada.");
}

export async function processCheckoutPaymentWebhook(input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookResult> {
  if (isPostgresEnabled()) return processPaymentWebhookPostgres(input);
  if (isSqliteEnabled()) return processPaymentWebhookSqlite(input);
  throw new Error("Persistência de pedidos não configurada.");
}

export async function transitionCheckoutOrderStatus(
  userId: string,
  orderId: string,
  nextStatus: Exclude<OrderStatus, "pending">,
): Promise<{ orderId: string; status: OrderStatus; enrollmentCreated: boolean }> {
  if (isPostgresEnabled()) return transitionOrderStatusPostgres(userId, orderId, nextStatus);
  if (isSqliteEnabled()) return transitionOrderStatusSqlite(userId, orderId, nextStatus);
  throw new Error("Persistência de pedidos não configurada.");
}

export async function listMyOrders(userId: string, filters?: OrderFilters): Promise<OrderRecord[]> {
  if (isPostgresEnabled()) return listMyOrdersPostgres(userId, filters);
  if (isSqliteEnabled()) return listMyOrdersSqlite(userId, filters);
  throw new Error("Persistência de pedidos não configurada.");
}

export async function listMyOrderTimeline(userId: string, orderId: string): Promise<OrderTimelineEvent[]> {
  if (isPostgresEnabled()) return listOrderTimelinePostgres(userId, orderId);
  if (isSqliteEnabled()) return listOrderTimelineSqlite(userId, orderId);
  throw new Error("Persistência de pedidos não configurada.");
}

export async function listMyLearningTrack(userId: string, productId: string): Promise<LearningModuleRecord[]> {
  if (isPostgresEnabled()) return listLearningTrackPostgres(userId, productId);
  if (isSqliteEnabled()) return listLearningTrackSqlite(userId, productId);
  throw new Error("Persistência de conteúdo não configurada.");
}

export async function updateMyLessonProgress(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<{ productId: string; progressPercent: number; completedLessons: number; totalLessons: number }> {
  if (isPostgresEnabled()) return updateLessonProgressPostgres(userId, lessonId, completed);
  if (isSqliteEnabled()) return updateLessonProgressSqlite(userId, lessonId, completed);
  throw new Error("Persistência de conteúdo não configurada.");
}

export async function listMyEnrollments(userId: string): Promise<EnrollmentRecord[]> {
  if (isPostgresEnabled()) return listEnrollmentsPostgres(userId);
  if (isSqliteEnabled()) return listEnrollmentsSqlite(userId);
  throw new Error("Persistência de matrículas não configurada.");
}

export async function getFinanceSummary(userId: string): Promise<FinanceSummary> {
  if (isPostgresEnabled()) return getFinanceSummaryPostgres(userId);
  if (isSqliteEnabled()) return getFinanceSummarySqlite(userId);
  throw new Error("Persistência financeira não configurada.");
}

export async function getAffiliateSummary(userId: string): Promise<AffiliateSummary | null> {
  if (isPostgresEnabled()) return getAffiliateSummaryPostgres(userId);
  if (isSqliteEnabled()) return getAffiliateSummarySqlite(userId);
  throw new Error("Persistência de afiliados não configurada.");
}

export async function requestAffiliate(userId: string): Promise<AffiliateSummary> {
  if (isPostgresEnabled()) return requestAffiliatePostgres(userId);
  if (isSqliteEnabled()) return requestAffiliateSqlite(userId);
  throw new Error("Persistência de afiliados não configurada.");
}

export async function listMyNotifications(userId: string, limit = 20): Promise<NotificationRecord[]> {
  if (isPostgresEnabled()) return listNotificationsPostgres(userId, limit);
  if (isSqliteEnabled()) return listNotificationsSqlite(userId, limit);
  return listNotificationsLocal(userId, limit);
}

export async function markMyNotificationRead(userId: string, notificationId: string): Promise<void> {
  if (isPostgresEnabled()) {
    await markNotificationReadPostgres(userId, notificationId);
    return;
  }

  if (isSqliteEnabled()) {
    await markNotificationReadSqlite(userId, notificationId);
    return;
  }

  await markNotificationReadLocal(userId, notificationId);
}

export async function markAllMyNotificationsRead(userId: string): Promise<void> {
  if (isPostgresEnabled()) {
    await markAllNotificationsReadPostgres(userId);
    return;
  }

  if (isSqliteEnabled()) {
    await markAllNotificationsReadSqlite(userId);
    return;
  }

  await markAllNotificationsReadLocal(userId);
}

export async function requestWithdrawal(userId: string, amountCents: number, method: string): Promise<{ id: string }> {
  if (isPostgresEnabled()) return requestWithdrawalPostgres(userId, amountCents, method);
  if (isSqliteEnabled()) return requestWithdrawalSqlite(userId, amountCents, method);
  throw new Error("Persistência financeira não configurada.");
}

export async function listAdminModerationQueue(limit = 20, filters?: AdminModerationQueueFilters): Promise<AdminModerationQueueItem[]> {
  if (isPostgresEnabled()) return listAdminModerationQueuePostgres(limit, filters);
  if (isSqliteEnabled()) return listAdminModerationQueueSqlite(limit, filters);
  return [];
}

export async function listAdminModerationAudit(limit = 20): Promise<AdminModerationAuditLog[]> {
  if (isPostgresEnabled()) return listAdminModerationAuditPostgres(limit);
  if (isSqliteEnabled()) return listAdminModerationAuditSqlite(limit);
  return [];
}

export async function listAdminRoleAudit(limit = 20, filters?: AdminRoleAuditFilters): Promise<AdminRoleAuditLog[]> {
  if (isPostgresEnabled()) return listAdminRoleAuditPostgres(limit, filters);
  if (isSqliteEnabled()) return listAdminRoleAuditSqlite(limit, filters);
  return [];
}

export async function listPlatformSettings(limit = 100): Promise<PlatformSettingRecord[]> {
  if (isPostgresEnabled()) return listPlatformSettingsPostgres(limit);
  if (isSqliteEnabled()) return listPlatformSettingsSqlite(limit);
  return [];
}

export async function upsertPlatformSetting(
  key: string,
  value: string,
  updatedByUserId: string | null,
): Promise<PlatformSettingRecord> {
  if (isPostgresEnabled()) return upsertPlatformSettingPostgres(key, value, updatedByUserId);
  if (isSqliteEnabled()) return upsertPlatformSettingSqlite(key, value, updatedByUserId);
  throw new Error("Persistência de configurações de plataforma não configurada.");
}

export async function listAdminConsolidatedAudit(
  limit = 30,
  filters?: AdminConsolidatedAuditFilters,
): Promise<AdminConsolidatedAuditLog[]> {
  if (isPostgresEnabled()) return listAdminConsolidatedAuditPostgres(limit, filters);
  if (isSqliteEnabled()) return listAdminConsolidatedAuditSqlite(limit, filters);
  return [];
}

export async function listAdminUserRoles(limit = 30): Promise<AdminUserRoleDirectoryItem[]> {
  if (isPostgresEnabled()) return listAdminUserRolesPostgres(limit);
  if (isSqliteEnabled()) return listAdminUserRolesSqlite(limit);
  const users = await listUsers();
  return users.slice(0, Math.max(1, Math.min(100, limit))).map((user) => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    businessType: user.businessType,
    role: "none",
    assignedByUserId: null,
    source: null,
    approvedByUserId: null,
    approvedByName: null,
    approvedByEmail: null,
    approvedAt: null,
    approvalNote: null,
    updatedAt: user.updatedAt,
  }));
}

export async function getUserAdminRole(userId: string): Promise<AdminRole> {
  if (isPostgresEnabled()) return getUserAdminRolePostgres(userId);
  if (isSqliteEnabled()) return getUserAdminRoleSqlite(userId);
  return "none";
}

export async function countAdminUsers(): Promise<number> {
  if (isPostgresEnabled()) return countAdminUsersPostgres();
  if (isSqliteEnabled()) return countAdminUsersSqlite();
  return 0;
}

export async function setUserAdminRole(
  userId: string,
  role: AdminRole,
  assignedByUserId: string | null,
  source = "manual",
  approval?: { approvedByUserId: string | null; approvedAt?: string; approvalNote?: string | null },
): Promise<void> {
  const reason = role === "admin" ? approval?.approvalNote?.trim() || null : null;

  if (role === "none") {
    const previousRole = isPostgresEnabled()
      ? await getUserAdminRolePostgres(userId)
      : isSqliteEnabled()
        ? await getUserAdminRoleSqlite(userId)
        : "none";

    if (previousRole === "none") {
      return;
    }

    if (isPostgresEnabled()) {
      await clearUserAdminRolePostgres(userId);
      await writeUserRoleAuditLogPostgres(userId, previousRole, "none", assignedByUserId, source, reason);
      return;
    }

    if (isSqliteEnabled()) {
      await clearUserAdminRoleSqlite(userId);
      await writeUserRoleAuditLogSqlite(userId, previousRole, "none", assignedByUserId, source, reason);
      return;
    }

    return;
  }

  const previousRole = isPostgresEnabled()
    ? await getUserAdminRolePostgres(userId)
    : isSqliteEnabled()
      ? await getUserAdminRoleSqlite(userId)
      : "none";

  if (isPostgresEnabled()) {
    await setUserAdminRolePostgres(userId, role, assignedByUserId, source, approval);
    if (previousRole !== role) {
      await writeUserRoleAuditLogPostgres(userId, previousRole, role, assignedByUserId, source, reason);
    }
    return;
  }

  if (isSqliteEnabled()) {
    await setUserAdminRoleSqlite(userId, role, assignedByUserId, source, approval);
    if (previousRole !== role) {
      await writeUserRoleAuditLogSqlite(userId, previousRole, role, assignedByUserId, source, reason);
    }
    return;
  }
}

export async function moderateAdminProduct(
  adminUserId: string,
  productId: string,
  decision: ProductModerationDecision,
  reason: string | null,
): Promise<{ productId: string; moderationStatus: ProductModerationStatus; moderationReason: string | null }> {
  if (isPostgresEnabled()) return moderateProductPostgres(adminUserId, productId, decision, reason);
  if (isSqliteEnabled()) return moderateProductSqlite(adminUserId, productId, decision, reason);
  throw new Error("Persistência de moderação não configurada.");
}

export async function getDashboardSummary(): Promise<{
  userCount: number;
  sessionCount: number;
  sessionsExpiringSoon: number;
  storageMode: "postgres" | "sqlite" | "local-file";
  byBusiness: Record<BusinessType, number>;
  latestUsers: Array<Pick<UserRecord, "name" | "email" | "businessType" | "createdAt">>;
}> {
  if (isPostgresEnabled()) {
    const summary = await getDashboardSummaryPostgres();
    return {
      ...summary,
      storageMode: "postgres",
    };
  }

  if (isSqliteEnabled()) {
    const summary = await getDashboardSummarySqlite();
    return {
      ...summary,
      storageMode: "sqlite",
    };
  }

  await cleanupExpiredSessionsLocal();
  const store = await readStoreFile();

  return {
    userCount: store.users.length,
    sessionCount: store.sessions.length,
    sessionsExpiringSoon: store.sessions.filter((session) => {
      const timeToExpire = new Date(session.expiresAt).getTime() - Date.now();
      return timeToExpire > 0 && timeToExpire <= 1000 * 60 * 60;
    }).length,
    storageMode: "local-file",
    byBusiness: retentionByBusiness(store.users),
    latestUsers: store.users
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5)
      .map((user) => ({
        name: user.name,
        email: user.email,
        businessType: user.businessType,
        createdAt: user.createdAt,
      })),
  };
}

async function getAdminOverviewPostgres(): Promise<AdminOverview> {
  await ensureDatabaseSchema();

  const usersCountRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM users`);
  const productCountRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM products`);
  const publishedRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM products WHERE status = 'published'`);
  const draftRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM products WHERE status = 'draft'`);
  const pendingReviewRows = await postgresQuery<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM products WHERE COALESCE(moderation_status, 'approved') = 'pending_review'`,
  );
  const rejectedRows = await postgresQuery<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM products WHERE COALESCE(moderation_status, 'approved') = 'rejected'`,
  );
  const approvedOrdersRows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM orders WHERE status = 'approved'`);
  const grossSalesRows = await postgresQuery<{ total: string }>(
    `SELECT COALESCE(SUM(amount_cents), 0)::text AS total FROM orders WHERE status = 'approved'`,
  );

  const categoryRows = await postgresQuery<{ category: string; total: string }>(
    `SELECT category, COUNT(*)::text AS total
     FROM products
     GROUP BY category
     ORDER BY COUNT(*) DESC, category ASC
     LIMIT 8`,
  );

  const latestUserRows = await postgresQuery<{
    name: string;
    email: string;
    business_type: string;
    created_at: Date | string;
  }>(
    `SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 8`,
  );

  const latestProductRows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    owner_name: string;
    name: string;
    category: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    price_cents: string;
    created_at: Date | string;
  }>(
    `SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            p.name,
            p.category,
            p.status,
                 COALESCE(p.moderation_status, 'approved') AS moderation_status,
                 p.moderation_reason,
            p.price_cents::text AS price_cents,
            p.created_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     ORDER BY p.created_at DESC
     LIMIT 8`,
  );

  const grossSalesCents = Number(grossSalesRows[0]?.total ?? 0);

  return {
    userCount: Number(usersCountRows[0]?.total ?? 0),
    productCount: Number(productCountRows[0]?.total ?? 0),
    publishedProductCount: Number(publishedRows[0]?.total ?? 0),
    draftProductCount: Number(draftRows[0]?.total ?? 0),
    pendingReviewCount: Number(pendingReviewRows[0]?.total ?? 0),
    rejectedProductCount: Number(rejectedRows[0]?.total ?? 0),
    approvedOrdersCount: Number(approvedOrdersRows[0]?.total ?? 0),
    grossSalesCents,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformRevenueCents: Math.round(grossSalesCents * PLATFORM_FEE_RATE),
    categories: categoryRows.map((row) => ({
      category: row.category,
      productCount: Number(row.total),
    })),
    latestUsers: latestUserRows.map((row) => ({
      name: row.name,
      email: row.email,
      businessType: row.business_type as BusinessType,
      createdAt: new Date(row.created_at).toISOString(),
    })),
    latestProducts: latestProductRows.map((row) => ({
      id: row.id,
      ownerUserId: row.owner_user_id,
      ownerName: row.owner_name,
      name: row.name,
      category: row.category,
      status: row.status as ProductStatus,
      moderationStatus: toModerationStatus(row.moderation_status),
      moderationReason: row.moderation_reason,
      priceCents: Number(row.price_cents),
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
}

async function getAdminOverviewSqlite(): Promise<AdminOverview> {
  const usersCountRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM users`);
  const productCountRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM products`);
  const publishedRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM products WHERE status = 'published'`);
  const draftRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM products WHERE status = 'draft'`);
  const pendingReviewRow = await sqliteGet<{ total: number }>(
    `SELECT COUNT(*) AS total FROM products WHERE IFNULL(moderation_status, 'approved') = 'pending_review'`,
  );
  const rejectedRow = await sqliteGet<{ total: number }>(
    `SELECT COUNT(*) AS total FROM products WHERE IFNULL(moderation_status, 'approved') = 'rejected'`,
  );
  const approvedOrdersRow = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM orders WHERE status = 'approved'`);
  const grossSalesRow = await sqliteGet<{ total: number }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total FROM orders WHERE status = 'approved'`,
  );

  const categoryRows = await sqliteAll<{ category: string; total: number }>(
    `SELECT category, COUNT(*) AS total
     FROM products
     GROUP BY category
     ORDER BY COUNT(*) DESC, category ASC
     LIMIT 8`,
  );

  const latestUserRows = await sqliteAll<{
    name: string;
    email: string;
    business_type: string;
    created_at: string;
  }>(
    `SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 8`,
  );

  const latestProductRows = await sqliteAll<{
    id: string;
    owner_user_id: string;
    owner_name: string;
    name: string;
    category: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    price_cents: number;
    created_at: string;
  }>(
    `SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            p.name,
            p.category,
            p.status,
                 IFNULL(p.moderation_status, 'approved') AS moderation_status,
                 p.moderation_reason,
            p.price_cents,
            p.created_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     ORDER BY p.created_at DESC
     LIMIT 8`,
  );

  const grossSalesCents = Number(grossSalesRow?.total ?? 0);

  return {
    userCount: Number(usersCountRow?.total ?? 0),
    productCount: Number(productCountRow?.total ?? 0),
    publishedProductCount: Number(publishedRow?.total ?? 0),
    draftProductCount: Number(draftRow?.total ?? 0),
    pendingReviewCount: Number(pendingReviewRow?.total ?? 0),
    rejectedProductCount: Number(rejectedRow?.total ?? 0),
    approvedOrdersCount: Number(approvedOrdersRow?.total ?? 0),
    grossSalesCents,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformRevenueCents: Math.round(grossSalesCents * PLATFORM_FEE_RATE),
    categories: categoryRows.map((row) => ({
      category: row.category,
      productCount: Number(row.total),
    })),
    latestUsers: latestUserRows.map((row) => ({
      name: row.name,
      email: row.email,
      businessType: row.business_type as BusinessType,
      createdAt: new Date(row.created_at).toISOString(),
    })),
    latestProducts: latestProductRows.map((row) => ({
      id: row.id,
      ownerUserId: row.owner_user_id,
      ownerName: row.owner_name,
      name: row.name,
      category: row.category,
      status: row.status as ProductStatus,
      moderationStatus: toModerationStatus(row.moderation_status),
      moderationReason: row.moderation_reason,
      priceCents: Number(row.price_cents),
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
}

async function getAdminOverviewLocal(): Promise<AdminOverview> {
  const store = await readStoreFile();
  return {
    userCount: store.users.length,
    productCount: 0,
    publishedProductCount: 0,
    draftProductCount: 0,
    pendingReviewCount: 0,
    rejectedProductCount: 0,
    approvedOrdersCount: 0,
    grossSalesCents: 0,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformRevenueCents: 0,
    categories: [],
    latestUsers: store.users
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 8)
      .map((user) => ({
        name: user.name,
        email: user.email,
        businessType: user.businessType,
        createdAt: user.createdAt,
      })),
    latestProducts: [],
  };
}

function normalizeWindowHours(hours: number): number {
  if (!Number.isFinite(hours)) return 24;
  const rounded = Math.trunc(hours);
  return Math.min(168, Math.max(1, rounded));
}

function normalizeFailureLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 10;
  const rounded = Math.trunc(limit);
  return Math.min(50, Math.max(1, rounded));
}

async function getPaymentWebhookOpsSummaryPostgres(windowHours: number, failureLimit: number): Promise<PaymentWebhookOpsSummary> {
  await ensureDatabaseSchema();

  const summaryRows = await postgresQuery<{
    total_events: string;
    pending_processing: string;
    applied_events: string;
    failed_events: string;
    last_event_at: Date | string | null;
    last_success_at: Date | string | null;
  }>(
    `SELECT COUNT(*)::text AS total_events,
            COUNT(*) FILTER (WHERE processed_at IS NULL)::text AS pending_processing,
            COUNT(*) FILTER (WHERE processing_result LIKE 'applied:%')::text AS applied_events,
            COUNT(*) FILTER (
              WHERE processed_at IS NOT NULL
                AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
            )::text AS failed_events,
            MAX(created_at) AS last_event_at,
            MAX(CASE WHEN processing_result LIKE 'applied:%' THEN processed_at END) AS last_success_at
     FROM payment_webhook_events
     WHERE created_at >= NOW() - make_interval(hours => $1)`,
    [windowHours],
  );

  const failureRows = await postgresQuery<{
    id: string;
    provider: string;
    event_id: string;
    order_id: string | null;
    event_status: string | null;
    processing_result: string | null;
    created_at: Date | string;
    processed_at: Date | string | null;
  }>(
    `SELECT id,
            provider,
            event_id,
            order_id,
            event_status,
            processing_result,
            created_at,
            processed_at
     FROM payment_webhook_events
     WHERE created_at >= NOW() - make_interval(hours => $1)
       AND processed_at IS NOT NULL
       AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
     ORDER BY created_at DESC
     LIMIT $2`,
    [windowHours, failureLimit],
  );

  const summary = summaryRows[0];
  return {
    windowHours,
    totalEvents: Number(summary?.total_events ?? 0),
    pendingProcessing: Number(summary?.pending_processing ?? 0),
    appliedEvents: Number(summary?.applied_events ?? 0),
    failedEvents: Number(summary?.failed_events ?? 0),
    lastEventAt: summary?.last_event_at ? new Date(summary.last_event_at).toISOString() : null,
    lastSuccessAt: summary?.last_success_at ? new Date(summary.last_success_at).toISOString() : null,
    recentFailures: failureRows.map((row) => ({
      id: row.id,
      provider: row.provider,
      eventId: row.event_id,
      orderId: row.order_id,
      eventStatus: row.event_status,
      processingResult: row.processing_result,
      createdAt: new Date(row.created_at).toISOString(),
      processedAt: row.processed_at ? new Date(row.processed_at).toISOString() : null,
    })),
  };
}

async function getPaymentWebhookOpsSummarySqlite(windowHours: number, failureLimit: number): Promise<PaymentWebhookOpsSummary> {
  const summary = await sqliteGet<{
    total_events: number;
    pending_processing: number;
    applied_events: number;
    failed_events: number;
    last_event_at: string | null;
    last_success_at: string | null;
  }>(
    `SELECT COUNT(*) AS total_events,
            SUM(CASE WHEN processed_at IS NULL THEN 1 ELSE 0 END) AS pending_processing,
            SUM(CASE WHEN processing_result LIKE 'applied:%' THEN 1 ELSE 0 END) AS applied_events,
            SUM(CASE
                  WHEN processed_at IS NOT NULL
                   AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
                  THEN 1 ELSE 0 END) AS failed_events,
            MAX(created_at) AS last_event_at,
            MAX(CASE WHEN processing_result LIKE 'applied:%' THEN processed_at END) AS last_success_at
     FROM payment_webhook_events
     WHERE julianday(created_at) >= julianday('now') - (? / 24.0)`,
    [windowHours],
  );

  const failureRows = await sqliteAll<{
    id: string;
    provider: string;
    event_id: string;
    order_id: string | null;
    event_status: string | null;
    processing_result: string | null;
    created_at: string;
    processed_at: string | null;
  }>(
    `SELECT id,
            provider,
            event_id,
            order_id,
            event_status,
            processing_result,
            created_at,
            processed_at
     FROM payment_webhook_events
     WHERE julianday(created_at) >= julianday('now') - (? / 24.0)
       AND processed_at IS NOT NULL
       AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
     ORDER BY created_at DESC
     LIMIT ?`,
    [windowHours, failureLimit],
  );

  return {
    windowHours,
    totalEvents: Number(summary?.total_events ?? 0),
    pendingProcessing: Number(summary?.pending_processing ?? 0),
    appliedEvents: Number(summary?.applied_events ?? 0),
    failedEvents: Number(summary?.failed_events ?? 0),
    lastEventAt: summary?.last_event_at ? new Date(summary.last_event_at).toISOString() : null,
    lastSuccessAt: summary?.last_success_at ? new Date(summary.last_success_at).toISOString() : null,
    recentFailures: failureRows.map((row) => ({
      id: row.id,
      provider: row.provider,
      eventId: row.event_id,
      orderId: row.order_id,
      eventStatus: row.event_status,
      processingResult: row.processing_result,
      createdAt: new Date(row.created_at).toISOString(),
      processedAt: row.processed_at ? new Date(row.processed_at).toISOString() : null,
    })),
  };
}

async function getPaymentWebhookOpsSummaryLocal(windowHours: number): Promise<PaymentWebhookOpsSummary> {
  return {
    windowHours,
    totalEvents: 0,
    pendingProcessing: 0,
    appliedEvents: 0,
    failedEvents: 0,
    lastEventAt: null,
    lastSuccessAt: null,
    recentFailures: [],
  };
}

function normalizeReconciliationLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 50;
  const rounded = Math.trunc(limit);
  return Math.min(300, Math.max(1, rounded));
}

function normalizeReconciliationMinAgeMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 2;
  const rounded = Math.trunc(minutes);
  return Math.min(1440, Math.max(0, rounded));
}

function mapMercadoPagoStatusToOrderStatus(raw: string | null): PaymentWebhookStatus | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "refunded" || normalized === "charged_back") return "refunded";
  if (normalized === "rejected" || normalized === "cancelled") return "declined";
  return null;
}

async function fetchLatestMercadoPagoPaymentByOrder(orderId: string): Promise<{ paymentId: string | null; status: PaymentWebhookStatus | null }> {
  const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"]?.trim();
  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado para conciliação automática.");
  }

  const url = new URL("https://api.mercadopago.com/v1/payments/search");
  url.searchParams.set("external_reference", orderId);
  url.searchParams.set("sort", "date_created");
  url.searchParams.set("criteria", "desc");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 240);
    throw new Error(`Mercado Pago retornou erro ao consultar conciliação (${response.status}): ${details}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      id?: string | number;
      status?: string;
    }>;
  };

  const payment = Array.isArray(payload.results) ? payload.results[0] : undefined;
  if (!payment) {
    return { paymentId: null, status: null };
  }

  const paymentId =
    typeof payment.id === "string" ? payment.id : typeof payment.id === "number" ? String(payment.id) : null;
  const status = mapMercadoPagoStatusToOrderStatus(typeof payment.status === "string" ? payment.status : null);
  return { paymentId, status };
}

async function listPendingGatewayOrdersPostgres(limit: number): Promise<Array<{ id: string; createdAt: string }>> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{ id: string; created_at: Date | string }>(
    `SELECT id, created_at
     FROM orders
     WHERE payment_provider = 'gateway_webhook'
       AND status = 'pending'
     ORDER BY created_at ASC
     LIMIT $1`,
    [limit],
  );

  return rows.map((row) => ({
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listPendingGatewayOrdersSqlite(limit: number): Promise<Array<{ id: string; createdAt: string }>> {
  const rows = await sqliteAll<{ id: string; created_at: string }>(
    `SELECT id, created_at
     FROM orders
     WHERE payment_provider = 'gateway_webhook'
       AND status = 'pending'
     ORDER BY created_at ASC
     LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function runPaymentGatewayReconciliationPostgres(limit: number, minOrderAgeMinutes: number): Promise<PaymentReconciliationSummary> {
  const startedAt = nowIso();
  const issues: PaymentReconciliationIssue[] = [];
  let checkedOrders = 0;
  let updatedOrders = 0;
  let unchangedOrders = 0;
  let skippedOrders = 0;

  const minAgeMs = minOrderAgeMinutes * 60 * 1000;
  const orders = await listPendingGatewayOrdersPostgres(limit);

  for (const order of orders) {
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    if (ageMs < minAgeMs) {
      skippedOrders += 1;
      continue;
    }

    checkedOrders += 1;
    try {
      const payment = await fetchLatestMercadoPagoPaymentByOrder(order.id);
      if (!payment.status) {
        unchangedOrders += 1;
        continue;
      }

      const result = await processCheckoutPaymentWebhook({
        provider: "mercado_pago_reconcile",
        eventId: `reconcile:${order.id}:${payment.paymentId ?? "na"}:${payment.status}`,
        orderId: order.id,
        status: payment.status,
        providerPaymentId: payment.paymentId,
        payload: JSON.stringify({ source: "reconciliation", orderId: order.id }),
        skipSignatureValidation: true,
      });

      if (result.applied) {
        updatedOrders += 1;
      } else {
        unchangedOrders += 1;
      }
    } catch (error) {
      issues.push({
        orderId: order.id,
        message: error instanceof Error ? error.message : "Falha desconhecida na conciliação.",
      });
    }
  }

  return {
    provider: "mercado_pago",
    checkedOrders,
    updatedOrders,
    unchangedOrders,
    skippedOrders,
    issues,
    startedAt,
    completedAt: nowIso(),
  };
}

async function runPaymentGatewayReconciliationSqlite(limit: number, minOrderAgeMinutes: number): Promise<PaymentReconciliationSummary> {
  const startedAt = nowIso();
  const issues: PaymentReconciliationIssue[] = [];
  let checkedOrders = 0;
  let updatedOrders = 0;
  let unchangedOrders = 0;
  let skippedOrders = 0;

  const minAgeMs = minOrderAgeMinutes * 60 * 1000;
  const orders = await listPendingGatewayOrdersSqlite(limit);

  for (const order of orders) {
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    if (ageMs < minAgeMs) {
      skippedOrders += 1;
      continue;
    }

    checkedOrders += 1;
    try {
      const payment = await fetchLatestMercadoPagoPaymentByOrder(order.id);
      if (!payment.status) {
        unchangedOrders += 1;
        continue;
      }

      const result = await processCheckoutPaymentWebhook({
        provider: "mercado_pago_reconcile",
        eventId: `reconcile:${order.id}:${payment.paymentId ?? "na"}:${payment.status}`,
        orderId: order.id,
        status: payment.status,
        providerPaymentId: payment.paymentId,
        payload: JSON.stringify({ source: "reconciliation", orderId: order.id }),
        skipSignatureValidation: true,
      });

      if (result.applied) {
        updatedOrders += 1;
      } else {
        unchangedOrders += 1;
      }
    } catch (error) {
      issues.push({
        orderId: order.id,
        message: error instanceof Error ? error.message : "Falha desconhecida na conciliação.",
      });
    }
  }

  return {
    provider: "mercado_pago",
    checkedOrders,
    updatedOrders,
    unchangedOrders,
    skippedOrders,
    issues,
    startedAt,
    completedAt: nowIso(),
  };
}

async function runPaymentGatewayReconciliationLocal(): Promise<PaymentReconciliationSummary> {
  const startedAt = nowIso();
  return {
    provider: "mercado_pago",
    checkedOrders: 0,
    updatedOrders: 0,
    unchangedOrders: 0,
    skippedOrders: 0,
    issues: [],
    startedAt,
    completedAt: nowIso(),
  };
}

async function listAdminModerationQueuePostgres(limit: number, filters?: AdminModerationQueueFilters): Promise<AdminModerationQueueItem[]> {
  await ensureDatabaseSchema();
  const conditions: string[] = [`p.status = 'published'`];
  const params: unknown[] = [];

  const normalizedStatus = filters?.status ?? "pending_review";
  params.push(normalizedStatus);
  conditions.push(`COALESCE(p.moderation_status, 'approved') = $${params.length}`);

  if (filters?.category?.trim()) {
    params.push(filters.category.trim());
    conditions.push(`p.category = $${params.length}`);
  }

  if (filters?.fromCreatedAt) {
    params.push(filters.fromCreatedAt);
    conditions.push(`p.created_at >= $${params.length}`);
  }

  if (filters?.toCreatedAt) {
    params.push(filters.toCreatedAt);
    conditions.push(`p.created_at <= $${params.length}`);
  }

  params.push(Math.max(1, Math.min(100, limit)));

  const rows = await postgresQuery<{
    id: string;
    owner_user_id: string;
    owner_name: string;
    owner_email: string;
    name: string;
    category: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    price_cents: string;
    created_at: Date | string;
    updated_at: Date | string;
  }>(
    `SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            u.email AS owner_email,
            p.name,
            p.category,
            p.status,
            COALESCE(p.moderation_status, 'approved') AS moderation_status,
            p.moderation_reason,
            p.price_cents::text AS price_cents,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.updated_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    moderationStatus: toModerationStatus(row.moderation_status),
    moderationReason: row.moderation_reason,
    priceCents: Number(row.price_cents),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function listAdminModerationQueueSqlite(limit: number, filters?: AdminModerationQueueFilters): Promise<AdminModerationQueueItem[]> {
  const conditions: string[] = [`p.status = 'published'`];
  const params: unknown[] = [];

  const normalizedStatus = filters?.status ?? "pending_review";
  params.push(normalizedStatus);
  conditions.push(`IFNULL(p.moderation_status, 'approved') = ?`);

  if (filters?.category?.trim()) {
    params.push(filters.category.trim());
    conditions.push(`p.category = ?`);
  }

  if (filters?.fromCreatedAt) {
    params.push(filters.fromCreatedAt);
    conditions.push(`p.created_at >= ?`);
  }

  if (filters?.toCreatedAt) {
    params.push(filters.toCreatedAt);
    conditions.push(`p.created_at <= ?`);
  }

  params.push(Math.max(1, Math.min(100, limit)));

  const rows = await sqliteAll<{
    id: string;
    owner_user_id: string;
    owner_name: string;
    owner_email: string;
    name: string;
    category: string;
    status: string;
    moderation_status: string;
    moderation_reason: string | null;
    price_cents: number;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            u.email AS owner_email,
            p.name,
            p.category,
            p.status,
            IFNULL(p.moderation_status, 'approved') AS moderation_status,
            p.moderation_reason,
            p.price_cents,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.updated_at DESC
     LIMIT ?`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    moderationStatus: toModerationStatus(row.moderation_status),
    moderationReason: row.moderation_reason,
    priceCents: Number(row.price_cents),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function listAdminModerationAuditPostgres(limit: number): Promise<AdminModerationAuditLog[]> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{
    id: string;
    product_id: string;
    product_name: string;
    admin_user_id: string;
    admin_name: string;
    admin_email: string;
    action: string;
    reason: string | null;
    created_at: Date | string;
  }>(
    `SELECT l.id,
            l.product_id,
            p.name AS product_name,
            l.admin_user_id,
            u.name AS admin_name,
            u.email AS admin_email,
            l.action,
            l.reason,
            l.created_at
     FROM moderation_audit_logs l
     JOIN products p ON p.id = l.product_id
     JOIN users u ON u.id = l.admin_user_id
     ORDER BY l.created_at DESC
     LIMIT $1`,
    [Math.max(1, Math.min(100, limit))],
  );

  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    adminUserId: row.admin_user_id,
    adminName: row.admin_name,
    adminEmail: row.admin_email,
    action: row.action as ProductModerationDecision,
    reason: row.reason,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

function mapAdminRoleAuditAction(previousRoleValue: string | null, newRoleValue: string | null): "grant" | "revoke" | "change" | "promote_admin" | "demote_admin" {
  const previousRole = toAdminRole(previousRoleValue);
  const newRole = toAdminRole(newRoleValue);

  if (previousRole !== "admin" && newRole === "admin") return "promote_admin";
  if (previousRole === "admin" && newRole !== "admin") return "demote_admin";
  if (previousRole === "none" && newRole !== "none") return "grant";
  if (previousRole !== "none" && newRole === "none") return "revoke";
  return "change";
}

function applyAdminRoleAuditActionPostgresWhere(action: NonNullable<AdminRoleAuditFilters["action"]>): string {
  switch (action) {
    case "grant":
      return "COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none'";
    case "revoke":
      return "COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none'";
    case "promote_admin":
      return "COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin'";
    case "demote_admin":
      return "COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin'";
    case "change":
    default:
      return "COALESCE(l.previous_role, 'none') <> COALESCE(l.new_role, 'none')";
  }
}

function applyAdminRoleAuditActionSqliteWhere(action: NonNullable<AdminRoleAuditFilters["action"]>): string {
  switch (action) {
    case "grant":
      return "COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none'";
    case "revoke":
      return "COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none'";
    case "promote_admin":
      return "COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin'";
    case "demote_admin":
      return "COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin'";
    case "change":
    default:
      return "COALESCE(l.previous_role, 'none') <> COALESCE(l.new_role, 'none')";
  }
}

async function listAdminRoleAuditPostgres(limit: number, filters?: AdminRoleAuditFilters): Promise<AdminRoleAuditLog[]> {
  await ensureDatabaseSchema();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters?.userQuery) {
    params.push(`%${filters.userQuery.trim()}%`);
    clauses.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }

  if (filters?.action) {
    clauses.push(applyAdminRoleAuditActionPostgresWhere(filters.action));
  }

  if (filters?.fromCreatedAt) {
    params.push(filters.fromCreatedAt);
    clauses.push(`l.created_at >= $${params.length}`);
  }

  if (filters?.toCreatedAt) {
    params.push(filters.toCreatedAt);
    clauses.push(`l.created_at <= $${params.length}`);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(Math.max(1, Math.min(200, limit)));

  const rows = await postgresQuery<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    previous_role: string | null;
    new_role: string | null;
    changed_by_user_id: string | null;
    changed_by_name: string | null;
    changed_by_email: string | null;
    source: string;
    reason: string | null;
    created_at: string;
  }>(
    `SELECT l.id,
            l.user_id,
            u.name AS user_name,
            u.email AS user_email,
            l.previous_role,
            l.new_role,
            l.changed_by_user_id,
            cu.name AS changed_by_name,
            cu.email AS changed_by_email,
            l.source,
            l.reason,
            l.created_at
     FROM user_role_audit_logs l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN users cu ON cu.id = l.changed_by_user_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    action: mapAdminRoleAuditAction(row.previous_role, row.new_role),
    previousRole: toAdminRole(row.previous_role),
    newRole: toAdminRole(row.new_role),
    changedByUserId: row.changed_by_user_id,
    changedByName: row.changed_by_name,
    changedByEmail: row.changed_by_email,
    source: row.source,
    reason: row.reason,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listAdminModerationAuditSqlite(limit: number): Promise<AdminModerationAuditLog[]> {
  const rows = await sqliteAll<{
    id: string;
    product_id: string;
    product_name: string;
    admin_user_id: string;
    admin_name: string;
    admin_email: string;
    action: string;
    reason: string | null;
    created_at: string;
  }>(
    `SELECT l.id,
            l.product_id,
            p.name AS product_name,
            l.admin_user_id,
            u.name AS admin_name,
            u.email AS admin_email,
            l.action,
            l.reason,
            l.created_at
     FROM moderation_audit_logs l
     JOIN products p ON p.id = l.product_id
     JOIN users u ON u.id = l.admin_user_id
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [Math.max(1, Math.min(100, limit))],
  );

  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    adminUserId: row.admin_user_id,
    adminName: row.admin_name,
    adminEmail: row.admin_email,
    action: row.action as ProductModerationDecision,
    reason: row.reason,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listPlatformSettingsPostgres(limit: number): Promise<PlatformSettingRecord[]> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{
    key: string;
    value: string;
    updated_by_user_id: string | null;
    updated_by_name: string | null;
    updated_by_email: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT s.key,
            s.value,
            s.updated_by_user_id,
            u.name AS updated_by_name,
            u.email AS updated_by_email,
            s.created_at,
            s.updated_at
     FROM platform_settings s
     LEFT JOIN users u ON u.id = s.updated_by_user_id
     ORDER BY s.key ASC
     LIMIT $1`,
    [Math.max(1, Math.min(200, limit))],
  );

  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    updatedByUserId: row.updated_by_user_id,
    updatedByName: row.updated_by_name,
    updatedByEmail: row.updated_by_email,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function listPlatformSettingsSqlite(limit: number): Promise<PlatformSettingRecord[]> {
  const rows = await sqliteAll<{
    key: string;
    value: string;
    updated_by_user_id: string | null;
    updated_by_name: string | null;
    updated_by_email: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT s.key,
            s.value,
            s.updated_by_user_id,
            u.name AS updated_by_name,
            u.email AS updated_by_email,
            s.created_at,
            s.updated_at
     FROM platform_settings s
     LEFT JOIN users u ON u.id = s.updated_by_user_id
     ORDER BY s.key ASC
     LIMIT ?`,
    [Math.max(1, Math.min(200, limit))],
  );

  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    updatedByUserId: row.updated_by_user_id,
    updatedByName: row.updated_by_name,
    updatedByEmail: row.updated_by_email,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

async function upsertPlatformSettingPostgres(
  key: string,
  value: string,
  updatedByUserId: string | null,
): Promise<PlatformSettingRecord> {
  await ensureDatabaseSchema();
  const now = nowIso();
  const previousRows = await postgresQuery<{ value: string }>(
    `SELECT value FROM platform_settings WHERE key = $1 LIMIT 1`,
    [key],
  );
  const previousValue = previousRows[0]?.value ?? null;

  await postgresQuery(
    `INSERT INTO platform_settings (key, value, updated_by_user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (key)
     DO UPDATE SET value = EXCLUDED.value,
                   updated_by_user_id = EXCLUDED.updated_by_user_id,
                   updated_at = EXCLUDED.updated_at`,
    [key, value, updatedByUserId, now, now],
  );

  await postgresQuery(
    `INSERT INTO platform_setting_audit_logs (id, setting_key, previous_value, new_value, changed_by_user_id, action, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [createId(`platform_setting:${key}:${now}`), key, previousValue, value, updatedByUserId, previousValue === null ? "create" : "update", now],
  );

  const rows = await listPlatformSettingsPostgres(200);
  const stored = rows.find((item) => item.key === key);
  if (!stored) throw new Error("Falha ao persistir configuração de plataforma.");
  return stored;
}

async function upsertPlatformSettingSqlite(
  key: string,
  value: string,
  updatedByUserId: string | null,
): Promise<PlatformSettingRecord> {
  const now = nowIso();
  const previous = await sqliteGet<{ value: string }>(
    `SELECT value FROM platform_settings WHERE key = ? LIMIT 1`,
    [key],
  );
  const previousValue = previous?.value ?? null;

  await sqliteRun(
    `INSERT INTO platform_settings (key, value, updated_by_user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key)
     DO UPDATE SET value = excluded.value,
                   updated_by_user_id = excluded.updated_by_user_id,
                   updated_at = excluded.updated_at`,
    [key, value, updatedByUserId, now, now],
  );

  await sqliteRun(
    `INSERT INTO platform_setting_audit_logs (id, setting_key, previous_value, new_value, changed_by_user_id, action, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [createId(`platform_setting:${key}:${now}`), key, previousValue, value, updatedByUserId, previousValue === null ? "create" : "update", now],
  );

  const rows = await listPlatformSettingsSqlite(200);
  const stored = rows.find((item) => item.key === key);
  if (!stored) throw new Error("Falha ao persistir configuração de plataforma.");
  return stored;
}

async function listAdminConsolidatedAuditPostgres(
  limit: number,
  filters?: AdminConsolidatedAuditFilters,
): Promise<AdminConsolidatedAuditLog[]> {
  await ensureDatabaseSchema();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters?.eventType) {
    params.push(filters.eventType);
    clauses.push(`e.event_type = $${params.length}`);
  }

  if (filters?.actorQuery) {
    params.push(`%${filters.actorQuery.trim()}%`);
    clauses.push(`(COALESCE(e.actor_name, '') ILIKE $${params.length} OR COALESCE(e.actor_email, '') ILIKE $${params.length})`);
  }

  if (filters?.fromCreatedAt) {
    params.push(filters.fromCreatedAt);
    clauses.push(`e.created_at >= $${params.length}`);
  }

  if (filters?.toCreatedAt) {
    params.push(filters.toCreatedAt);
    clauses.push(`e.created_at <= $${params.length}`);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(Math.max(1, Math.min(200, limit)));

  const rows = await postgresQuery<{
    id: string;
    event_type: AdminConsolidatedAuditEventType;
    action: string;
    actor_user_id: string | null;
    actor_name: string | null;
    actor_email: string | null;
    target: string;
    detail: string | null;
    created_at: string;
  }>(
    `SELECT e.id,
            e.event_type,
            e.action,
            e.actor_user_id,
            e.actor_name,
            e.actor_email,
            e.target,
            e.detail,
            e.created_at
     FROM (
       SELECT l.id,
              'moderation'::text AS event_type,
              l.action,
              l.admin_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              p.name AS target,
              l.reason AS detail,
              l.created_at
       FROM moderation_audit_logs l
       JOIN products p ON p.id = l.product_id
       JOIN users u ON u.id = l.admin_user_id

       UNION ALL

       SELECT l.id,
              'rbac'::text AS event_type,
              CASE
                WHEN COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin' THEN 'promote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin' THEN 'demote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none' THEN 'grant'
                WHEN COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none' THEN 'revoke'
                ELSE 'change'
              END AS action,
              l.changed_by_user_id AS actor_user_id,
              cu.name AS actor_name,
              cu.email AS actor_email,
              u.email AS target,
              l.reason AS detail,
              l.created_at
       FROM user_role_audit_logs l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN users cu ON cu.id = l.changed_by_user_id

       UNION ALL

       SELECT l.id,
              'platform_setting'::text AS event_type,
              l.action,
              l.changed_by_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              l.setting_key AS target,
              CONCAT('de: ', COALESCE(l.previous_value, '<vazio>'), ' -> para: ', COALESCE(l.new_value, '<vazio>')) AS detail,
              l.created_at
       FROM platform_setting_audit_logs l
       LEFT JOIN users u ON u.id = l.changed_by_user_id
     ) e
     ${whereClause}
     ORDER BY e.created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    action: row.action,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
    target: row.target,
    detail: row.detail,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listAdminConsolidatedAuditSqlite(
  limit: number,
  filters?: AdminConsolidatedAuditFilters,
): Promise<AdminConsolidatedAuditLog[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters?.eventType) {
    clauses.push("e.event_type = ?");
    params.push(filters.eventType);
  }

  if (filters?.actorQuery) {
    const query = `%${filters.actorQuery.trim().toLowerCase()}%`;
    clauses.push("(LOWER(COALESCE(e.actor_name, '')) LIKE ? OR LOWER(COALESCE(e.actor_email, '')) LIKE ?)");
    params.push(query, query);
  }

  if (filters?.fromCreatedAt) {
    clauses.push("e.created_at >= ?");
    params.push(filters.fromCreatedAt);
  }

  if (filters?.toCreatedAt) {
    clauses.push("e.created_at <= ?");
    params.push(filters.toCreatedAt);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(Math.max(1, Math.min(200, limit)));

  const rows = await sqliteAll<{
    id: string;
    event_type: AdminConsolidatedAuditEventType;
    action: string;
    actor_user_id: string | null;
    actor_name: string | null;
    actor_email: string | null;
    target: string;
    detail: string | null;
    created_at: string;
  }>(
    `SELECT e.id,
            e.event_type,
            e.action,
            e.actor_user_id,
            e.actor_name,
            e.actor_email,
            e.target,
            e.detail,
            e.created_at
     FROM (
       SELECT l.id,
              'moderation' AS event_type,
              l.action,
              l.admin_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              p.name AS target,
              l.reason AS detail,
              l.created_at
       FROM moderation_audit_logs l
       JOIN products p ON p.id = l.product_id
       JOIN users u ON u.id = l.admin_user_id

       UNION ALL

       SELECT l.id,
              'rbac' AS event_type,
              CASE
                WHEN COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin' THEN 'promote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin' THEN 'demote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none' THEN 'grant'
                WHEN COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none' THEN 'revoke'
                ELSE 'change'
              END AS action,
              l.changed_by_user_id AS actor_user_id,
              cu.name AS actor_name,
              cu.email AS actor_email,
              u.email AS target,
              l.reason AS detail,
              l.created_at
       FROM user_role_audit_logs l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN users cu ON cu.id = l.changed_by_user_id

       UNION ALL

       SELECT l.id,
              'platform_setting' AS event_type,
              l.action,
              l.changed_by_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              l.setting_key AS target,
              ('de: ' || COALESCE(l.previous_value, '<vazio>') || ' -> para: ' || COALESCE(l.new_value, '<vazio>')) AS detail,
              l.created_at
       FROM platform_setting_audit_logs l
       LEFT JOIN users u ON u.id = l.changed_by_user_id
     ) e
     ${whereClause}
     ORDER BY e.created_at DESC
     LIMIT ?`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    action: row.action,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
    target: row.target,
    detail: row.detail,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function listAdminRoleAuditSqlite(limit: number, filters?: AdminRoleAuditFilters): Promise<AdminRoleAuditLog[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters?.userQuery) {
    const query = `%${filters.userQuery.trim().toLowerCase()}%`;
    clauses.push("(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)");
    params.push(query, query);
  }

  if (filters?.action) {
    clauses.push(applyAdminRoleAuditActionSqliteWhere(filters.action));
  }

  if (filters?.fromCreatedAt) {
    clauses.push("l.created_at >= ?");
    params.push(filters.fromCreatedAt);
  }

  if (filters?.toCreatedAt) {
    clauses.push("l.created_at <= ?");
    params.push(filters.toCreatedAt);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(Math.max(1, Math.min(200, limit)));

  const rows = await sqliteAll<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    previous_role: string | null;
    new_role: string | null;
    changed_by_user_id: string | null;
    changed_by_name: string | null;
    changed_by_email: string | null;
    source: string;
    reason: string | null;
    created_at: string;
  }>(
    `SELECT l.id,
            l.user_id,
            u.name AS user_name,
            u.email AS user_email,
            l.previous_role,
            l.new_role,
            l.changed_by_user_id,
            cu.name AS changed_by_name,
            cu.email AS changed_by_email,
            l.source,
            l.reason,
            l.created_at
     FROM user_role_audit_logs l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN users cu ON cu.id = l.changed_by_user_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT ?`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    action: mapAdminRoleAuditAction(row.previous_role, row.new_role),
    previousRole: toAdminRole(row.previous_role),
    newRole: toAdminRole(row.new_role),
    changedByUserId: row.changed_by_user_id,
    changedByName: row.changed_by_name,
    changedByEmail: row.changed_by_email,
    source: row.source,
    reason: row.reason,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

async function writeUserRoleAuditLogPostgres(
  userId: string,
  previousRole: AdminRole,
  newRole: AdminRole,
  changedByUserId: string | null,
  source: string,
  reason: string | null,
): Promise<void> {
  const createdAt = nowIso();
  await postgresQuery(
    `INSERT INTO user_role_audit_logs (id, user_id, previous_role, new_role, changed_by_user_id, source, reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [createId(`role_audit:${userId}:${createdAt}:${newRole}`), userId, previousRole, newRole, changedByUserId, source, reason, createdAt],
  );
}

async function writeUserRoleAuditLogSqlite(
  userId: string,
  previousRole: AdminRole,
  newRole: AdminRole,
  changedByUserId: string | null,
  source: string,
  reason: string | null,
): Promise<void> {
  const createdAt = nowIso();
  await sqliteRun(
    `INSERT INTO user_role_audit_logs (id, user_id, previous_role, new_role, changed_by_user_id, source, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [createId(`role_audit:${userId}:${createdAt}:${newRole}`), userId, previousRole, newRole, changedByUserId, source, reason, createdAt],
  );
}

async function getUserAdminRolePostgres(userId: string): Promise<AdminRole> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{ role: string }>(`SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1`, [userId]);
  return toAdminRole(rows[0]?.role);
}

async function countAdminUsersPostgres(): Promise<number> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{ total: string }>(`SELECT COUNT(*)::text AS total FROM user_roles WHERE role = 'admin'`);
  return Number(rows[0]?.total ?? "0");
}

async function listAdminUserRolesPostgres(limit: number): Promise<AdminUserRoleDirectoryItem[]> {
  await ensureDatabaseSchema();
  const rows = await postgresQuery<{
    user_id: string;
    name: string;
    email: string;
    business_type: BusinessType;
    role: string | null;
    assigned_by_user_id: string | null;
    source: string | null;
    approved_by_user_id: string | null;
    approved_by_name: string | null;
    approved_by_email: string | null;
    approved_at: string | null;
    approval_note: string | null;
    role_updated_at: string | null;
    user_updated_at: string;
  }>(
    `SELECT u.id AS user_id,
            u.name,
            u.email,
            u.business_type,
            r.role,
            r.assigned_by_user_id,
            r.source,
                 r.approved_by_user_id,
                 au.name AS approved_by_name,
                 au.email AS approved_by_email,
                 r.approved_at,
                 r.approval_note,
            r.updated_at AS role_updated_at,
            u.updated_at AS user_updated_at
     FROM users u
     LEFT JOIN user_roles r ON r.user_id = u.id
               LEFT JOIN users au ON au.id = r.approved_by_user_id
     ORDER BY u.created_at DESC
     LIMIT $1`,
    [Math.max(1, Math.min(100, limit))],
  );

  return rows.map((row) => ({
    userId: row.user_id,
    name: row.name,
    email: row.email,
    businessType: row.business_type,
    role: toAdminRole(row.role),
    assignedByUserId: row.assigned_by_user_id,
    source: row.source,
    approvedByUserId: row.approved_by_user_id,
    approvedByName: row.approved_by_name,
    approvedByEmail: row.approved_by_email,
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
    approvalNote: row.approval_note,
    updatedAt: new Date(row.role_updated_at ?? row.user_updated_at).toISOString(),
  }));
}

async function getUserAdminRoleSqlite(userId: string): Promise<AdminRole> {
  const row = await sqliteGet<{ role: string }>(`SELECT role FROM user_roles WHERE user_id = ? LIMIT 1`, [userId]);
  return toAdminRole(row?.role);
}

async function countAdminUsersSqlite(): Promise<number> {
  const row = await sqliteGet<{ total: number }>(`SELECT COUNT(*) AS total FROM user_roles WHERE role = 'admin'`);
  return Number(row?.total ?? 0);
}

async function listAdminUserRolesSqlite(limit: number): Promise<AdminUserRoleDirectoryItem[]> {
  const rows = await sqliteAll<{
    user_id: string;
    name: string;
    email: string;
    business_type: BusinessType;
    role: string | null;
    assigned_by_user_id: string | null;
    source: string | null;
    approved_by_user_id: string | null;
    approved_by_name: string | null;
    approved_by_email: string | null;
    approved_at: string | null;
    approval_note: string | null;
    role_updated_at: string | null;
    user_updated_at: string;
  }>(
    `SELECT u.id AS user_id,
            u.name,
            u.email,
            u.business_type,
            r.role,
            r.assigned_by_user_id,
            r.source,
                 r.approved_by_user_id,
                 au.name AS approved_by_name,
                 au.email AS approved_by_email,
                 r.approved_at,
                 r.approval_note,
            r.updated_at AS role_updated_at,
            u.updated_at AS user_updated_at
     FROM users u
     LEFT JOIN user_roles r ON r.user_id = u.id
               LEFT JOIN users au ON au.id = r.approved_by_user_id
     ORDER BY u.created_at DESC
     LIMIT ?`,
    [Math.max(1, Math.min(100, limit))],
  );

  return rows.map((row) => ({
    userId: row.user_id,
    name: row.name,
    email: row.email,
    businessType: row.business_type,
    role: toAdminRole(row.role),
    assignedByUserId: row.assigned_by_user_id,
    source: row.source,
    approvedByUserId: row.approved_by_user_id,
    approvedByName: row.approved_by_name,
    approvedByEmail: row.approved_by_email,
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
    approvalNote: row.approval_note,
    updatedAt: new Date(row.role_updated_at ?? row.user_updated_at).toISOString(),
  }));
}

async function setUserAdminRolePostgres(
  userId: string,
  role: Exclude<AdminRole, "none">,
  assignedByUserId: string | null,
  source: string,
  approval?: { approvedByUserId: string | null; approvedAt?: string; approvalNote?: string | null },
): Promise<void> {
  await ensureDatabaseSchema();
  const now = nowIso();
  const approvedByUserId = role === "admin" ? (approval?.approvedByUserId ?? null) : null;
  const approvedAt = role === "admin" ? (approval?.approvedAt ?? now) : null;
  const approvalNote = role === "admin" ? (approval?.approvalNote?.trim() || null) : null;
  await postgresQuery(
    `INSERT INTO user_roles (user_id, role, assigned_by_user_id, source, approved_by_user_id, approved_at, approval_note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT (user_id)
     DO UPDATE SET role = EXCLUDED.role,
                   assigned_by_user_id = EXCLUDED.assigned_by_user_id,
                   source = EXCLUDED.source,
                   approved_by_user_id = EXCLUDED.approved_by_user_id,
                   approved_at = EXCLUDED.approved_at,
                   approval_note = EXCLUDED.approval_note,
                   updated_at = EXCLUDED.updated_at`,
    [userId, role, assignedByUserId, source, approvedByUserId, approvedAt, approvalNote, now],
  );
}

async function setUserAdminRoleSqlite(
  userId: string,
  role: Exclude<AdminRole, "none">,
  assignedByUserId: string | null,
  source: string,
  approval?: { approvedByUserId: string | null; approvedAt?: string; approvalNote?: string | null },
): Promise<void> {
  const now = nowIso();
  const approvedByUserId = role === "admin" ? (approval?.approvedByUserId ?? null) : null;
  const approvedAt = role === "admin" ? (approval?.approvedAt ?? now) : null;
  const approvalNote = role === "admin" ? (approval?.approvalNote?.trim() || null) : null;
  await sqliteRun(
    `INSERT INTO user_roles (user_id, role, assigned_by_user_id, source, approved_by_user_id, approved_at, approval_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET role = excluded.role,
                   assigned_by_user_id = excluded.assigned_by_user_id,
                   source = excluded.source,
                   approved_by_user_id = excluded.approved_by_user_id,
                   approved_at = excluded.approved_at,
                   approval_note = excluded.approval_note,
                   updated_at = excluded.updated_at`,
    [userId, role, assignedByUserId, source, approvedByUserId, approvedAt, approvalNote, now, now],
  );
}

async function clearUserAdminRolePostgres(userId: string): Promise<void> {
  await ensureDatabaseSchema();
  await postgresQuery(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
}

async function clearUserAdminRoleSqlite(userId: string): Promise<void> {
  await sqliteRun(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);
}

async function moderateProductPostgres(
  adminUserId: string,
  productId: string,
  decision: ProductModerationDecision,
  reason: string | null,
): Promise<{ productId: string; moderationStatus: ProductModerationStatus; moderationReason: string | null }> {
  await ensureDatabaseSchema();
  const nextStatus: ProductModerationStatus = decision === "approve" ? "approved" : "rejected";
  const normalizedReason = reason?.trim() ? reason.trim() : null;
  const now = nowIso();

  const updated = await postgresQuery<{ id: string }>(
    `UPDATE products
     SET moderation_status = $2,
         moderation_reason = $3,
         updated_at = $4
     WHERE id = $1
     RETURNING id`,
    [productId, nextStatus, normalizedReason, now],
  );

  if (updated.length === 0) {
    throw new Error("Produto não encontrado para moderação.");
  }

  await postgresQuery(
    `INSERT INTO moderation_audit_logs (id, product_id, admin_user_id, action, reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [createId(`mod:${productId}:${adminUserId}:${now}`), productId, adminUserId, decision, normalizedReason, now],
  );

  return {
    productId,
    moderationStatus: nextStatus,
    moderationReason: normalizedReason,
  };
}

async function moderateProductSqlite(
  adminUserId: string,
  productId: string,
  decision: ProductModerationDecision,
  reason: string | null,
): Promise<{ productId: string; moderationStatus: ProductModerationStatus; moderationReason: string | null }> {
  const existing = await sqliteGet<{ id: string }>(`SELECT id FROM products WHERE id = ? LIMIT 1`, [productId]);
  if (!existing) {
    throw new Error("Produto não encontrado para moderação.");
  }

  const nextStatus: ProductModerationStatus = decision === "approve" ? "approved" : "rejected";
  const normalizedReason = reason?.trim() ? reason.trim() : null;
  const now = nowIso();

  await sqliteRun(
    `UPDATE products
     SET moderation_status = ?,
         moderation_reason = ?,
         updated_at = ?
     WHERE id = ?`,
    [nextStatus, normalizedReason, now, productId],
  );

  await sqliteRun(
    `INSERT INTO moderation_audit_logs (id, product_id, admin_user_id, action, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [createId(`mod:${productId}:${adminUserId}:${now}`), productId, adminUserId, decision, normalizedReason, now],
  );

  return {
    productId,
    moderationStatus: nextStatus,
    moderationReason: normalizedReason,
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  if (isPostgresEnabled()) return getAdminOverviewPostgres();
  if (isSqliteEnabled()) return getAdminOverviewSqlite();
  return getAdminOverviewLocal();
}

export async function getPaymentWebhookOpsSummary(hours = 24, failureLimit = 10): Promise<PaymentWebhookOpsSummary> {
  const windowHours = normalizeWindowHours(hours);
  const normalizedFailureLimit = normalizeFailureLimit(failureLimit);

  if (isPostgresEnabled()) return getPaymentWebhookOpsSummaryPostgres(windowHours, normalizedFailureLimit);
  if (isSqliteEnabled()) return getPaymentWebhookOpsSummarySqlite(windowHours, normalizedFailureLimit);
  return getPaymentWebhookOpsSummaryLocal(windowHours);
}

export async function runPaymentGatewayReconciliation(options?: {
  limit?: number | undefined;
  minOrderAgeMinutes?: number | undefined;
}): Promise<PaymentReconciliationSummary> {
  const configuredLimit = Number(process.env["PAYMENT_RECONCILE_MAX_ORDERS"] ?? "50");
  const configuredMinAge = Number(process.env["PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES"] ?? "2");

  const limit = normalizeReconciliationLimit(options?.limit ?? configuredLimit);
  const minOrderAgeMinutes = normalizeReconciliationMinAgeMinutes(options?.minOrderAgeMinutes ?? configuredMinAge);

  if (isPostgresEnabled()) return runPaymentGatewayReconciliationPostgres(limit, minOrderAgeMinutes);
  if (isSqliteEnabled()) return runPaymentGatewayReconciliationSqlite(limit, minOrderAgeMinutes);
  return runPaymentGatewayReconciliationLocal();
}
