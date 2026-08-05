import "./lib/error-capture";

import { createHmac, timingSafeEqual } from "node:crypto";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type WebhookBody = {
  provider?: unknown;
  eventId?: unknown;
  orderId?: unknown;
  status?: unknown;
  providerPaymentId?: unknown;
  type?: unknown;
  action?: unknown;
  data?: {
    id?: unknown;
  };
};

type MercadoPagoPaymentDetails = {
  paymentId: string;
  orderId: string | null;
  status: "approved" | "declined" | "refunded" | null;
  rawStatus: string | null;
};

type WebhookErrorResult = {
  status: number;
  message: string;
  retryable: boolean;
  severity: "warning" | "error" | "critical";
  reason: string;
};

type PaymentAlertPayload = {
  title: string;
  severity: "warning" | "error" | "critical";
  reason: string;
  retryable: boolean;
  statusCode: number;
  provider: string;
  eventId?: string | null;
  orderId?: string | null;
  detail: string;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
const paymentAlertLastSentAt = new Map<string, number>();

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function jsonResponse(payload: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders ?? {}),
    },
  });
}

function isSupportedWebhookStatus(value: string): value is "approved" | "declined" | "refunded" {
  return value === "approved" || value === "declined" || value === "refunded";
}

function severityWeight(level: "warning" | "error" | "critical"): number {
  if (level === "critical") return 3;
  if (level === "error") return 2;
  return 1;
}

function parseSeverity(value: string | undefined): "warning" | "error" | "critical" {
  const normalized = (value ?? "warning").trim().toLowerCase();
  if (normalized === "critical" || normalized === "error" || normalized === "warning") {
    return normalized;
  }
  return "warning";
}

function readAlertsCooldownMs(): number {
  const raw = process.env["PAYMENT_ALERTS_COOLDOWN_SECONDS"];
  const parsed = raw ? Number(raw) : 300;
  const seconds = Number.isFinite(parsed) ? Math.max(10, Math.min(3600, Math.trunc(parsed))) : 300;
  return seconds * 1000;
}

function shouldSendPaymentAlert(reasonKey: string, severity: "warning" | "error" | "critical"): boolean {
  const minSeverity = parseSeverity(process.env["PAYMENT_ALERTS_MIN_SEVERITY"]);
  if (severityWeight(severity) < severityWeight(minSeverity)) {
    return false;
  }

  const now = Date.now();
  const cooldownMs = readAlertsCooldownMs();
  const lastSentAt = paymentAlertLastSentAt.get(reasonKey) ?? 0;
  if (now - lastSentAt < cooldownMs) {
    return false;
  }

  paymentAlertLastSentAt.set(reasonKey, now);
  return true;
}

async function dispatchPaymentAlert(payload: PaymentAlertPayload): Promise<void> {
  const webhookUrl = process.env["PAYMENT_ALERTS_WEBHOOK_URL"]?.trim();
  if (!webhookUrl) return;
  if (!shouldSendPaymentAlert(payload.reason, payload.severity)) return;

  const timeoutRaw = Number(process.env["PAYMENT_ALERTS_WEBHOOK_TIMEOUT_MS"] ?? "4000");
  const timeoutMs = Number.isFinite(timeoutRaw) ? Math.max(1000, Math.min(15000, Math.trunc(timeoutRaw))) : 4000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        source: "brasiltec-payments",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    console.error("Falha ao enviar alerta externo de pagamentos", error);
  } finally {
    clearTimeout(timeout);
  }
}

function isMercadoPagoWebhookBody(body: WebhookBody): boolean {
  if (typeof body.type !== "string") return false;
  if (body.type.trim().toLowerCase() !== "payment") return false;
  if (!body.data || typeof body.data !== "object") return false;
  return typeof body.data.id === "string" || typeof body.data.id === "number";
}

function mapMercadoPagoStatus(raw: string | null): "approved" | "declined" | "refunded" | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "refunded" || normalized === "charged_back") return "refunded";
  if (normalized === "rejected" || normalized === "cancelled") return "declined";
  return null;
}

function parseMercadoPagoSignatureHeader(raw: string | null): { ts: string; v1: string } | null {
  if (!raw) return null;

  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const map = new Map<string, string>();
  for (const part of parts) {
    const divider = part.indexOf("=");
    if (divider <= 0) continue;
    const key = part.slice(0, divider).trim().toLowerCase();
    const value = part.slice(divider + 1).trim();
    if (key && value) {
      map.set(key, value);
    }
  }

  const ts = map.get("ts") ?? "";
  const v1 = map.get("v1") ?? "";
  if (!ts || !v1) return null;
  return { ts, v1 };
}

