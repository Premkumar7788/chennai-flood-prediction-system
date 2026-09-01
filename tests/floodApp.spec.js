// tests/floodApp.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const EVIDENCE_DIR = './sprint5_js_evidence';

test.beforeAll(async () => {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
});

test.describe('Chennai Flood Prediction System - EC2 Deployment Verification', () => {

  test('01. Should successfully load and hydrate the React SPA', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    
    // Assert HTTP status 200 from EC2
    expect(response?.status()).toBe(200);

    // Verify root React mount container exists
    const reactRoot = page.locator('#root, #__next');
    await expect(reactRoot).toBeVisible();

    // Verify title or navigation presence
    const body = page.locator('body');
    await expect(body).toContainText(/flood|chennai|prediction|monitor/i);

    // Capture homepage evidence
    await page.screenshot({ path: `${EVIDENCE_DIR}/01_homepage_hydrated.png`, fullPage: true });
  });

  test('02. Should fill environmental parameters and trigger flood risk prediction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 1. Handle Zone Selection (Supports HTML <select> and custom React dropdowns)
    const zoneDropdown = page.locator("select[name='zone'], select#zone, [role='combobox'], [data-testid='zone-select']").first();
    
    if (await zoneDropdown.isVisible()) {
      const role = await zoneDropdown.getAttribute('role');
      if (role === 'combobox') {
        await zoneDropdown.click();
        await page.locator('text=Velachery').first().click();
      } else {
        await zoneDropdown.selectOption({ label: 'Velachery' });
      }
    }

    // 2. Fill Rainfall Input
    const rainfallInput = page.locator("input[name='rainfall'], input[placeholder*='Rainfall' i], input#rainfall").first();
    await rainfallInput.fill('185'); // 185 mm monsoon rainfall

    // 3. Fill Tide Level Input (if present)
    const tideInput = page.locator("input[name='tide'], input[placeholder*='Tide' i], input#tide").first();
    if (await tideInput.isVisible()) {
      await tideInput.fill('1.6');
    }

    // Capture filled form state
    await page.screenshot({ path: `${EVIDENCE_DIR}/02_form_filled.png` });

    // 4. Submit Form and Wait for API/State updates
    const submitBtn = page.locator("button:has-text('Predict'), button:has-text('Analyze'), button[type='submit']").first();
    await submitBtn.click();

    // 5. Verify the Prediction Output Card
    const resultCard = page.locator("[data-testid='prediction-result'], .result-card, [role='alert'], .alert").first();
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    // Assert risk evaluation text is rendered in React state
    await expect(resultCard).toContainText(/high|warning|risk|alert|flood|moderate|safe/i);

    // Capture verified feature execution screenshot
    await page.screenshot({ path: `${EVIDENCE_DIR}/03_prediction_output_verified.png`, fullPage: true });
  });

  test('03. Should verify UI responsiveness on mobile viewport', async ({ page }) => {
    // Mobile Viewport (iPhone 14 / Pixel 7)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const root = page.locator('#root, #__next');
    await expect(root).toBeVisible();

    await page.screenshot({ path: `${EVIDENCE_DIR}/04_mobile_view.png` });
  });

});