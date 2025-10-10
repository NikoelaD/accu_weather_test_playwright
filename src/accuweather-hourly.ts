import { Locator, Page } from "@playwright/test";
import { HourlyWeatherMetric } from "./config/hourly-types";

export class HourlyWeatherPage {
  readonly page: Page;
  readonly tempLoc: Locator;
  readonly hourlyLinkLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tempLoc = this.page.locator(
      "xpath=//div[contains(@class,'real-feel__text')]"
    );
    this.hourlyLinkLocator = this.page.getByRole("link", { name: "Hourly" });
  }

  async getHourlyCityLabelInfo(label: HourlyWeatherMetric) {
    const hourlyLocator = this.page
      .locator(`//p[normalize-space(text())='${label}']/span[@class='value']`)
      .first();
    await hourlyLocator.waitFor({ state: "visible" });
    return (await hourlyLocator.innerText())?.trim();
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

  async getHourlyInfo() {
    const [tempNum, rawWind, rawWindGust, rawAirQuality] = await Promise.all([
      this.getHourlyTemperature(),
      this.getHourlyCityLabelInfo(HourlyWeatherMetric.Wind),
      this.getHourlyCityLabelInfo(HourlyWeatherMetric.WindGusts),
      this.getHourlyCityLabelInfo(HourlyWeatherMetric.AirQuality),
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
  }

  async getHourlyTempAvg() {
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
