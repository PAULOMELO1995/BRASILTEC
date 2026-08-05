import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";
import { readDownloadText } from "./helpers/download";

test("Platform settings CRUD is audited and exportable in consolidated logs", async ({ browser }) => {
  const suffix = Date.now();
  const adminEmail = `smoke.settings.admin.${suffix}@exemplo.com`;
  const settingKey = `smoke.setting.${suffix}.flag`;

  const adminContext = await browser.newContext({ acceptDownloads: true });
  const adminPage = await adminContext.newPage();

  await registerAndReachConfirmation(adminPage, { name: "Settings Audit Admin", email: adminEmail });
  await loginAndReachPanel(adminPage, adminEmail);

  await adminPage.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(adminPage.getByRole("heading", { name: "Painel administrativo inicial" })).toBeVisible();

  const settingsHeading = adminPage.getByRole("heading", { name: "Configurações da plataforma" });
  await expect(settingsHeading).toBeVisible();
  const settingsSection = settingsHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");

  const createBox = settingsSection.getByText("Criar nova configuração").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
  await createBox.locator("input").nth(0).fill(settingKey);
  await createBox.locator("input").nth(1).fill("enabled");
  await createBox.getByRole("button", { name: "Criar" }).click();

  const settingRow = settingsSection.locator("div.rounded-xl", { hasText: settingKey }).first();
  await expect(settingRow).toBeVisible({ timeout: 30_000 });

  const settingValueInput = settingRow.locator("input").first();
  await expect(settingValueInput).toHaveValue("enabled");
  await settingValueInput.fill("disabled");
  await settingRow.getByRole("button", { name: "Salvar" }).click();
  await expect(settingValueInput).toHaveValue("disabled", { timeout: 30_000 });

  const consolidatedHeading = adminPage.getByRole("heading", { name: "Auditoria administrativa consolidada" });
  await expect(consolidatedHeading).toBeVisible();
  const consolidatedSection = consolidatedHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");

  await consolidatedSection.getByLabel("Tipo de evento").selectOption("platform_setting");
  await consolidatedSection.getByLabel("Ator (nome/email)").fill(adminEmail);

  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - 1);
  const toDate = new Date(now);
  toDate.setDate(now.getDate() + 1);
  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);

  const dateInputs = consolidatedSection.locator('input[type="date"]');
  await dateInputs.nth(0).fill(from);
  await dateInputs.nth(1).fill(to);

  await consolidatedSection.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(consolidatedSection.getByText(settingKey).first()).toBeVisible({ timeout: 30_000 });

  const [download] = await Promise.all([
    adminPage.waitForEvent("download"),
    consolidatedSection.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);

  await expect(download.suggestedFilename()).toContain("auditoria-consolidada-");
  const csv = await readDownloadText(download);
  await expect(csv).toContain(settingKey);
  await expect(csv).toContain("platform_setting");
  expect(csv.includes("create") || csv.includes("update")).toBeTruthy();

  await adminContext.close();
});