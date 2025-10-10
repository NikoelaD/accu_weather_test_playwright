import { Locator, Page } from "@playwright/test";
import { TodayWeatherMetric } from "./config/today-types";

export class CurrentWeatherPage {
  readonly page: Page;
  readonly tempLoc: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tempLoc = this.page.locator(
      "xpath=//div[contains(@class,'real-feel__text')]"
    );
  }

  async getTodayCityLabelInfo(label: TodayWeatherMetric) {
    const todayLocator = this.page
      .locator(
        `//div[contains(@class, 'spaced-content') and contains(@class, 'detail')][.//span[@class='label' and normalize-space(text())='${label}']]//span[@class='value']`
      )
      .first();
    await todayLocator.waitFor({ state: "visible" });
    let todayInfoText = (await todayLocator.innerText())?.trim();
    return todayInfoText;
  }

  async getTodayInfo() {
    const [tempNum, rawWind, rawWindGust, rawAirQuality] = await Promise.all([
      this.getTodayCityLabelInfo(TodayWeatherMetric.Temperature),
      this.getTodayCityLabelInfo(TodayWeatherMetric.Wind),
      this.getTodayCityLabelInfo(TodayWeatherMetric.WindGusts),
      this.getTodayCityLabelInfo(TodayWeatherMetric.AirQuality),
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

  async getTempAvg() {
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
