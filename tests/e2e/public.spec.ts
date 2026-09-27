import { expect, test } from "@playwright/test";

import { shot } from "./artifacts";

test.describe("public identity", () => {
  test("homepage states confirmed identity only", async ({ page }, testInfo) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "Eroish J Clevone" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("BUILD. LEAD. EXECUTE.");
    await expect(page.locator("body")).not.toContainText("Build the man.");
    await expect(page.getByText("Eroish Clevone Jeamson")).toBeVisible();
    await expect(page.getByText(/Born in Kinshasa/).first()).toBeVisible();
    await expect(
      page.getByText(/Grew up and lived across different countries, cities and provinces/).first(),
    ).toBeVisible();
    await expect(page.getByText(/Third Culture Kid/).first()).toBeVisible();
    await expect(page.getByText("Associated with CLEVONE SARL", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("net worth");
    await shot(page, testInfo.project.name === "mobile" ? "homepage_mobile" : "homepage_desktop");
  });

  test("journey, places, now, proof, ask, connect", async ({ page }, testInfo) => {
    const suffix = testInfo.project.name === "mobile" ? "_mobile" : "";

    await page.goto("/en/journey");
    await expect(page.getByRole("heading", { name: "Journey" })).toBeVisible();
    await expect(page.getByText(/Born in Kinshasa/).first()).toBeVisible();
    await expect(
      page.getByText(/Grew up and lived across different countries, cities and provinces/).first(),
    ).toBeVisible();
    await expect(page.locator('[data-chapter="builder"]')).toContainText("Needs confirmation");
    await expect(page.locator('[data-chapter="record"]')).not.toContainText("Verified");
    await expect(page.locator('[data-chapter="record"]')).not.toContainText("Needs confirmation");
    await shot(page, `journey_timeline${suffix}`);

    await page.goto("/en/places");
    await expect(page.getByRole("heading", { name: "Places" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kinshasa" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Place — needs confirmation" })).toBeVisible();
    await expect(page.getByText(/schematic|not to scale/i).first()).toBeVisible();
    await shot(page, `places_map${suffix}`);

    await page.goto("/en/now");
    await expect(page.getByRole("heading", { name: "Now" })).toBeVisible();
    await expect(page.getByText("Example data").first()).toBeVisible();
    await expect(page.getByText("Latest action").first()).toBeVisible();
    await shot(page, `now${suffix}`);

    await page.goto("/en/record");
    await expect(page.getByRole("heading", { name: "The Record" })).toBeVisible();
    await expect(page.getByText("Born in Kinshasa").first()).toBeVisible();
    await expect(page.getByText("Milestone").first()).toBeVisible();
    await shot(page, `record${suffix}`);

    await page.goto("/en/proof");
    await expect(page.getByRole("heading", { name: "Proof Graph" })).toBeVisible();
    await expect(page.getByText("Verified").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Born in Kinshasa/ }).first()).toBeVisible();
    await shot(page, `record_proof${suffix}`);

    await page.goto("/en/ask");
    await expect(page.getByRole("heading", { name: "Ask EJC" })).toBeVisible();
    await page.getByLabel("Ask EJC").fill("Where was EJC born?");
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText(/Kinshasa/).first()).toBeVisible();
    await page.getByLabel("Ask EJC").fill("What is his net worth?");
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText(/not established in the public EJC record/i)).toBeVisible();
    await shot(page, `ask_ejc${suffix}`);

    await page.goto("/en/connect");
    await expect(page.getByRole("heading", { name: "Connect" })).toBeVisible();
    await page.getByLabel("Identity").fill("Ada Example");
    await page.getByLabel("Organization").fill("Independent");
    await page.getByLabel("Contact email").fill("ada@example.com");
    await page.getByLabel("Reason").fill("Serious introduction about a public collaboration");
    await page.getByLabel("Context").fill("The request uses only the official identity channel.");
    await page.getByLabel("Why EJC").fill("EJC is the canonical public identity.");
    await page.getByLabel("Requested action").fill("Review the introduction");
    await page.getByRole("button", { name: "Send request" }).click();
    await expect(page.getByText("Request recorded")).toBeVisible();
    await shot(page, `connect${suffix}`);
  });

  test("French chrome and explore layer", async ({ page }, testInfo) => {
    await page.goto("/fr");
    await expect(page.getByText("Identité publique officielle", { exact: true })).toBeVisible();
    await expect(page.getByText("Entrepreneur · Homme d’affaires · Bâtisseur")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("BUILD. LEAD. EXECUTE.");
    await expect(page.getByText(/grandi et vécu dans différents pays, villes et provinces/).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    if (testInfo.project.name === "mobile") {
      const menu = page.locator("button[aria-controls=\"mobile-nav\"]");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("navigation", { name: "Menu" }).getByRole("link", { name: "Qui je suis" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await page.locator("#content").dispatchEvent("pointerdown", { bubbles: true, cancelable: true });
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(page).toHaveURL(/\/fr\/?$/);
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    }
    await shot(
      page,
      testInfo.project.name === "mobile" ? "homepage_fr_mobile" : "homepage_fr_desktop",
    );
    await page.getByRole("button", { name: "Explorer EJC" }).click();
    const explore = page.getByRole("dialog", { name: "Explorer EJC" });
    await expect(explore).toBeVisible();
    const identityLink = explore.getByRole("link", { name: "Qui je suis" });
    await expect(identityLink).toHaveAttribute("href", "/fr/identity");
    await identityLink.click();
    await expect(page).toHaveURL(/\/fr\/identity/);

    await page.goto("/fr/now");
    await expect(page.getByRole("heading", { name: "Maintenant" })).toBeVisible();
    await expect(page.getByText("Dernière action").first()).toBeVisible();
    if (testInfo.project.name !== "mobile") {
      await shot(page, "now_fr");
    }
  });

  test("mobile menu link still navigates", async ({ page }, testInfo) => {
    if (testInfo.project.name !== "mobile") test.skip();
    await page.goto("/fr");
    const menu = page.locator("button[aria-controls=\"mobile-nav\"]");
    await menu.click();
    await page.getByRole("navigation", { name: "Menu" }).getByRole("link", { name: "Qui je suis" }).click();
    await expect(page).toHaveURL(/\/fr\/identity/);
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  });

  test("SEO surfaces exist", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).not.toMatch(/^Host:/m);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain("/en/proof");
    expect(sitemapText).toContain("https://eroish.clevones.com");
    expect(sitemapText).not.toContain("127.0.0.1");
    const rss = await request.get("/feed.xml");
    expect(rss.ok()).toBeTruthy();
    const atom = await request.get("/feed.atom");
    expect(atom.ok()).toBeTruthy();
    const icon = await request.get("/icon");
    expect(icon.status()).toBeLessThan(400);
    const favicon = await request.get("/favicon.ico");
    expect(favicon.status()).toBeLessThan(400);
    const nowTitle = await request.get("/en/now");
    expect(await nowTitle.text()).toMatch(/<title>[^<]*Now/i);
    const frNow = await request.get("/fr/now");
    expect(await frNow.text()).toMatch(/<title>[^<]*Maintenant/i);
    const titles = new Set<string>();
    for (const path of ["/en", "/fr", "/admin/login", "/en/ask", "/fr/ask", "/en/now", "/fr/now"]) {
      const html = await (await request.get(path)).text();
      const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? "";
      expect(title, path).not.toMatch(/EJC · EJC|Ask EJC · EJC/i);
      expect(titles.has(title), `${path} ${title}`).toBeFalsy();
      titles.add(title);
    }
    const home = await request.get("/en");
    expect(home.headers()["x-nonce"]).toBeUndefined();
  });

  test("public pages do not raise CSP violations", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile") test.skip();
    const seen: string[] = [];
    await page.addInitScript(() => {
      window.addEventListener("securitypolicyviolation", (event) => {
        const bag = (window as unknown as { __csp?: string[] }).__csp ?? [];
        bag.push(`${event.effectiveDirective} ${event.blockedURI}`);
        (window as unknown as { __csp?: string[] }).__csp = bag;
      });
    });
    for (const path of ["/en", "/fr", "/en/connect", "/fr/connect", "/en/now", "/fr/places", "/en/ask"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      const pageViolations = await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
      seen.push(...pageViolations.map((item) => `${path}:${item}`));
    }
    expect(seen).toEqual([]);
  });
});
