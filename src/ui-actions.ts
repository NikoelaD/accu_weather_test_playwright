import { expect, Locator, Page } from "@playwright/test";
import { AccuWeatherConfig } from "./config/config";

export class UIActions {
  readonly page: Page;
  readonly popUpLocator: Locator;
  readonly searchInputLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.popUpLocator = this.page.getByRole("button", {
      name: "Consent",
      exact: true,
    });
    this.searchInputLocator = this.page.getByRole("textbox", {
      name: "Search your Address",
    });
  }

  async goto() {
    await this.page.goto(AccuWeatherConfig.urls.base);
  }

  async closeAdBrowser(): Promise<void> {
    let buttonWebLoc = this.page
      .locator(
        'iframe[name="google_ads_iframe_/6581/web/eur/interstitial/weather/local_home_0"]'
      )
      .contentFrame()
      .getByRole("button", { name: "Close ad" });
    try {
      await buttonWebLoc.waitFor({ state: "visible" });
      await buttonWebLoc.click();
    } catch {
      console.log("No ad displayed");
    }
  }

  async closeAdMobile(): Promise<void> {
    let mobileWebLoc = this.page
      .locator(
        'iframe[name="google_ads_iframe_/6581/mweb/eur/interstitial/weather/local_home_0"]'
      )
      .contentFrame()
      .getByRole("button", { name: "Close ad" });
    try {
      await mobileWebLoc.waitFor({ state: "visible" });
      await mobileWebLoc.click();
    } catch {
      console.log("No ad displayed");
    }
  }

  async closePopup() {
    await this.popUpLocator.click();
  }

  async openCity(city: string = "Sofia-Capital BG") {
    await this.searchInputLocator.fill(city);
    await this.page.keyboard.press("Enter");
  }

  async openCityWidget() {
    let cityWidgetLocator = await this.page.getByRole("link", {
      name: "Current Weather",
    });
    await cityWidgetLocator.scrollIntoViewIfNeeded();
    await cityWidgetLocator.click();
  }
}
