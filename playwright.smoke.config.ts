import { defineConfig } from "@playwright/test";

const baseURL = process.env.SMOKE_BASE_URL ?? "http://localhost:4175";
const skipCommerceSmokes = process.env.SKIP_COMMERCE_SMOKES === "1";

export default defineConfig({
  testDir: "tests",
  testMatch: ["smoke-*.spec.ts"],
  testIgnore: skipCommerceSmokes
    ? [
        "smoke-finance-summary.spec.ts",
        "smoke-members-progress.spec.ts",
        "smoke-notifications.spec.ts",
        "smoke-payment-status.spec.ts",
        "smoke-product-page.spec.ts",
        "smoke-sprintA.spec.ts",
      ]
    : [],
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4175",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
