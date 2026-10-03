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

test("dashboard navigation groups routes and highlights product subpages on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await registerAndReachConfirmation(page, {
    name: "Teste Menu Desktop",
    email: `menu.desktop.${Date.now()}@exemplo.com`,
  });
  await page.getByRole("link", { name: "Acessar painel", exact: true }).click();

  const sidebar = page.getByRole("complementary", { name: "Menu lateral" });
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByText("Visão geral", { exact: true })).toBeVisible();
  await expect(sidebar.getByText("Meu negócio", { exact: true })).toBeVisible();
  await expect(
    sidebar.getByText("Gestão e ajuda", { exact: true }),
  ).toBeVisible();
  await expect(sidebar.getByRole("navigation").getByRole("link")).toHaveCount(
    9,
  );
  await expect(
    sidebar.getByRole("link", { name: "Painel", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("banner").getByRole("navigation")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Abrir menu do painel" }),
  ).toBeHidden();

  await page
    .getByRole("banner")
    .getByRole("link", { name: "Criar produto", exact: true })
    .click();
  await expect(page).toHaveURL(/\/produtos\/novo$/);
  await expect(
    sidebar.getByRole("link", { name: "Produtos", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(
    page
      .getByRole("banner")
      .getByText("Criar produto", { exact: true })
      .first(),
  ).toBeVisible();

  await sidebar.getByRole("link", { name: "Painel", exact: true }).click();
  await expect(page).toHaveURL(/\/painel$/);
  for (const width of [768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(sidebar).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }

  await page.route("**/*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "Logout unavailable",
      });
    } else {
      await route.continue();
    }
  });
  await sidebar.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(sidebar.getByRole("alert")).toContainText(
    "Não foi possível sair.",
  );
  await expect(
    sidebar.getByRole("button", { name: "Sair", exact: true }),
  ).toBeEnabled();
  await expect(page).toHaveURL(/\/painel$/);
  await page.unrouteAll({ behavior: "wait" });
  await sidebar.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("mobile dashboard menu supports navigation, focus, resizing and logout without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await registerAndReachConfirmation(page, {
    name: "Teste Menu Mobile",
    email: `menu.mobile.${Date.now()}@exemplo.com`,
  });
  await page.getByRole("link", { name: "Acessar painel", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Abrir menu do painel" });
  const dialog = page.getByRole("dialog");
  await expect(
    page.getByRole("complementary", { name: "Menu lateral" }),
  ).toBeHidden();

  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 812 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("navigation").getByRole("link")).toHaveCount(
      9,
    );
    await expect(
      dialog.getByRole("link", { name: "Painel", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }

  await trigger.click();
  await dialog.getByRole("link", { name: "Produtos", exact: true }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(dialog).toBeHidden();
  await trigger.click();
  await expect(
    dialog.getByRole("link", { name: "Produtos", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await dialog
    .getByRole("link", { name: "Criar produto", exact: true })
    .click();
  await expect(page).toHaveURL(/\/produtos\/novo$/);
  await expect(dialog).toBeHidden();
  await trigger.click();
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("complementary", { name: "Menu lateral" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await trigger.click();
  await dialog
    .getByRole("button", { name: "Fechar menu", exact: true })
    .click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("button", { name: "Abrir menu do painel" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await expect(
    dialog.getByRole("link", { name: "Criar conta", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("link", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL(/\/cadastro$/);
  await expect(dialog).toBeHidden();
});
