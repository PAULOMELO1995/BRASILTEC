import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";

test("Viewer can access admin in read-only mode and cannot moderate", async ({ browser }) => {
  const suffix = Date.now();
  const viewerEmail = `smoke.viewer.${suffix}@exemplo.com`;
  const adminEmail = `smoke.roleadmin.${suffix}@exemplo.com`;

  const viewerContext = await browser.newContext();
  const viewerPage = await viewerContext.newPage();

  await registerAndReachConfirmation(viewerPage, { name: "Viewer RBAC User", email: viewerEmail });
  await loginAndReachPanel(viewerPage, viewerEmail);

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  await registerAndReachConfirmation(adminPage, { name: "Role Admin User", email: adminEmail });
  await loginAndReachPanel(adminPage, adminEmail);

  await adminPage.goto("/admin", { waitUntil: "domcontentloaded" });
  const roleHeading = adminPage.getByRole("heading", { name: "Gestão de papéis administrativos" });
  await expect(roleHeading).toBeVisible();

  const roleSection = roleHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
  const viewerRow = roleSection.locator("div.rounded-xl", { hasText: viewerEmail }).first();
  await expect(viewerRow).toBeVisible();

  const viewerRoleSelect = viewerRow.locator("select").first();
  await viewerRoleSelect.selectOption("viewer");
  await viewerRow.getByRole("button", { name: "Salvar papel" }).click();

  await viewerPage.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(viewerPage.getByRole("heading", { name: "Painel administrativo inicial" })).toBeVisible();
  await expect(viewerPage.getByText("Seu papel atual permite apenas visualização.")).toBeVisible();
  await expect(viewerPage.getByRole("button", { name: "Aprovar" })).toHaveCount(0);

  await adminContext.close();
  await viewerContext.close();
});
