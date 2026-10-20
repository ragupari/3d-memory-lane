import { PerspectiveCamera, Vector3 } from "three";
import { photos } from "../../src/data/photos";
import { generatePhotoLayout } from "../../src/utils/journey";
import { expect, test } from "@playwright/test";
test("desktop journey: enter, wheel, revisit, inspect, reload and sound", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin Our Walk" }),
  ).toBeEnabled();
  await page.screenshot({ path: "test-results/desktop-intro.png" });
  await page.getByRole("button", { name: "Begin Our Walk" }).click();
  await page.waitForTimeout(1700);
  const initialSeed = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("memory-forest.journey.v1")!)
        .seed as number,
  );
  const first = generatePhotoLayout(photos, initialSeed)[0];
  const camera = new PerspectiveCamera(64, 1440 / 900, 0.1, 95);
  camera.position.set(0, 1.75, 2);
  camera.updateMatrixWorld();
  const projected = new Vector3(
    first.worldX,
    first.y,
    first.worldZ,
  ).project(camera);
  await page.mouse.click((projected.x + 1) * 720, (1 - projected.y) * 450);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.locator(".nearby-memories button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".photo-image img")).toBeVisible();
  await page.screenshot({ path: "test-results/desktop-memory.png" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Move forward", exact: true }).click();
  await page.getByRole("button", { name: "Move forward", exact: true }).click();
  await page.waitForTimeout(1800);
  const distance = Number(
    await page.locator("main").getAttribute("data-distance"),
  );
  expect(distance).toBeGreaterThan(0);
  await page.screenshot({ path: "test-results/desktop-explore.png" });
  await page.mouse.click(720, 450);
  await page.keyboard.down("s");
  await page.waitForTimeout(1600);
  await page.keyboard.up("s");
  await page.getByRole("button", { name: "Play romantic ambience" }).click();
  await expect(
    page.getByRole("button", { name: "Mute romantic ambience" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mute romantic ambience" }).click();
  await page.waitForTimeout(1600);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("memory-forest.journey.v1")!),
  );
  expect(saved.distance).toBeGreaterThan(0);
  expect(saved.discovered.length).toBeGreaterThan(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Continue your journey" }),
  ).toBeEnabled();
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("memory-forest.journey.v1")!),
  );
  expect(restored.seed).toBe(saved.seed);
  expect(errors).toEqual([]);
});
test("mobile, instructions, reduced motion and completion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.screenshot({ path: "test-results/mobile-intro.png" });
  await page.getByRole("button", { name: "Begin Our Walk" }).click();
  const touch = await page.context().newCDPSession(page);
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 195, y: 520 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 195, y: 300 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(1800);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("memory-forest.journey.v1")!).distance,
    ),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: "How to explore" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Let’s wander" }).click();
  for (let i = 0; i < 24; i++) {
    if (
      await page.getByRole("button", { name: "Relive the journey" }).isVisible()
    )
      break;
    await page
      .getByRole("button", { name: "Move forward", exact: true })
      .click();
    await page.waitForTimeout(500);
  }
  await expect(
    page.getByRole("button", { name: "Relive the journey" }),
  ).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: "test-results/mobile-ending.png" });
  await page.getByRole("button", { name: "Walk back", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Move forward", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/mobile-explore.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("WebGL fallback remains keyboard accessible", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2" || type === "webgl") return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByText("A quieter way to remember.")).toBeVisible();
  await page.locator(".fallback button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
