const puppeteer = require("puppeteer");

async function inspectLoginPage() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto("https://aviralifecare.com/admin/login", { waitUntil: "networkidle2" });

  const formHtml = await page.evaluate(() => {
    const forms = Array.from(document.querySelectorAll("form")).map(f => f.outerHTML);
    const inputs = Array.from(document.querySelectorAll("input")).map(i => ({
      name: i.name,
      id: i.id,
      type: i.type,
      placeholder: i.placeholder,
      outer: i.outerHTML
    }));
    const buttons = Array.from(document.querySelectorAll("button, input[type='submit']")).map(b => b.outerHTML);
    return { forms, inputs, buttons, body: document.body.innerText };
  });

  console.log("Form HTML:", JSON.stringify(formHtml, null, 2));
  await browser.close();
}

inspectLoginPage();
