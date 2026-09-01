const puppeteer = require("puppeteer");
const fs = require("fs");

async function debugPage() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");

  console.log("1. Navigating to login...");
  await page.goto("https://aviralifecare.com/admin/login", { waitUntil: "networkidle2" });

  const emailSelector = 'input[name="email"], input[name="username"], input[type="text"], input[type="email"]';
  const passwordSelector = 'input[name="password"], input[type="password"]';
  const submitSelector = 'button[type="submit"], input[type="submit"], form button';

  await page.type(emailSelector, "zipzan143@gmail.com");
  await page.type(passwordSelector, "156951");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
    page.click(submitSelector)
  ]);

  console.log("Current URL after login:", page.url());

  console.log("2. Navigating to memberregister...");
  await page.goto("https://aviralifecare.com/admin/memberregister", { waitUntil: "networkidle2" });
  console.log("Current URL:", page.url());

  // Wait for table
  try {
    await page.waitForSelector("table", { timeout: 10000 });
    console.log("Table found!");
  } catch (e) {
    console.log("Table NOT found within 10s:", e.message);
  }

  const tableInfo = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    const trs = document.querySelectorAll("table tbody tr, tr");
    const title = document.title;
    const bodyText = document.body.innerText.slice(0, 500);
    return {
      title,
      tablesCount: tables.length,
      rowsCount: trs.length,
      snippet: bodyText
    };
  });

  console.log("Table Info:", tableInfo);

  await browser.close();
}

debugPage();
