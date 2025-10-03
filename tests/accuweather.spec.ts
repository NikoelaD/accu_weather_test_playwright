import { test } from "@playwright/test";
import { AccuWeatherPage } from "../src/accu-weather";

test.describe("Accu Weather Tests", () => {
  let accuWeather: AccuWeatherPage;

  test.beforeEach(async ({ page }) => {
    accuWeather = new AccuWeatherPage(page);
    await accuWeather.goto();
    await accuWeather.openCity();
  });

  test("test get hourly info", async () => {
    await accuWeather.navigateHourlyWidget();
    await accuWeather.getHourlyInfo();
    await accuWeather.getTempAvg();
  });

  test("test get today info, browser only", async ({ browserName }) => {
    const viewportWidth = test.info().project.use?.viewport?.width;

    const isMobile = viewportWidth !== undefined && viewportWidth <= 600;
    const isNonChromium = browserName === "webkit" || browserName === "firefox";
    const isMobileChromium = browserName === "chromium" && isMobile; // skip mobile as currently no info available, only temperature

    test.skip(isNonChromium || isMobile || isMobileChromium);

    await accuWeather.getTodayInfo();
  });
});
