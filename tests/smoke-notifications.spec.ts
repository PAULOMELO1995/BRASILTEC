import { expect, test } from "@playwright/test";

test("Notifications show approved purchase event", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.notifications.${suffix}@exemplo.com`;
  const productName = `Curso Notificacoes ${suffix}`;

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.locator("#nome").fill("Notifications Smoke User");
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

  await page.goto("/produtos/novo", { waitUntil: "domcontentloaded" });
  await page.locator("#name").fill(productName);
  await page.locator("#description").fill("Produto para validar evento de notificação de compra aprovada.");
  await page.locator("#category").fill("Educacao");
  await page.locator("#price").fill("190");
  await page.locator('button:has-text("Salvar rascunho")').click();
  await page.waitForURL("**/produtos");
  await page.locator('button:has-text("Publicar")').first().click();

  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await page.locator(`article:has-text("${productName}") a:has-text("Comprar")`).first().click();

  await page.waitForURL("**/checkout**");
  await page.locator("#outcome").selectOption("approved");
  await page.locator('button:has-text("Finalizar compra")').click();
  await page.waitForURL("**/membros**");

  await page.goto("/notificacoes", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Central de notificações" })).toBeVisible();
  await expect(page.getByText("Compra aprovada")).toBeVisible();

  const markReadButton = page.getByRole("button", { name: "Marcar como lida" }).first();
  if ((await markReadButton.count()) > 0) {
    await markReadButton.click();
    await expect(page.getByText("Notificação marcada como lida.")).toBeVisible();
  }
});
