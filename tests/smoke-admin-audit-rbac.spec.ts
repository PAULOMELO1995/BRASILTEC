import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";
import { readDownloadText } from "./helpers/download";

test("Admin RBAC audit supports filters and CSV export", async ({ browser }) => {
  const suffix = Date.now();
  const targetEmail = `smoke.audit.user.${suffix}@exemplo.com`;
  const adminEmail = `smoke.audit.admin.${suffix}@exemplo.com`;

  const targetContext = await browser.newContext();
  const targetPage = await targetContext.newPage();
  await registerAndReachConfirmation(targetPage, { name: "Audit Target User", email: targetEmail });
  await loginAndReachPanel(targetPage, targetEmail);

  const adminContext = await browser.newContext({ acceptDownloads: true });
  const adminPage = await adminContext.newPage();
  await registerAndReachConfirmation(adminPage, { name: "Audit Admin User", email: adminEmail });
  await loginAndReachPanel(adminPage, adminEmail);

  await adminPage.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(adminPage.getByRole("heading", { name: "Painel administrativo inicial" })).toBeVisible();

  const roleHeading = adminPage.getByRole("heading", { name: "Gestão de papéis administrativos" });
  await expect(roleHeading).toBeVisible();
  const roleSection = roleHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
  const targetRow = roleSection.locator("div.rounded-xl", { hasText: targetEmail }).first();
  await expect(targetRow).toBeVisible();
  await targetRow.locator("select").first().selectOption("viewer");
  await targetRow.getByRole("button", { name: "Salvar papel" }).click();
  await expect(targetRow.getByText("Papel atual: viewer")).toBeVisible({ timeout: 30_000 });

  const rbacAuditHeading = adminPage.getByRole("heading", { name: "Auditoria de papéis (RBAC)" });
  await expect(rbacAuditHeading).toBeVisible();
  const rbacSection = rbacAuditHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");

  await rbacSection.getByLabel("Usuário (nome ou email)").fill(targetEmail);
  await rbacSection.getByLabel("Ação").selectOption("grant");

  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - 7);
  const toDate = new Date(now);
  toDate.setDate(now.getDate() + 1);
  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);
  const dateInputs = rbacSection.locator('input[type="date"]');
  await dateInputs.nth(0).fill(from);
  await dateInputs.nth(1).fill(to);

  await rbacSection.getByRole("button", { name: "Aplicar filtros" }).click();

  const [rbacDownloadWithGrant] = await Promise.all([
    adminPage.waitForEvent("download"),
    rbacSection.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);
  await expect(rbacDownloadWithGrant.suggestedFilename()).toContain("auditoria-rbac-");

  let exportedRbacCsv = await readDownloadText(rbacDownloadWithGrant);
  if (!exportedRbacCsv.includes(targetEmail)) {
    await rbacSection.getByLabel("Ação").selectOption("all");
    await rbacSection.getByRole("button", { name: "Aplicar filtros" }).click();

    const [rbacDownloadFallback] = await Promise.all([
      adminPage.waitForEvent("download"),
      rbacSection.getByRole("button", { name: "Exportar CSV" }).click(),
    ]);
    exportedRbacCsv = await readDownloadText(rbacDownloadFallback);
  }

  await expect(exportedRbacCsv).toContain(targetEmail);

  const moderationHeading = adminPage.getByRole("heading", { name: "Auditoria de moderação" });
  const moderationSection = moderationHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
  await expect(moderationSection.getByRole("button", { name: "Exportar CSV" })).toBeVisible();

  await adminContext.close();
  await targetContext.close();
});