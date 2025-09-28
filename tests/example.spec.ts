import { test, expect } from "@playwright/test";
import { AccuWeatherPage } from "../src/accu-weather";

test.describe("Accu Weather Tests", () => {
  let accuWeather: AccuWeatherPage;

  test.beforeEach(async ({ page }) => {
    accuWeather = new AccuWeatherPage(page);
  });

  test("test get current city widget info", async ({ page }) => {
    await accuWeather.navigateToPage();
    await accuWeather.openCity();
    await accuWeather.navigateHourlyWidget()
    await accuWeather.getCurrentWidgetInfo();
  });

  test("test get current city hourly info", async ({ page }) => {
    await accuWeather.navigateHourlyWidget()
  });
});
