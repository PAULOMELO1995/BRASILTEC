import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";

test("Viewer cannot create or update platform settings", async ({ browser }) => {
  const suffix = Date.now();
  const viewerEmail = `smoke.settings.viewer.${suffix}@exemplo.com`;
  const adminEmail = `smoke.settings.admin.${suffix}@exemplo.com`;

  const viewerContext = await browser.newContext();
  const viewerPage = await viewerContext.newPage();
  await registerAndReachConfirmation(viewerPage, { name: "Settings Viewer User", email: viewerEmail });
  await loginAndReachPanel(viewerPage, viewerEmail);

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await registerAndReachConfirmation(adminPage, { name: "Settings Role Admin", email: adminEmail });
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

  const settingsHeading = viewerPage.getByRole("heading", { name: "Configurações da plataforma" });
  await expect(settingsHeading).toBeVisible();
  const settingsSection = settingsHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");

  await expect(settingsSection.getByText("Somente admins podem alterar configurações.")).toBeVisible();

  const createBox = settingsSection.getByText("Criar nova configuração").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
  await expect(createBox.getByRole("button", { name: "Criar" })).toBeDisabled();

  const saveButtons = settingsSection.getByRole("button", { name: "Salvar" });
  const saveButtonCount = await saveButtons.count();
  for (let index = 0; index < saveButtonCount; index += 1) {
    await expect(saveButtons.nth(index)).toBeDisabled();
  }

  await adminContext.close();
  await viewerContext.close();
});