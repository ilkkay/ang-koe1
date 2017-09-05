import { browser, by, element } from 'protractor';
import { AngKoe1Page } from './app.po';

describe('ang-koe1 App', () => {

  const loggingMsg = function (msg: string) {
    console.log(msg);
  }

  let page: AngKoe1Page;

  beforeEach(async () => {
    page = new AngKoe1Page();
    await page.navigateTo('/');
  });

  it('should show title Translate IT 2', async () => {
    const titleSelector = 'h1';
    await browser.driver.findElements(by.css(titleSelector));
    expect(page.getParagraphText('my-app h1')).toEqual('Translate IT 2');
  });

  // https://stackoverflow.com/questions/25878496/how-to-handle-table-data-in-protractor
  it('should show list of projects', async () => {
    const elementText = await page.getElementText('table');
    loggingMsg('Table contents: ' + elementText);
  })

  describe('navigation events', async () => {
    it('should navigate to detail page', async () => {
      await page.navigateTo('/projectsmain');
      const elementText = await page.getElementText('table');
      await page.navigateTo('/projectsmain/1');
      const elementText2 = await page.getElementText('table');
      expect(elementText).toEqual(elementText2);
    })

    it('should navigate to detail page when edit is clicked', async () => {
      const editButton = 'Edit';
      await page.navigateTo('/projectsmain');
      const elementText = await page.getElementText('table');

      // https://github.com/angular/protractor/blob/master/docs/debugging.md
      // browser.pause();

      await browser.driver.findElements(by.id(editButton));
      await element(by.buttonText(editButton)).click();
      const elementText2 = await page.getElementText('table');
      expect(elementText).toEqual(elementText2);
    })

  })
});
