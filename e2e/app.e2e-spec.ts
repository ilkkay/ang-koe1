import { browser, by, element } from 'protractor';
import { AngKoe1Page } from './app.po';

describe('ang-koe1 App', () => {
  let page: AngKoe1Page;

  beforeEach(async() => {
    page = new AngKoe1Page();
    await page.navigateTo('/');
  });

  it('should show title Translate IT 2', async() => {
    const titleSelector = 'h1';
    await browser.driver.findElements(by.css(titleSelector));
    expect(page.getParagraphText('my-app h1')).toEqual('Translate IT 2');
  });

  describe('navigation events', async() => {

    const loggingMsg = function(msg: string){
      console.log(msg);
    }

    // https://stackoverflow.com/questions/25878496/how-to-handle-table-data-in-protractor
    it('should show list of projects', async() => {
      await page.navigateTo('/projects');
      const elementText = await page.getElementText('table');
      loggingMsg('Table contents: ' + elementText);
    })

    it('should show a single project', async() => {
      await page.navigateTo('/projects/1');
      expect(page.getParagraphText('app-project-detail h2')).toEqual('dotcms details!');
    })

    it('should navigate to detail page when edit is clicked', async() => {
      const editButton = 'Edit';
      await page.navigateTo('/projects/');
      await page.getElementText('table');
      await browser.driver.findElements(by.id(editButton));
      await element(by.buttonText(editButton)).click();
      expect(page.getParagraphText('app-project-detail h2')).toEqual('dotcms details!');
    })

  })
});
