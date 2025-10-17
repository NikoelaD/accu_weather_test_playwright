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

  test("test get hourly info", async ({ browserName }) => {
    test.skip((test.info().project.use?.viewport?.width ?? Infinity) <= 600);

    await hourlyWeather.navigateHourlyWidget();
    await uiActions.closeAdBrowser();
    await hourlyWeather.getHourlyInfo();
    await currentWeather.getTempAvg();
  });

  test("test get hourly info, phone only", async () => {
    test.skip((test.info().project.use?.viewport?.width ?? 0) > 600);

    await hourlyWeather.navigateHourlyWidget();
    await uiActions.closeAdMobile();
    await hourlyWeather.getHourlyInfo();
    await currentWeather.getTempAvg();
  });

  test("test get today info, browser only", async ({ browserName }) => {
    test.skip((test.info().project.use?.viewport?.width ?? Infinity) <= 600);

    await currentWeather.getTodayInfo();
  });
});
