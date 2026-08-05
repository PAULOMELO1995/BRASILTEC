import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";
import { readDownloadText } from "./helpers/download";

test("Moderation audit CSV export includes latest moderation reason", async ({ browser }) => {
  const suffix = Date.now();
  const adminEmail = `smoke.audit.mod.admin.${suffix}@exemplo.com`;
  const uniqueReason = `motivo-smoke-audit-${suffix}`;

  const adminContext = await browser.newContext({ acceptDownloads: true });
  const adminPage = await adminContext.newPage();

  await registerAndReachConfirmation(adminPage, { name: "Moderation Audit Admin", email: adminEmail });
  await loginAndReachPanel(adminPage, adminEmail);

  await adminPage.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(adminPage.getByRole("heading", { name: "Painel administrativo inicial" })).toBeVisible();

  const queueHeading = adminPage.getByRole("heading", { name: "Fila de moderação" });
  await expect(queueHeading).toBeVisible();
  const queueSection = queueHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");

  const rejectButtons = queueSection.getByRole("button", { name: "Rejeitar" });
  const rejectCount = await rejectButtons.count();
  expect(rejectCount).toBeGreaterThan(0);

  adminPage.once("dialog", async (dialog) => {
    await dialog.accept(uniqueReason);
  });
  await rejectButtons.first().click();

  const moderationAuditHeading = adminPage.getByRole("heading", { name: "Auditoria de moderação" });
  await expect(moderationAuditHeading).toBeVisible();
  const moderationAuditSection = moderationAuditHeading.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
  await expect(moderationAuditSection.getByText(uniqueReason)).toBeVisible({ timeout: 30_000 });

  const [download] = await Promise.all([
    adminPage.waitForEvent("download"),
    moderationAuditSection.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);

  await expect(download.suggestedFilename()).toContain("auditoria-moderacao-");
  const csv = await readDownloadText(download);
  await expect(csv).toContain(uniqueReason);
  await expect(csv).toContain("acao");

  await adminContext.close();
});