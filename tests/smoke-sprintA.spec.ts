import { expect, test } from "@playwright/test";

test("Sprint A smoke flow", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.sprinta.${suffix}@exemplo.com`;
  const productName = `Curso Sprint A ${suffix}`;

  await page.goto("/cadastro?sprintA=1", { waitUntil: "domcontentloaded" });

  await page.locator("#nome").fill("Smoke User");
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
  await expect(page).toHaveURL(/\/produtos\/novo/);

  await page.locator("#name").fill(productName);
  await page.locator("#description").fill("Produto criado automaticamente pelo smoke test do Sprint A.");
  await page.locator("#category").fill("Educacao");
  await page.locator("#price").fill("250");
  await page.locator('button:has-text("Salvar rascunho")').click();

  await page.waitForURL("**/produtos");
  await expect(page.getByText(productName)).toBeVisible();

  await page.locator('button:has-text("Publicar")').first().click();
  await page.waitForTimeout(800);

  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(productName)).toBeVisible();
  await page.locator(`article:has-text("${productName}") a:has-text("Comprar")`).first().click();

  await page.waitForURL("**/checkout**");
  await expect(page.getByRole("heading", { name: productName })).toBeVisible();

  await page.locator('button:has-text("Finalizar compra")').click();
  await page.waitForURL("**/membros**");
  await expect(page.getByText(productName)).toBeVisible();

  await page.goto("/financeiro", { waitUntil: "domcontentloaded" });
  await page.locator("#amount").fill("20");
  await page.locator('button:has-text("Solicitar saque")').click();

  await expect(page.getByText("MZN 20,00").first()).toBeVisible();
  await expect(page.getByText("M-Pesa • requested").first()).toBeVisible();
});
