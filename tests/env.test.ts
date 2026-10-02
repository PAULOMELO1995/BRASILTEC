import assert from "node:assert/strict";
import test from "node:test";
import { getAppBaseUrl, getEnv, getEnvBoolean, getEnvList, getEnvNumber, getRequiredEnv } from "../src/lib/env.ts";

test("getEnv normalizes values and uses fallbacks", () => {
  process.env.TEST_ENV_SAMPLE = "  enabled  ";

  assert.equal(getEnv("TEST_ENV_SAMPLE"), "enabled");
  assert.equal(getEnv("TEST_ENV_MISSING", "fallback"), "fallback");
});

test("getEnvBoolean, getEnvNumber and getEnvList parse common formats", () => {
  process.env.TEST_ENV_BOOL = "true";
  process.env.TEST_ENV_NUMBER = "42";
  process.env.TEST_ENV_LIST = "alpha, beta ,gamma";

  assert.equal(getEnvBoolean("TEST_ENV_BOOL"), true);
  assert.equal(getEnvNumber("TEST_ENV_NUMBER", 10), 42);
  assert.deepEqual(getEnvList("TEST_ENV_LIST"), ["alpha", "beta", "gamma"]);
});

test("getRequiredEnv throws with a helpful message when the value is missing", () => {
  delete process.env.TEST_ENV_REQUIRED;

  assert.throws(() => getRequiredEnv("TEST_ENV_REQUIRED", "Token de acesso"), /Token de acesso/);
});

test("getAppBaseUrl prefers configured base url and otherwise uses fallback", () => {
  delete process.env.APP_BASE_URL;
  delete process.env.VITE_APP_BASE_URL;

  assert.equal(getAppBaseUrl("https://fallback.example"), "https://fallback.example");
});
