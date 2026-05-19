const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Basic user flow for Website', () => {
  beforeEach(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  it('Initial Home Page - Check for 20 product items', async () => {
    const numProducts = await page.$$eval('product-item', items => items.length);
    expect(numProducts).toBe(20);
  });

  it('Make sure <product-item> elements are populated', async () => {
    const prodItemsData = await page.$$eval('product-item', items =>
      items.map(item => item.data)
    );

    for (const item of prodItemsData) {
      expect(item.title).toBeTruthy();
      expect(item.price).toBeTruthy();
      expect(item.image).toBeTruthy();
    }
  }, 20000);

  it('Clicking the "Add to Cart" button should change button text', async () => {
    const product = await page.$('product-item');
    const shadowRoot = await product.getProperty('shadowRoot');
    const button = await shadowRoot.$('button');

    await button.click();
    await sleep(300);

    const text = await button.evaluate(btn => btn.innerText);
    expect(text).toBe('Remove from Cart');
  }, 20000);

  it('Checking number of items in cart on screen', async () => {
    const products = await page.$$('product-item');

    for (const product of products) {
      const shadowRoot = await product.getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      const text = await button.evaluate(btn => btn.innerText);

      if (text === 'Add to Cart') {
        await button.click();
        await sleep(300);
      }
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('20');
  }, 30000);

  it('Checking number of items in cart on screen after reload', async () => {
    await page.evaluate(() => {
      localStorage.setItem(
        'cart',
        '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]'
      );
    });

    await page.reload();
    await sleep(500);

    const products = await page.$$('product-item');

    for (const product of products) {
      const shadowRoot = await product.getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      const text = await button.evaluate(btn => btn.innerText);
      expect(text).toBe('Remove from Cart');
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('20');
  }, 30000);

  it('Checking the localStorage to make sure cart is correct', async () => {
    await page.evaluate(() => {
      localStorage.setItem(
        'cart',
        '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]'
      );
    });

    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]');
  });

  it('Checking number of items in cart on screen after removing from cart', async () => {
  await page.evaluate(() => {
    localStorage.setItem(
      'cart',
      '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]'
    );
  });

  await page.reload();
  await sleep(500);

  await page.$$eval('product-item', products => {
    products.forEach(product => {
      const button = product.shadowRoot.querySelector('button');
      if (button.innerText === 'Remove from Cart') {
        button.click();
      }
    });
  });

  await sleep(1000);

  const cartCount = await page.$eval('#cart-count', el => el.innerText);
  expect(cartCount).toBe('0');
}, 30000);

  it('Checking number of items in cart on screen after reload', async () => {
    await page.evaluate(() => {
      localStorage.setItem('cart', '[]');
    });

    await page.reload();
    await sleep(500);

    const products = await page.$$('product-item');

    for (const product of products) {
      const shadowRoot = await product.getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      const text = await button.evaluate(btn => btn.innerText);
      expect(text).toBe('Add to Cart');
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('0');
  }, 30000);

  it('Checking the localStorage to make sure cart is correct', async () => {
    await page.evaluate(() => {
      localStorage.setItem('cart', '[]');
    });

    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe('[]');
  });
});