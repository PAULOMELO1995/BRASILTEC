import { defineConfig } from "@playwright/test";

const baseURL = process.env.SMOKE_BASE_URL ?? "http://localhost:4175";

export default defineConfig({
  testDir: "tests",
  testMatch: ["smoke-*.spec.ts"],
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
