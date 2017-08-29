import { AngKoe1Page } from './app.po';

describe('ang-koe1 App', () => {
  let page: AngKoe1Page;

  beforeEach(() => {
    page = new AngKoe1Page();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
