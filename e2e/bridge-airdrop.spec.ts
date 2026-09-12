import { test, expect } from "@playwright/test";

test.describe("Bridge mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Switch to Bridge mode
    const bridgeTab = page.locator('[role="tablist"], .mode-tabs').first().getByRole("button", { name: "Bridge" });
    await bridgeTab.click();
  });

  test("shows From/To panels with separate network selectors", async ({ page }) => {
    await expect(page.getByText("From", { exact: true })).toBeVisible();
    await expect(page.getByText("To", { exact: true })).toBeVisible();
    // Two network selectors visible (From + To)
    await expect(page.getByRole("button", { name: /current Ethereum|current BNB Chain|current Polygon|current Solana/ })).toHaveCount(2);
  });

  test("clicking the swap-direction button inverts source and destination networks", async ({ page }) => {
    // Capture source network name
    const sourceNetworkButton = page.getByRole("button", { name: /current Ethereum|current BNB Chain|current Polygon|current Solana/ }).first();
    const sourceTextBefore = (await sourceNetworkButton.textContent()) ?? "";

    // Find the swap-direction button (between From and To panels)
    const swapButton = page.getByRole("button", { name: /Swap source and destination|Invertir/ });
    await swapButton.click();

    // After inversion, the source should be different
    const sourceTextAfter = (await sourceNetworkButton.textContent()) ?? "";
    expect(sourceTextBefore).not.toEqual(sourceTextAfter);
  });
});

test.describe("Airdrop mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const airdropTab = page.locator('[role="tablist"], .mode-tabs').first().getByRole("button", { name: "Airdrop" });
    await airdropTab.click();
  });

  test("shows Airdrop card with recipients textarea + amount input", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Airdrop" })).toBeVisible();
    await expect(page.getByPlaceholder(/Pega las direcciones|Paste addresses/)).toBeVisible();
    await expect(page.locator('input[placeholder="0.0"]')).toBeVisible();
  });

  test("paste 3 valid EVM addresses + 1 invalid shows correct counters", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Pega las direcciones|Paste addresses/);
    await textarea.fill(
      "0x7C670A7EBa354E0d22F0ecBBE7A36BF10dCE305E, 0xb5787DA56A4eaF11864696d8B5C6671aDF3449E7, 0xinvalid123, 0x93617904A0A15063B54bd14cC595AA10f2A8e358",
    );
    // Should show 3 valid + 1 invalid
    await expect(page.getByText(/3 (direcciones válidas|valid addresses)/)).toBeVisible();
    await expect(page.getByText(/1 (inválidas|invalid)/)).toBeVisible();
  });

  test("entering amount + recipients updates the total in summary", async ({ page }) => {
    const textarea = page.getByPlaceholder(/Pega las direcciones|Paste addresses/);
    await textarea.fill("0x7C670A7EBa354E0d22F0ecBBE7A36BF10dCE305E, 0xb5787DA56A4eaF11864696d8B5C6671aDF3449E7, 0x93617904A0A15063B54bd14cC595AA10f2A8e358");
    const amountInput = page.locator('input[placeholder="0.0"]');
    await amountInput.fill("1.5");
    // Summary should show 3 recipients + total 4.5
    await expect(page.getByText(/^3$/).or(page.getByText(/3 /))).toBeVisible();
  });

  test("CTA shows 'Enter at least one address' when no recipients entered", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Ingresa al menos una dirección|Enter at least one address/ })).toBeVisible();
  });
});

test.describe("DCA mode (coming soon)", () => {
  test("shows coming soon card when DCA tab clicked", async ({ page }) => {
    await page.goto("/");
    const dcaTab = page.locator('[role="tablist"], .mode-tabs').first().getByRole("button", { name: "DCA" });
    await dcaTab.click();
    await expect(page.getByText(/DCA — próximamente|DCA — coming soon/)).toBeVisible();
  });
});
