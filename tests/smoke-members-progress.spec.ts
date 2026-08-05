import { expect, test } from "@playwright/test";

test("Members progress persists after completing a lesson", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.members.${suffix}@exemplo.com`;
  const productName = `Curso Membros ${suffix}`;

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.locator("#nome").fill("Members Smoke User");
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
  await page.locator("#description").fill("Produto para validar persistência de progresso na área de membros.");
  await page.locator("#category").fill("Educacao");
  await page.locator("#price").fill("149");
  await page.locator('button:has-text("Salvar rascunho")').click();
  await page.waitForURL("**/produtos");
  await page.locator('button:has-text("Publicar")').first().click();

  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await page.locator(`article:has-text("${productName}") a:has-text("Comprar")`).first().click();

  await page.waitForURL("**/checkout**");
  await page.locator("#outcome").selectOption("approved");
  await page.locator('button:has-text("Finalizar compra")').click();
  await page.waitForURL("**/membros**");

  const enrollmentCard = page.locator(`article:has-text("${productName}")`).first();
  await expect(enrollmentCard).toBeVisible();
  await expect(enrollmentCard).toContainText("Progresso: 0%");

  const completeButton = enrollmentCard.getByRole("button", { name: "Marcar como concluída" }).first();
  await completeButton.click();

  await expect(enrollmentCard).toContainText("Progresso: 100%");
  await expect(enrollmentCard.getByRole("button", { name: "Concluída" }).first()).toBeVisible();

  // Reload members page to validate persisted progress in storage.
  await page.goto("/membros", { waitUntil: "domcontentloaded" });
  const persistedCard = page.locator(`article:has-text("${productName}")`).first();
  await expect(persistedCard).toContainText("Progresso: 100%");
});
