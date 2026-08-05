import { expect, test } from "@playwright/test";

test("Finance summary reflects approved sale and withdrawal reservation", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.finance.${suffix}@exemplo.com`;
  const productName = `Curso Financeiro ${suffix}`;

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.locator("#nome").fill("Finance Smoke User");
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
  await page.locator("#description").fill("Produto para validar consolidado financeiro após venda aprovada.");
  await page.locator("#category").fill("Educacao");
  await page.locator("#price").fill("200");
  await page.locator('button:has-text("Salvar rascunho")').click();
  await page.waitForURL("**/produtos");
  await page.locator('button:has-text("Publicar")').first().click();

  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await page.locator(`article:has-text("${productName}") a:has-text("Comprar")`).first().click();

  await page.waitForURL("**/checkout**");
  await page.locator("#outcome").selectOption("approved");
  await page.locator('button:has-text("Finalizar compra")').click();
  await page.waitForURL("**/membros**");

  await page.goto("/financeiro", { waitUntil: "domcontentloaded" });

  await expect(page.locator('article:has-text("Receita bruta")')).toContainText(/MZN\s*200,00/);
  await expect(page.locator('article:has-text("Taxa da plataforma")')).toContainText(/MZN\s*20,00/);
  await expect(page.locator('article:has-text("Taxa da plataforma")')).toContainText("10%");
  await expect(page.locator('article:has-text("Receita líquida")')).toContainText(/MZN\s*180,00/);
  await expect(page.locator('article:has-text("Saldo disponível")')).toContainText(/MZN\s*180,00/);

  await page.locator("#amount").fill("50");
  await page.locator('button:has-text("Solicitar saque")').click();

  await expect(page.locator('article:has-text("Saques solicitados")')).toContainText(/MZN\s*50,00/);
  await expect(page.locator('article:has-text("Saques aprovados")')).toContainText(/MZN\s*0,00/);
  await expect(page.locator('article:has-text("Valor reservado")')).toContainText(/MZN\s*50,00/);
  await expect(page.locator('article:has-text("Saldo disponível")')).toContainText(/MZN\s*130,00/);
  await expect(page.getByText("M-Pesa • requested").first()).toBeVisible();
});
