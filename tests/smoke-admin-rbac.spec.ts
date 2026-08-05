import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";

test("Admin role management keeps self-demotion guard", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.rbac.${suffix}@exemplo.com`;

  await registerAndReachConfirmation(page, { name: "RBAC Smoke User", email });
  await loginAndReachPanel(page, email);

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Painel administrativo inicial" })).toBeVisible();
  const roleHeading = page.getByRole("heading", { name: "Gestão de papéis administrativos" });
  await expect(roleHeading).toBeVisible();
  const roleSection = roleHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
  const selfGuardText = roleSection.getByText("Seu usuário não pode ser rebaixado por esta tela para evitar bloqueio administrativo.").first();

  if (await selfGuardText.isVisible()) {
    const selfRow = selfGuardText.locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
    await expect(selfRow).toBeVisible();

    const roleSelect = selfRow.locator("select");
    const saveButton = selfRow.getByRole("button", { name: "Salvar papel" });

    await roleSelect.selectOption("moderator");
    await expect(saveButton).toBeDisabled();

    await roleSelect.selectOption("admin");
    await expect(saveButton).toBeEnabled();
    return;
  }

  const firstRow = roleSection.locator("div.rounded-xl").first();
  await expect(firstRow).toBeVisible();
  const firstSelect = firstRow.locator("select").first();

  if (await firstSelect.isDisabled()) {
    await expect(page.getByText("Somente admins podem alterar papéis.")).toBeVisible();
    return;
  }

  const firstSave = firstRow.getByRole("button", { name: "Salvar papel" });
  await expect(firstSave).toBeEnabled();
});
