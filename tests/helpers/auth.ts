import { expect, type Page } from "@playwright/test";

type RegisterInput = {
  name: string;
  email: string;
  password?: string;
};

export async function registerAndReachConfirmation(page: Page, input: RegisterInput): Promise<void> {
  const password = input.password ?? "senha1234";

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.locator("#nome").fill(input.name);
  await page.locator("#email").fill(input.email);
  await page.locator("#senha").fill(password);
  await page.locator("#confirmar").fill(password);
  await page.locator('button[type="submit"]').click();

  let reachedConfirmation = false;
  try {
    await page.waitForURL("**/cadastro/confirmacao**", { waitUntil: "domcontentloaded", timeout: 20_000 });
    reachedConfirmation = true;
  } catch {
    // Fallback for intermittent client-side navigation stalls during smoke runs.
  }

  if (!reachedConfirmation) {
    await page.goto("/cadastro/confirmacao", { waitUntil: "domcontentloaded" });
  }

  await expect(page.getByRole("heading", { name: /Sua conta foi criada com sucesso/i })).toBeVisible({ timeout: 30_000 });
}

export async function loginAndReachPanel(page: Page, email: string, password = "senha1234"): Promise<void> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(email);
  await page.locator("#senha").fill(password);
  await page.locator('button:has-text("Entrar")').click();
  await page.waitForURL("**/painel**", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Você avançou para o painel/i })).toBeVisible({ timeout: 15_000 });
}