function secureEqualsHex(expected: string, received: string): boolean {
  const normalizedExpected = expected.trim().toLowerCase();
  const normalizedReceived = received.trim().toLowerCase();
  if (normalizedExpected.length !== normalizedReceived.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(normalizedExpected), Buffer.from(normalizedReceived));
}

function validateMercadoPagoSignature(request: Request, body: WebhookBody): void {
  const secret = process.env["MERCADO_PAGO_WEBHOOK_SECRET"]?.trim();
  if (!secret) {
    return;
  }

  const signatureHeader = parseMercadoPagoSignatureHeader(request.headers.get("x-signature"));
  if (!signatureHeader) {
    throw new Error("Assinatura do webhook do Mercado Pago ausente ou inválida.");
  }

  const requestId = request.headers.get("x-request-id")?.trim() ?? "";
  if (!requestId) {
    throw new Error("Cabeçalho x-request-id ausente no webhook do Mercado Pago.");
  }

  const sourceId = body.data?.id;
  const dataId =
    typeof sourceId === "string" || typeof sourceId === "number" ? String(sourceId).trim() : "";
  if (!dataId) {
    throw new Error("Webhook do Mercado Pago sem data.id para validação da assinatura.");
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${signatureHeader.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  if (!secureEqualsHex(expected, signatureHeader.v1)) {
    throw new Error("Assinatura do webhook do Mercado Pago inválida.");
  }
}

function toWebhookErrorResult(error: unknown): WebhookErrorResult {
  const message = error instanceof Error ? error.message : "Webhook processing failed";

  if (error instanceof Error && message.includes("Assinatura do webhook do Mercado Pago")) {
    return { status: 401, message, retryable: false, severity: "error", reason: "mp_signature_invalid" };
  }

  if (error instanceof Error && message.includes("x-request-id ausente")) {
    return { status: 400, message, retryable: false, severity: "warning", reason: "mp_request_id_missing" };
  }

  if (error instanceof Error && message.includes("MERCADO_PAGO_ACCESS_TOKEN")) {
    return { status: 500, message, retryable: false, severity: "critical", reason: "mp_access_token_missing" };
  }

  if (error instanceof Error && message.includes("Mercado Pago retornou erro ao consultar pagamento")) {
    if (message.includes("(429)") || message.includes("(500)") || message.includes("(502)") || message.includes("(503)") || message.includes("(504)")) {
      return { status: 503, message, retryable: true, severity: "critical", reason: "mp_api_transient" };
    }
    if (message.includes("(404)")) {
      return { status: 202, message, retryable: true, severity: "warning", reason: "mp_payment_not_found_yet" };
    }
    return { status: 502, message, retryable: true, severity: "error", reason: "mp_api_unexpected" };
  }

  return { status: 400, message, retryable: false, severity: "error", reason: "webhook_processing_error" };
}

async function getMercadoPagoPaymentDetails(paymentId: string): Promise<MercadoPagoPaymentDetails> {
  const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"]?.trim();
  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado para processar webhook do Mercado Pago.");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 240);
    throw new Error(`Mercado Pago retornou erro ao consultar pagamento (${response.status}): ${details}`);
  }

  const body = (await response.json()) as {
    id?: unknown;
    external_reference?: unknown;
    status?: unknown;
  };

  const resolvedPaymentId =
    typeof body.id === "string" ? body.id : typeof body.id === "number" ? String(body.id) : paymentId;
  const orderId = typeof body.external_reference === "string" ? body.external_reference : null;
  const rawStatus = typeof body.status === "string" ? body.status : null;

  return {
    paymentId: resolvedPaymentId,
    orderId,
    status: mapMercadoPagoStatus(rawStatus),
    rawStatus,
  };
}

async function maybeHandlePaymentWebhook(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/payments/webhook") {
    return null;
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payloadText = await request.text();
  let body: WebhookBody;
  try {
    body = JSON.parse(payloadText) as WebhookBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const provider = typeof body.provider === "string" ? body.provider.trim() : "";
  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const status = typeof body.status === "string" ? body.status.trim() : "";
  const providerPaymentId = typeof body.providerPaymentId === "string" ? body.providerPaymentId.trim() : null;
  const signature = request.headers.get("x-brasiltec-signature");

  const { processCheckoutPaymentWebhook } = await import("./lib/auth-store");

  if (isMercadoPagoWebhookBody(body)) {
    try {
      validateMercadoPagoSignature(request, body);
    } catch (error) {
      const mapped = toWebhookErrorResult(error);
      void dispatchPaymentAlert({
        title: "Falha de assinatura no webhook Mercado Pago",
        severity: mapped.severity,
        reason: mapped.reason,
        retryable: mapped.retryable,
        statusCode: mapped.status,
        provider: "mercado_pago",
        detail: mapped.message,
      });
      return jsonResponse(
        {
          error: mapped.message,
          retryable: mapped.retryable,
        },
        mapped.status,
      );
    }

    const sourceId = body.data?.id;
    const paymentId = typeof sourceId === "number" ? String(sourceId) : String(sourceId ?? "").trim();
    if (!paymentId) {
      return jsonResponse({ error: "Mercado Pago webhook sem identificador de pagamento." }, 400);
    }

    let details: MercadoPagoPaymentDetails;
    try {
      details = await getMercadoPagoPaymentDetails(paymentId);
    } catch (error) {
      const mapped = toWebhookErrorResult(error);
      void dispatchPaymentAlert({
        title: "Falha ao consultar pagamento no Mercado Pago",
        severity: mapped.severity,
        reason: mapped.reason,
        retryable: mapped.retryable,
        statusCode: mapped.status,
        provider: "mercado_pago",
        eventId: paymentId,
        detail: mapped.message,
      });
      return jsonResponse(
        {
          error: mapped.message,
          retryable: mapped.retryable,
        },
        mapped.status,
        mapped.retryable ? { "retry-after": "15" } : undefined,
      );
    }

    if (!details.orderId) {
      return jsonResponse({ error: "Mercado Pago webhook sem external_reference para localizar o pedido." }, 400);
    }

    if (!details.status) {
      return jsonResponse(
        {
          accepted: true,
          duplicate: false,
          applied: false,
          orderId: details.orderId,
          orderStatus: null,
          message: `Status do Mercado Pago ainda não final (${details.rawStatus ?? "desconhecido"}).`,
        },
        202,
      );
    }

    try {
      const result = await processCheckoutPaymentWebhook({
        provider: "mercado_pago",
        eventId: `mp:${details.paymentId}:${details.status}`,
        orderId: details.orderId,
        status: details.status,
        providerPaymentId: details.paymentId,
        signature,
        payload: payloadText,
        skipSignatureValidation: true,
      });
      return jsonResponse(result, 200);
    } catch (error) {
      const mapped = toWebhookErrorResult(error);
      void dispatchPaymentAlert({
        title: "Falha ao aplicar evento de webhook no pedido",
        severity: mapped.severity,
        reason: mapped.reason,
        retryable: mapped.retryable,
        statusCode: mapped.status,
        provider: "mercado_pago",
        eventId: `mp:${details.paymentId}:${details.status}`,
        orderId: details.orderId,
        detail: mapped.message,
      });
      return jsonResponse(
        {
          error: mapped.message,
          retryable: mapped.retryable,
        },
        mapped.status,
        mapped.retryable ? { "retry-after": "15" } : undefined,
      );
    }
  }

  if (!provider || !eventId || !orderId || !isSupportedWebhookStatus(status)) {
    return jsonResponse({ error: "Missing or invalid webhook fields" }, 400);
  }

  try {
    const result = await processCheckoutPaymentWebhook({
      provider,
      eventId,
      orderId,
      status,
      providerPaymentId,
      signature,
      payload: payloadText,
    });
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    void dispatchPaymentAlert({
      title: "Falha no webhook de pagamentos customizado",
      severity: "error",
      reason: "custom_webhook_processing_error",
      retryable: false,
      statusCode: 400,
      provider,
      eventId,
      orderId,
      detail: message,
    });
    return jsonResponse({ error: message }, 400);
  }
}

async function maybeHandlePaymentReconciliation(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/payments/reconcile") {
    return null;
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedToken = process.env["PAYMENT_RECONCILE_TOKEN"]?.trim();
  if (!expectedToken) {
    return jsonResponse({ error: "PAYMENT_RECONCILE_TOKEN não configurado." }, 503);
  }

  const auth = request.headers.get("authorization")?.trim() ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== expectedToken) {
    return jsonResponse({ error: "Não autorizado." }, 401);
  }

  let payload: { limit?: unknown; minOrderAgeMinutes?: unknown } = {};
  const rawBody = await request.text();
  if (rawBody.trim()) {
    try {
      payload = JSON.parse(rawBody) as { limit?: unknown; minOrderAgeMinutes?: unknown };
    } catch {
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
  }

  const limit = typeof payload.limit === "number" ? payload.limit : undefined;
  const minOrderAgeMinutes =
    typeof payload.minOrderAgeMinutes === "number" ? payload.minOrderAgeMinutes : undefined;

  try {
    const { runPaymentGatewayReconciliation } = await import("./lib/auth-store");
    const result = await runPaymentGatewayReconciliation({
      limit,
      minOrderAgeMinutes,
    });
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment reconciliation failed";
    return jsonResponse({ error: message }, 500);
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const reconciliationResponse = await maybeHandlePaymentReconciliation(request);
      if (reconciliationResponse) {
        return reconciliationResponse;
      }

      const webhookResponse = await maybeHandlePaymentWebhook(request);
      if (webhookResponse) {
        return webhookResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
