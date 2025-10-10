import { test } from "@playwright/test";
import { CurrentWeatherPage } from "../src/accuweather-current";
import { HourlyWeatherPage } from "../src/accuweather-hourly";
import { UIActions } from "../src/ui-actions";

test.describe("Accu Weather Tests", () => {
  let currentWeather: CurrentWeatherPage;
  let hourlyWeather: HourlyWeatherPage;
  let uiActions: UIActions;

  test.beforeEach(async ({ page }) => {
    currentWeather = new CurrentWeatherPage(page);
    hourlyWeather = new HourlyWeatherPage(page);
    uiActions = new UIActions(page);
    await uiActions.goto();
    await uiActions.closePopup();
    await uiActions.openCity();
  });

  test("test get hourly info", async () => {
    await hourlyWeather.navigateHourlyWidget();
    await uiActions.closeAd();
    await hourlyWeather.getHourlyInfo();
    await currentWeather.getTempAvg();
  });

  test("test get today info, browser only", async ({ browserName }) => {
    const viewportWidth = test.info().project.use?.viewport?.width;

    const isMobile = viewportWidth !== undefined && viewportWidth <= 600;
    const isNonChromium = browserName === "webkit" || browserName === "firefox";
    const isMobileChromium = browserName === "chromium" && isMobile; // skip mobile as currently no info available, only temperature

    test.skip(isNonChromium || isMobile || isMobileChromium);

    await currentWeather.getTodayInfo();
  });
});
