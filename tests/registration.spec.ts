import { expect, test } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import {
  loginAndReachPanel,
  registerAndReachConfirmation,
} from "./helpers/auth";

test("production registration creates an account, activates a session and permits a fresh login", async ({
  page,
  browser,
}) => {
  const email = `cadastro.${Date.now()}@exemplo.com`;
  const name = "Teste Cadastro";
  const failedScripts: string[] = [];

  page.on("response", (response) => {
    if (
      response.request().resourceType() === "script" &&
      response.status() >= 400
    ) {
      failedScripts.push(response.url());
    }
  });

  await registerAndReachConfirmation(page, { name, email });
  expect(failedScripts).toEqual([]);
  await expect(
    page.locator('script[src*="tanstack-start-dev-client-entry"]'),
  ).toHaveCount(0);
  await expect(page.getByText(name, { exact: true })).toBeVisible();

  const databasePath = process.env["REGISTRATION_TEST_SQLITE_PATH"];
  expect(
    databasePath,
    "Run npm run test:cadastro to verify persistent storage",
  ).toBeTruthy();
  if (!databasePath)
    throw new Error("Registration test database is not configured.");
  const database = new DatabaseSync(resolve(databasePath), { readOnly: true });
  try {
    const registeredUser = database
      .prepare("SELECT name, email, password_hash FROM users WHERE email = ?")
      .get(email);
    expect(registeredUser?.["name"]).toBe(name);
    expect(registeredUser?.["email"]).toBe(email);
    expect(registeredUser?.["password_hash"]).not.toBe("senha1234");
    expect(registeredUser?.["password_hash"]).toMatch(
      /^[a-f0-9]{32}:[a-f0-9]{128}$/,
    );
  } finally {
    database.close();
  }

  const session = (await page.context().cookies()).find(
    (cookie) => cookie.name === "brasiltec_session",
  );
  expect(session?.httpOnly).toBe(true);
  await page.reload();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Acessar painel", exact: true }).click();
  await expect(page).toHaveURL(/\/painel$/);
  await expect(page.getByText(email, { exact: true }).first()).toBeVisible();
  await page
    .locator("section")
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);

  const freshContext = await browser.newContext({
    baseURL: "http://127.0.0.1:4176",
  });
  try {
    const freshPage = await freshContext.newPage();
    await loginAndReachPanel(freshPage, email);
    await expect(
      freshPage.getByText(email, { exact: true }).first(),
    ).toBeVisible();

    await freshPage.goto("/cadastro");
    await freshPage.locator("#nome").fill(name);
    await freshPage.locator("#email").fill(email);
    await freshPage.locator("#senha").fill("senha1234");
    await freshPage.locator("#confirmar").fill("senha1234");
    await freshPage
      .getByRole("button", { name: "Cadastrar", exact: true })
      .click();
    await expect(freshPage.getByRole("alert")).toContainText(
      "Já existe um cadastro com este email.",
    );
    await expect(freshPage).toHaveURL(/\/cadastro$/);
  } finally {
    await freshContext.close();
  }
});

test("confirmation without a session does not claim that an account was created", async ({
  page,
}) => {
  await page.goto("/cadastro/confirmacao");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sua conta foi criada com sucesso" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Acessar painel", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Entrar na minha conta", exact: true }),
  ).toBeVisible();
});
