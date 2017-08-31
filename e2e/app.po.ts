import { browser, by, element } from 'protractor';

export class AngKoe1Page {
  async navigateTo(page: string) {
    return await browser.get(page);
  }

  async getParagraphText(paragraphText: string) {
    return await element(by.css(paragraphText)).getText();
  }

  async getElementText(selector: string) {
    return await element(by.css(selector)).getText();
  }

  async getProjectById(id: string) {
    await browser.driver.findElements(by.id(id));
    return await element(by.id(id)).click();
  }

  async getProjectByName(name: string) {
    await browser.driver.findElements(by.text(name));
    return await element(by.text(name)).click();
  }

}
