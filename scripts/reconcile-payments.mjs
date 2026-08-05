#!/usr/bin/env node

const endpoint = (process.env.PAYMENT_RECONCILE_URL ?? "http://127.0.0.1:3000/api/payments/reconcile").trim();
const token = (process.env.PAYMENT_RECONCILE_TOKEN ?? "").trim();

if (!token) {
  console.error("PAYMENT_RECONCILE_TOKEN is required.");
  process.exit(2);
}

const limitRaw = process.env.PAYMENT_RECONCILE_MAX_ORDERS;
const minAgeRaw = process.env.PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES;

const payload = {};
if (limitRaw && Number.isFinite(Number(limitRaw))) {
  payload.limit = Number(limitRaw);
}
if (minAgeRaw && Number.isFinite(Number(minAgeRaw))) {
  payload.minOrderAgeMinutes = Number(minAgeRaw);
}

const startedAt = new Date().toISOString();
console.log(`[reconcile] started at ${startedAt}`);
console.log(`[reconcile] endpoint: ${endpoint}`);

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let json = null;
  try {
    json = JSON.parse(raw);
  } catch {
    // Keep raw fallback for non-json responses.
  }

  if (!response.ok) {
    console.error(`[reconcile] failed with HTTP ${response.status}`);
    if (json) {
      console.error(JSON.stringify(json, null, 2));
    } else {
      console.error(raw.slice(0, 1000));
    }
    process.exit(1);
  }

  if (json) {
    const summary = {
      provider: json.provider,
      checkedOrders: json.checkedOrders,
      updatedOrders: json.updatedOrders,
      unchangedOrders: json.unchangedOrders,
      skippedOrders: json.skippedOrders,
      issues: Array.isArray(json.issues) ? json.issues.length : 0,
      startedAt: json.startedAt,
      completedAt: json.completedAt,
    };
    console.log("[reconcile] success");
    console.log(JSON.stringify(summary, null, 2));

    if (Array.isArray(json.issues) && json.issues.length > 0) {
      console.warn("[reconcile] issues detected:");
      for (const issue of json.issues.slice(0, 10)) {
        console.warn(`- ${issue.orderId}: ${issue.message}`);
      }
      process.exit(3);
    }

    process.exit(0);
  }

  console.log("[reconcile] success");
  console.log(raw.slice(0, 1000));
  process.exit(0);
} catch (error) {
  console.error("[reconcile] execution error");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
