import { expect, test } from "@playwright/test";
import { loginAndReachPanel, registerAndReachConfirmation } from "./helpers/auth";

test("Checkout payment status flow (approved and declined)", async ({ page }) => {
  const suffix = Date.now();
  const email = `smoke.payment.${suffix}@exemplo.com`;
  const productName = `Curso Pagamento ${suffix}`;

  await registerAndReachConfirmation(page, { name: "Payment Smoke User", email });
  await loginAndReachPanel(page, email);

  await page.goto("/produtos/novo", { waitUntil: "domcontentloaded" });
  await page.locator("#name").fill(productName);
  await page.locator("#description").fill("Produto para validar status de pagamento.");
  await page.locator("#category").fill("Educacao");
  await page.locator("#price").fill("199");
  await page.locator('button:has-text("Salvar rascunho")').click();
  await page.waitForURL("**/produtos");
  await expect(page.getByText(productName)).toBeVisible();
  await page.locator('button:has-text("Publicar")').first().click();

  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(productName)).toBeVisible();

  // Approved flow
  await page.locator(`article:has-text("${productName}") a:has-text("Comprar")`).first().click();
  await page.waitForURL("**/checkout**");
  await page.locator("#outcome").selectOption("approved");
  await page.locator('button:has-text("Finalizar compra")').click();
  await page.waitForURL("**/membros**");
  await expect(page.getByText(productName)).toBeVisible();

  // Declined flow
  await page.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await page.locator(`article:has-text("${productName}") a:has-text("Comprar")`).first().click();
  await page.waitForURL("**/checkout**");
  await page.locator("#outcome").selectOption("declined");
  await page.locator('button:has-text("Finalizar compra")').click();
  await expect(page.getByText("Pagamento recusado. Escolha outro método e tente novamente.")).toBeVisible();

  await page.goto("/pedidos", { waitUntil: "domcontentloaded" });
  await page.locator("#status-filter").selectOption("declined");
  const declinedOrderCard = page.locator(`button:has-text("${productName}")`).first();
  await expect(declinedOrderCard).toBeVisible();
  await expect(declinedOrderCard.getByText("Recusado")).toBeVisible();
});
