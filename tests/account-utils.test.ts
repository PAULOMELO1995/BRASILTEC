import test from "node:test";
import assert from "node:assert/strict";
import { buildCreatorAccessKey, normalizeAccountRole } from "../src/lib/account-utils.ts";

test("normalizeAccountRole accepts creator and client values", () => {
  assert.equal(normalizeAccountRole("creator"), "creator");
  assert.equal(normalizeAccountRole("cliente"), "client");
  assert.equal(normalizeAccountRole("CLIENT"), "client");
  assert.equal(normalizeAccountRole(undefined), "creator");
});

test("buildCreatorAccessKey returns a predictable seller key", () => {
  const key = buildCreatorAccessKey("brasiltec");
  assert.match(key, /^BRLT-CRTR-[A-Z0-9]{6}$/);
});
