import { expect, test } from "@playwright/test";

test("Password reset smoke flow", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.reset.${suffix}@exemplo.com`;
  const oldPassword = "senha1234";
  const newPassword = "novaSenha1234";

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });

  await page.locator("#nome").fill("Reset Smoke User");
  await page.locator("#email").fill(email);
  await page.locator("#senha").fill(oldPassword);
  await page.locator("#confirmar").fill(oldPassword);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/cadastro/confirmacao**");

  await page.goto("/recuperar-senha", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(email);
  await page.locator('button:has-text("Gerar recuperação")').click();

  const tokenText = (await page.locator("text=Token de desenvolvimento:").textContent()) ?? "";
  const token = tokenText.replace("Token de desenvolvimento:", "").trim();
  expect(token.length).toBeGreaterThan(20);

  await page.goto(`/redefinir-senha?token=${encodeURIComponent(token)}`, { waitUntil: "domcontentloaded" });
  await page.locator("#password").fill(newPassword);
  await page.locator("#confirmPassword").fill(newPassword);
  await page.locator('button:has-text("Salvar nova senha")').click();

  await expect(page.getByText("Senha redefinida com sucesso")).toBeVisible();

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(email);
  await page.locator("#senha").fill(newPassword);
  await page.locator('button:has-text("Entrar")').click();

  await page.waitForURL("**/painel**");
  await expect(page.getByText("Você avançou para o painel")).toBeVisible();
});
