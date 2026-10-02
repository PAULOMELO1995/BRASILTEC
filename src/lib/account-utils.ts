export type AccountRole = "creator" | "client";

export function normalizeAccountRole(value: string | undefined | null): AccountRole {
  const normalized = (value ?? "creator").trim().toLowerCase();
  if (normalized === "cliente" || normalized === "client" || normalized === "cliente" || normalized === "consumer") {
    return "client";
  }
  return "creator";
}

export function buildCreatorAccessKey(seed: string): string {
  const cleanSeed = seed.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8) || "BRASILTEC";
  const suffix = Array.from(cleanSeed).reduce((sum, char) => sum + char.charCodeAt(0), 0).toString().slice(-6).padStart(6, "0");
  return `BRLT-CRTR-${suffix}`;
}
