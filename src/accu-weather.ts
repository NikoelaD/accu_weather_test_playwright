import { Locator, Page } from "@playwright/test";
import { AccuWeatherHourlyConfig } from "./config/hourly-types";
import { WeatherConfig } from "./config/config";
import { AccuWeatherTodayConfig } from "./config/today-types";

export class AccuWeatherPage {
  readonly page: Page;
  isMobile: any;
  readonly adIframeLocator: Locator;
  readonly popUpLocator: Locator;
  readonly searchInputLocator: Locator;
  readonly tempLoc: Locator;
  readonly hourlyLinkLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adIframeLocator = this.page
      .locator(
        'iframe[name="google_ads_iframe_/6581/mweb/eur/interstitial/weather/local_home_0"]'
      )
      .contentFrame()
      .getByRole("button", { name: "Close ad" });
    this.popUpLocator = this.page.getByRole("button", {
      name: "Consent",
      exact: true,
    });
    this.searchInputLocator = this.page.getByRole("textbox", {
      name: "Search your Address",
    });
    this.tempLoc = this.page.locator(
      "xpath=//div[contains(@class,'real-feel__text')]"
    );
    this.hourlyLinkLocator = this.page.getByRole("link", { name: "Hourly" });
  }

  async navigateToPage() {
    await this.page.goto(WeatherConfig.urls.base);
  }

  async closeAdRecursive(): Promise<void> {
    const adIframe = await this.page.waitForTimeout(2000);
    if (this.isMobile) {
      await this.page.evaluate(() => {
        document.querySelector("div.portal-container")?.remove();
      });
      return;
    }

    if ((await this.adIframeLocator.count()) === 0) {
      return;
    }

    await this.adIframeLocator.click({ force: true });
    await this.adIframeLocator.first().waitFor({ state: "hidden" });
    await this.closeAdRecursive.call(this);
  }

  async closePopup() {
    await this.popUpLocator.click();
  }

  async openCity(city: string = "Sofia-Capital BG") {
    await this.closePopup();
    await this.searchInputLocator.fill(city);
    await this.page.keyboard.press("Enter");
    await this.closeAdRecursive();
  }

  async getHourlyCityLabelInfo(label: AccuWeatherHourlyConfig) {
    const hourlyLocator = this.page
      .locator(`//p[normalize-space(text())='${label}']/span[@class='value']`)
      .first();
    await hourlyLocator.waitFor({ state: "visible" });
    return (await hourlyLocator.innerText())?.trim();
  }

  async getTodayCityLabelInfo(label: AccuWeatherTodayConfig) {
    const todayLocator = this.page
      .locator(
        `//div[contains(@class, 'spaced-content') and contains(@class, 'detail')][.//span[@class='label' and normalize-space(text())='${label}']]//span[@class='value']`
      )
      .first();
    await todayLocator.waitFor({ state: "visible" });
    return (await todayLocator.innerText())?.trim();
  }

  async getHourlyTemperature(): Promise<{
    raw: string;
    numeric: number | null;
  }> {
    const raw = (await this.tempLoc.first().textContent()) ?? "";
    const cleaned = raw.replace(/\s+/g, " ").trim();

    const match = cleaned.match(/-?\d+/);
    return { raw: cleaned, numeric: match ? parseInt(match[0], 10) : null };
  }

  async getCurrentHourlyInfo() {
    const [tempNum, rawWind, rawWindGust, rawAirQuality] = await Promise.all([
      this.getHourlyTemperature(),
      this.getHourlyCityLabelInfo(AccuWeatherHourlyConfig.Wind),
      this.getHourlyCityLabelInfo(AccuWeatherHourlyConfig.WindGusts),
      this.getHourlyCityLabelInfo(AccuWeatherHourlyConfig.AirQuality),
    ]);

    const windNum = parseInt(rawWind?.match(/\d+/)?.[0] ?? "0", 10);
    const windGustNum = parseInt(rawWindGust?.match(/\d+/)?.[0] ?? "0", 10);

    const result = {
      temperature: tempNum,
      wind: windNum,
      windGusts: windGustNum,
      airQuality: rawAirQuality,
    };

    console.log(result);
  }

  async getCurrentTodayInfo() {
    const [tempNum, rawWind, rawWindGust, rawAirQuality] = await Promise.all([
      this.getTodayCityLabelInfo(AccuWeatherTodayConfig.Temperature),
      this.getTodayCityLabelInfo(AccuWeatherTodayConfig.Wind),
      this.getTodayCityLabelInfo(AccuWeatherTodayConfig.WindGusts),
      this.getTodayCityLabelInfo(AccuWeatherTodayConfig.AirQuality),
    ]);

    const windNum = parseInt(rawWind?.match(/\d+/)?.[0] ?? "0", 10);
    const windGustNum = parseInt(rawWindGust?.match(/\d+/)?.[0] ?? "0", 10);

    const result = {
      temperature: tempNum,
      wind: windNum,
      windGusts: windGustNum,
      airQuality: rawAirQuality,
    };

    console.log(result);
  }

  async navigateHourlyWidget() {
    await this.hourlyLinkLocator.click();
    await this.closeAdRecursive();
  }

  async getAllTemperatures() {
    const allTexts = await this.tempLoc.allTextContents();

    const temps = allTexts.map((text) => {
      const cleaned = text.replace(/\s+/g, " ").trim();
      const match = cleaned.match(/-?\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });

    const average = temps.reduce((acc, cur) => acc + cur, 0) / temps.length;
    console.log("Average Temperature:", average);
    return { temps, average };
  }
}
