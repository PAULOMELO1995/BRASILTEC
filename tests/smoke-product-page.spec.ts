import { expect, test } from "@playwright/test";

test("Product detail page smoke flow", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.detail.${suffix}@exemplo.com`;
  const productName = `Curso Detalhe ${suffix}`;

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });

  await page.locator("#nome").fill("Detail Smoke User");
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
  await page.locator("#description").fill("Produto para validar a página de detalhes.");
  await page.locator("#category").fill("Educacao");
  await page.locator("#price").fill("350");
  await page.locator('button:has-text("Salvar rascunho")').click();

  await page.waitForURL("**/produtos");
  await expect(page.getByText(productName)).toBeVisible();

  await page.locator('button:has-text("Publicar")').first().click();

  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(productName)).toBeVisible();

  const productCard = page.locator(`article:has-text("${productName}")`).first();
  await expect(productCard).toBeVisible();

  const detailLink = productCard.getByRole("link", { name: "Ver produto" });
  if ((await detailLink.count()) > 0) {
    await detailLink.first().click();
  } else {
    const checkoutHref = await productCard.locator('a[href*="/checkout?productId="]').first().getAttribute("href");
    expect(checkoutHref).toBeTruthy();
    const productId = new URL(checkoutHref ?? "", "http://localhost").searchParams.get("productId");
    expect(productId).toBeTruthy();
    await page.goto(`/marketplace/${productId}`, { waitUntil: "domcontentloaded" });
  }

  await expect(page).toHaveURL(/\/marketplace\/.+/);
  await expect(page.getByText("Página do produto")).toBeVisible();
  await expect(page.getByRole("heading", { name: productName })).toBeVisible();
  await expect(page.getByText("7 dias de garantia")).toBeVisible();
  await expect(page.getByRole("link", { name: "Comprar agora" })).toBeVisible();
});
