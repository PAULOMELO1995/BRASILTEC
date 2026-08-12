type RuntimeEnv = Record<string, string | boolean | undefined>;

function getRuntimeEnv(): RuntimeEnv {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  const fromVite = viteEnv && typeof viteEnv === "object" ? viteEnv : {};
  const fromProcess =
    typeof process !== "undefined" && process && typeof process === "object" && "env" in process && process.env && typeof process.env === "object"
      ? (process.env as Record<string, string | undefined>)
      : {};

  return Object.entries({ ...fromProcess, ...fromVite }).reduce<RuntimeEnv>((acc, [key, value]) => {
    if (typeof value === "string" || typeof value === "boolean") {
      acc[key] = value;
    } else if (value == null) {
      acc[key] = undefined;
    } else {
      acc[key] = String(value);
    }
    return acc;
  }, {});
}

function normalizeEnvValue(value: string | boolean | undefined): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "";
}

export function getEnv(key: string, fallback = ""): string {
  const runtimeEnv = getRuntimeEnv();
  const candidates = [key, key.toUpperCase(), key.toLowerCase()];

  for (const candidate of candidates) {
    const rawValue = runtimeEnv[candidate];
    const normalized = normalizeEnvValue(rawValue);
    if (normalized) {
      return normalized;
    }
  }

  return fallback;
}

export function getRequiredEnv(key: string, description: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`${description} não configurado. Defina ${key} no ambiente.`);
  }
  return value;
}

export function getEnvBoolean(key: string, fallback = false): boolean {
  const value = getEnv(key);
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getEnvNumber(key: string, fallback = 0): number {
  const value = getEnv(key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getEnvList(key: string, fallback: string[] = []): string[] {
  const value = getEnv(key);
  if (!value) return fallback;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAppBaseUrl(fallback = ""): string {
  const configuredBaseUrl = getEnv("APP_BASE_URL") || getEnv("VITE_APP_BASE_URL");
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  return fallback;
}
