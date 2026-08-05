import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";

test("Admin panel shows initial operational metrics", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.admin.${suffix}@exemplo.com`;

  await registerAndReachConfirmation(page, { name: "Admin Smoke User", email });
  await loginAndReachPanel(page, email);

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Painel administrativo inicial" })).toBeVisible();
  await expect(page.getByText("Usuários totais")).toBeVisible();
  await expect(page.getByText("Produtos no catálogo")).toBeVisible();
});
