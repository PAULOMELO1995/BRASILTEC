import { expect, test } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import {
  loginAndReachPanel,
  registerAndReachConfirmation,
} from "./helpers/auth";

test("homepage keeps signup and flow links without promotional statistics", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Criar minha conta", exact: true })).toHaveAttribute("href", "/cadastro");
  await expect(page.getByRole("link", { name: "Ver o fluxo", exact: true })).toHaveAttribute("href", "/como-funciona");
  await expect(page.getByText("+24k", { exact: true })).toHaveCount(0);
  await expect(page.getByText("99,9%", { exact: true })).toHaveCount(0);
  await expect(page.getByText("24/7", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/vendas processadas|suporte humano/)).toHaveCount(0);
});

test("missing Google configuration explains the fallback on registration and login", async ({ page }) => {
  test.skip(process.env["GOOGLE_AUTH_TEST"] === "1", "Uses the normal build without a Google client ID.");
  await page.goto("/cadastro");
  const unavailable = page.getByRole("status").filter({ hasText: "O acesso com Google ainda não está disponível" });
  test.skip(!(await unavailable.isVisible()), "The build already has a Google client ID configured.");
  for (const path of ["/cadastro", "/login"]) {
    await page.goto(path);
    await expect(page.getByRole("status")).toContainText("O acesso com Google ainda não está disponível");
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  }
});

test("Google registration handles credential and server failures without requiring password fields", async ({
  page,
}) => {
  test.skip(
    process.env["GOOGLE_AUTH_TEST"] !== "1",
    "Requires a build with a Google test client ID.",
  );
  await page.route("https://accounts.google.com/gsi/client", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
      let callback;
      window.google = { accounts: { id: {
        initialize(options) { callback = options.callback; },
        renderButton(parent, options) {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = options.text === "signup_with" ? "Cadastrar com Google" : "Continuar com Google";
          button.onclick = () => callback({ credential: "" });
          parent.appendChild(button);
          const valid = document.createElement("button");
          valid.type = "button";
          valid.textContent = "Enviar credencial de teste";
          valid.onclick = () => callback({ credential: "fake-credential-for-local-ui-test-only" });
          parent.appendChild(valid);
        }
      } } };
    `,
    }),
  );
  for (const path of ["/cadastro", "/login"]) {
    await page.goto(path);
    const googleButton = page.getByRole("button", {
      name:
        path === "/cadastro" ? "Cadastrar com Google" : "Continuar com Google",
      exact: true,
    });
    await googleButton.click();
    await expect(page.getByRole("alert")).toContainText("receber a credencial");
    if (path === "/cadastro")
      await page.locator("#tipo").selectOption("Afiliado");
    const requests: string[] = [];
    await page.route("**/*", async (route) => {
      if (route.request().method() === "POST") {
        requests.push(route.request().postData() ?? "");
        await route.fulfill({
          status: 500,
          contentType: "text/plain",
          body: "Google auth test unavailable",
        });
      } else {
        await route.continue();
      }
    });
    await page
      .getByRole("button", { name: "Enviar credencial de teste" })
      .click();
    await expect(page.getByRole("alert")).not.toContainText(
      "receber a credencial",
    );
    await expect(page.getByRole("alert")).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toContain("fake-credential-for-local-ui-test-only");
    if (path === "/cadastro") expect(requests[0]).toContain("Afiliado");
    await expect(page.locator("#senha")).toHaveValue("");
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await page.unroute("**/*");
  }
});

test("Google script load failure is visible and email registration remains available", async ({
  page,
}) => {
  test.skip(
    process.env["GOOGLE_AUTH_TEST"] !== "1",
    "Requires a build with a Google test client ID.",
  );
  await page.route("https://accounts.google.com/gsi/client", (route) =>
    route.abort(),
  );
  await page.goto("/cadastro");
  await expect(page.getByRole("alert")).toContainText("carregar o Google");
  await expect(
    page.getByRole("button", { name: "Cadastrar", exact: true }),
  ).toBeEnabled();
});

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
  await expect(page.getByText("Usuários cadastrados", { exact: true })).toBeVisible();
  await expect(page.getByText("Sessões ativas", { exact: true })).toBeVisible();
  await expect(page.getByText("Banco protegido", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Senhas com scrypt|Persistência:/)).toHaveCount(0);
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
