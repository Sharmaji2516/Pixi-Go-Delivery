import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));

  try {
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (e) {
    console.log("Navigation timeout, but continuing...");
  }
  
  console.log("Waiting for auth input...");
  try {
    const input = await page.$('input[type="password"]');
    if (input) {
      await input.type('9251');
      const submitBtn = await page.$('button[type="button"], button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        console.log("Clicked login!");
        await new Promise(r => setTimeout(r, 2000));
        
        // Click Total Orders
        const ordersBtn = await page.evaluateHandle(() => {
          return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Total Orders'));
        });
        if (ordersBtn) {
          await ordersBtn.click();
          console.log("Clicked Total Orders!");
        } else {
          console.log("Could not find Total Orders button");
        }
        await new Promise(r => setTimeout(r, 5000));
      }
    } else {
      console.log("No password input found. Already logged in?");
      await new Promise(r => setTimeout(r, 5000));
    }
  } catch(e) {
    console.log("Error interacting with page:", e);
  }
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("HTML length:", html.length);
  if (html.length < 500) console.log("HTML snippet:", html);
  
  await browser.close();
})();
