import { MangoappsPage } from './app.po';

describe('mangoapps App', () => {
  let page: MangoappsPage;

  beforeEach(() => {
    page = new MangoappsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
