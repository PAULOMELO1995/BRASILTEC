import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "registration.spec.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4176",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4176",
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NODE_ENV: "production",
      PORT: "4176",
      HOST: "127.0.0.1",
      DATABASE_URL: "",
      SQLITE_PATH: process.env["REGISTRATION_TEST_SQLITE_PATH"] || ":memory:",
      WELCOME_EMAIL_ENABLED: "false",
      ADMIN_EMAILS: "admin.copy@exemplo.com",
      MODERATOR_EMAILS: "",
      ADMIN_VIEWER_EMAILS: "",
    },
  },
});
