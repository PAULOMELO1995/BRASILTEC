#!/usr/bin/env node

const requiredEnv = [
  "PAYMENT_GATEWAY_MODE",
  "PAYMENT_GATEWAY_PROVIDER",
  "MERCADO_PAGO_ACCESS_TOKEN",
  "APP_BASE_URL",
  "MERCADO_PAGO_WEBHOOK_SECRET",
  "PAYMENT_RECONCILE_URL",
  "PAYMENT_RECONCILE_TOKEN",
];

const optionalEnv = [
  "PAYMENT_ALERTS_WEBHOOK_URL",
  "PAYMENT_ALERTS_MIN_SEVERITY",
  "PAYMENT_ALERTS_COOLDOWN_SECONDS",
  "PAYMENT_RECONCILE_MAX_ORDERS",
  "PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES",
];

function readEnv(name) {
  return (process.env[name] ?? "").trim();
}

function maskValue(value) {
  if (!value) return "(missing)";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

async function probeReconciliationEndpoint(url, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      limit: 1,
      minOrderAgeMinutes: 0,
    }),
  });

  const raw = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Keep as raw fallback.
  }

  return {
    ok: response.ok,
    status: response.status,
    payload: parsed ?? raw,
  };
}

async function main() {
  const failures = [];
  const warnings = [];

  console.log("[readiness] checking required environment variables");
  for (const key of requiredEnv) {
    const value = readEnv(key);
    if (!value) {
      failures.push(`Missing required env: ${key}`);
    }
    console.log(`- ${key}: ${maskValue(value)}`);
  }

  console.log("[readiness] checking optional environment variables");
  for (const key of optionalEnv) {
    const value = readEnv(key);
    console.log(`- ${key}: ${maskValue(value)}`);
  }

  const mode = readEnv("PAYMENT_GATEWAY_MODE");
  if (mode.toLowerCase() !== "webhook") {
    failures.push("PAYMENT_GATEWAY_MODE must be set to webhook for production flow.");
  }

  const provider = readEnv("PAYMENT_GATEWAY_PROVIDER");
  if (provider.toLowerCase() !== "mercado_pago") {
    failures.push("PAYMENT_GATEWAY_PROVIDER must be mercado_pago.");
  }

  if (!readEnv("PAYMENT_ALERTS_WEBHOOK_URL")) {
    warnings.push("PAYMENT_ALERTS_WEBHOOK_URL not set. Critical failures will not be sent externally.");
  }

  const reconcileUrl = readEnv("PAYMENT_RECONCILE_URL");
  const reconcileToken = readEnv("PAYMENT_RECONCILE_TOKEN");
  if (reconcileUrl && reconcileToken) {
    console.log("[readiness] probing reconciliation endpoint");
    try {
      const probe = await probeReconciliationEndpoint(reconcileUrl, reconcileToken);
      console.log(`[readiness] reconcile endpoint status: ${probe.status}`);

      if (!probe.ok) {
        failures.push(`Reconcile endpoint probe failed with HTTP ${probe.status}`);
        console.log("[readiness] probe payload:");
        console.log(typeof probe.payload === "string" ? probe.payload : JSON.stringify(probe.payload, null, 2));
      } else {
        console.log("[readiness] reconcile endpoint probe succeeded");
      }
    } catch (error) {
      failures.push(`Reconcile endpoint probe error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\n[readiness] summary");
  console.log(`- failures: ${failures.length}`);
  console.log(`- warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log("[readiness] warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (failures.length > 0) {
    console.log("[readiness] failures:");
    for (const failure of failures) {
      console.log(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("[readiness] production readiness check passed");
}

await main();
