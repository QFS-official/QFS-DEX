import { test, expect } from "@playwright/test";

test.describe("Swap mode (default)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the swap card to render (default mode)
    await expect(page.getByRole("heading", { name: /Swap entre tokens|Swap between tokens/ })).toBeVisible();
  });

  test("has QFS Swap brand + bridge badge in header", async ({ page }) => {
    const brand = page.locator("header").getByText(/QFS Swap/);
    await expect(brand).toBeVisible();
    const badge = page.locator("header").getByText("Bridge");
    await expect(badge).toBeVisible();
  });

  test("shows 4 mode tabs: Swap, DCA, Bridge, Airdrop", async ({ page }) => {
    const tabs = page.locator('[role="tablist"], .mode-tabs').first();
    await expect(tabs.getByRole("button", { name: "Swap" })).toBeVisible();
    await expect(tabs.getByRole("button", { name: "DCA" })).toBeVisible();
    await expect(tabs.getByRole("button", { name: "Bridge" })).toBeVisible();
    await expect(tabs.getByRole("button", { name: "Airdrop" })).toBeVisible();
  });

  test("swap card has De/A panels with token selectors + amount inputs", async ({ page }) => {
    // The De label and A label should be visible
    await expect(page.getByText("De", { exact: true }).or(page.getByText("From", { exact: true }))).toBeVisible();
    await expect(page.getByText("A", { exact: true }).or(page.getByText("To", { exact: true }))).toBeVisible();
    // Amount input (placeholder 0.0)
    await expect(page.locator('input[placeholder="0.0"]').first()).toBeVisible();
  });

  test("entering 0.1 in De updates A with the converted amount", async ({ page }) => {
    const deInput = page.locator('input[placeholder="0.0"]').first();
    const aInput = page.locator('input[placeholder="0.0"]').nth(1);
    await deInput.fill("0.1");
    // Wait for the destination amount to be computed (auto-fill after input)
    await expect(aInput).not.toHaveValue("");
    // Destination value should be a number > 0
    const aValue = await aInput.inputValue();
    expect(parseFloat(aValue)).toBeGreaterThan(0);
  });

  test("clicking the swap-direction button inverts De and A tokens", async ({ page }) => {
    const deButton = page.locator('button[aria-label*="Invertir"], button[aria-label*="Swap source"], button[aria-label*="Invert"], button[aria-label*="Swap direction"]').first();
    // Capture the current De token symbol
    const deTokenButton = page.locator('button[aria-label="Seleccionar token"], button[aria-label="Select token"]').first();
    const deTokenText1 = (await deTokenButton.textContent()) ?? "";

    await deButton.click();

    // After inversion, the De token should be different
    const deTokenText2 = (await deTokenButton.textContent()) ?? "";
    expect(deTokenText1).not.toEqual(deTokenText2);
  });

  test("Connect wallet pill in header opens the wallet modal", async ({ page }) => {
    const connectButton = page.locator("header").getByRole("button", { name: /Conectar wallet|Connect wallet/ });
    await connectButton.click();
    // Wallet modal should show 5 wallets (MetaMask, Trust, Coinbase, Binance, WalletConnect)
    await expect(page.getByText("MetaMask")).toBeVisible();
    await expect(page.getByText("Trust Wallet")).toBeVisible();
    await expect(page.getByText("Coinbase Wallet")).toBeVisible();
    await expect(page.getByText("Binance Web3 Wallet")).toBeVisible();
    await expect(page.getByText("WalletConnect")).toBeVisible();
  });
});

test.describe("Theme + language toggles", () => {
  test("theme toggle switches between dark and light", async ({ page }) => {
    await page.goto("/");
    const themeButton = page.locator("header").getByRole("button", { name: /Cambiar tema|Toggle theme/ });
    // Default is dark
    await expect(page.locator("html")).toHaveClass(/dark|light/);
    const classBefore = await page.locator("html").getAttribute("class");
    await themeButton.click();
    // After clicking, the class should change
    const classAfter = await page.locator("html").getAttribute("class");
    expect(classBefore).not.toEqual(classAfter);
  });

  test("language toggle switches between ES and EN", async ({ page }) => {
    await page.goto("/");
    const langButton = page.locator("header").getByRole("button", { name: /Cambiar idioma|Change language/ });
    await langButton.click();
    // Dropdown should appear
    await expect(page.getByRole("menuitem", { name: "EN English" })).toBeVisible();
    await page.getByRole("menuitem", { name: "EN English" }).click();
    // After switching to EN, nav should show "Connect wallet"
    await expect(page.locator("header").getByText(/Connect wallet/)).toBeVisible();
  });
});
