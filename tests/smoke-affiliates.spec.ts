import { expect, test } from "@playwright/test";

test("Affiliate request and referral link flow", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.affiliate.${suffix}@exemplo.com`;

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.locator("#nome").fill("Affiliate Smoke User");
  await page.locator("#email").fill(email);
  await page.locator("#senha").fill("senha1234");
  await page.locator("#confirmar").fill("senha1234");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/cadastro/confirmacao**");

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(email);
  await page.locator("#senha").fill("senha1234");
  await page.locator('button:has-text("Entrar")').click();
  await page.waitForURL("**/painel**");

  await page.goto("/afiliados", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Programa de afiliação" })).toBeVisible();

  await page.locator('button:has-text("Solicitar afiliação")').click();

  await expect(page.getByText("Solicitação de afiliação registrada com sucesso.")).toBeVisible();
  await expect(page.getByText("Em análise")).toBeVisible();
  await expect(page.locator('input[readonly]').first()).toHaveValue(/\/marketplace\?ref=/);
});
