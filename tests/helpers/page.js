const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const pPage = await browser.newPage();
    const page = new Page(pPage);

    return new Proxy(page, {
      get: function(target, property) {
        return page[property] || browser[property] || pPage[property];
      }
    })
  }

  constructor(pPage) {
    this.pPage = pPage;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.pPage.setCookie({ name: 'session', value: session });
    await this.pPage.setCookie({ name: 'session.sig', value: sig });
    await this.pPage.goto('http://localhost:3000/blogs');
    await this.pPage.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.pPage.$eval(selector, el => el.innerHTML);
  }
}

module.exports = Page;
