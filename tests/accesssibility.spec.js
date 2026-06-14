import { test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Accessibility Scan", async ({ page }) => {
  await page.goto("http://localhost:5173");

  const results = await new AxeBuilder({ page }).analyze();

  results.violations.forEach((violation) => {
    console.log("\n========================");
    console.log("Issue:", violation.id);
    console.log("Description:", violation.description);

    violation.nodes.forEach((node) => {
      console.log("HTML Element:", node.html);
      console.log("Target:", node.target);
      console.log("========================");
    });
  });
});
