const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const file = path.resolve(process.argv[2]);
  const out = path.resolve(process.argv[3]);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: out,
    printBackground: true,
    preferCSSPageSize: true,
    landscape: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
  });
  await browser.close();
  console.log('PDF_OK', out);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
