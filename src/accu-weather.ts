import { Locator, Page } from "@playwright/test";
import { AccuWeatherConfig } from "./config/types";
import { WeatherConfig } from "./config/config"

export class AccuWeatherPage {
  readonly page: Page;
  isMobileEnv: any;

  constructor(page: Page) {
    this.page = page;

  }

  async navigateToPage() {
    await this.page.goto(WeatherConfig.urls.base);
  }

  async closeAd() {
    let adLoc = this.page
      .locator(
        'iframe[name="google_ads_iframe_/6581/web/eur/interstitial/admin/search_0"]'
      )
      .contentFrame()
      .getByRole("button", { name: "Close ad" })
      
      await adLoc.click();
  }

  async openCity(city: string = "Sofia-Capital BG") {
    await this.page
      .getByRole("button", { name: "Consent", exact: true })
      .click();
    await this.page
      .getByRole('textbox', { name: 'Search your Address' }).fill(city);
    await this.page.keyboard.press("Enter");
  }

  async openCityWidget(city: string = "Sofia-Capital BG"){
    await this.page.locator("xpath=//div[contains(@class,'title-container')]").click()
  }

  async getCityLabelInfo(label: AccuWeatherConfig) {
    const locator = this.page.locator(
      `//p[normalize-space(text())='${label}']/span[@class='value']`
    );
    await locator.waitFor({ state: "visible" });
    return (await locator.innerText())?.trim();
  }

  async getTemperature(): Promise<{ raw: string; numeric: number | null }> {
  const tempLoc = this.page.locator("xpath=//div[contains(@class,'real-feel__text')]").first();
  const raw = (await tempLoc.textContent()) ?? "";
  const cleaned = raw.replace(/\s+/g, " ").trim();

  const match = cleaned.match(/-?\d+/);
  return { raw: cleaned, numeric: match ? parseInt(match[0], 10) : null };
}

  async getCurrentWidgetInfo() {
    //get current temp, wind, wind gust, air quality
    let tempLoc = this.page.locator("xpath=")

    const [tempNum, rawWind, rawWindGust, rawAirQuality] = await Promise.all([
      this.getTemperature(),
      this.getCityLabelInfo(AccuWeatherConfig.Wind),
      this.getCityLabelInfo(AccuWeatherConfig.WindGusts),
      this.getCityLabelInfo(AccuWeatherConfig.AirQuality),
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
    await this.page.getByRole("link", { name: "Hourly" }).click();
    // await this.page.waitForTimeout(3000)
    // await this.closeAd();
  }

  async getHourlyWidgetInfo() {}
}
