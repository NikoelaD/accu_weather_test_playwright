import { Locator, Page } from "@playwright/test";
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

  async closeAd(): Promise<void> {
    const iframeNames = [
      "google_ads_iframe_/6581/web/eur/interstitial/weather/hourly_0",
      "google_ads_iframe_/6581/mweb/eur/interstitial/weather/hourly_0",
    ];

    for (const name of iframeNames) {
      const iframeLocator = this.page.frameLocator(`iframe[name="${name}"]`);
      const closeButton = iframeLocator.getByRole("button", {
        name: "Close ad",
      });

      if ((await closeButton.count()) === 0) continue;

      if (await closeButton.isVisible()) {
        await closeButton.click();
        break;
      }
    }
  }

  async closePopup() {
    await this.popUpLocator.click();
  }

  async openCity(city: string = "Sofia-Capital BG") {
    await this.closePopup();
    await this.searchInputLocator.fill(city);
    await this.page.keyboard.press("Enter");
  }
}
