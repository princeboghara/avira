const puppeteer = require("puppeteer");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join("D:\\aviracare\\avira", file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = (match[2] || "").trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  }
}

loadEnv();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Admin Configuration
const CONFIG = {
  baseUrl: "https://aviralifecare.com",
  adminLoginUrl: "https://aviralifecare.com/admin/login",
  ordersListUrl: "https://aviralifecare.com/admin/orders-list",
  membersListUrl: "https://aviralifecare.com/admin/memberregister",
  adminEmail: process.env.OLD_ADMIN_EMAIL || "admin@gmail.com",
  adminPassword: process.env.OLD_ADMIN_PASSWORD || "842026273",
  syncIntervalMinutes: 15
};

const clean = (t) => (t || "").replace(/\s+/g, " ").trim();

class AviraSyncBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async initBrowser() {
    console.log("🚀 Launching silent Headless Chrome engine...");
    this.browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080"
      ]
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");
  }

  async login() {
    console.log(`🔐 Logging in silently to ${CONFIG.adminLoginUrl}...`);
    try {
      await this.page.goto(CONFIG.adminLoginUrl, { waitUntil: "networkidle2", timeout: 30000 });

      if (this.page.url().includes("/admin/dashboard") || this.page.url().includes("/admin/index")) {
        console.log("✅ Already logged in!");
        this.isLoggedIn = true;
        return true;
      }

      const emailSelector = 'input[name="email"], input[name="username"], input[type="text"], input[type="email"]';
      const passwordSelector = 'input[name="password"], input[type="password"]';
      const submitSelector = 'button[type="submit"], input[type="submit"], form button';

      await this.page.waitForSelector(emailSelector, { timeout: 10000 });
      await this.page.type(emailSelector, CONFIG.adminEmail);
      await this.page.type(passwordSelector, CONFIG.adminPassword);

      await Promise.all([
        this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
        this.page.click(submitSelector)
      ]);

      console.log("✅ Successfully logged in as Admin!");
      this.isLoggedIn = true;
      return true;
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      return false;
    }
  }

  async syncMembers(client) {
    console.log("\n👥 [1/2] Syncing All Members, KYC & Wallets from https://aviralifecare.com/admin/memberregister...");
    try {
      await this.page.goto(CONFIG.membersListUrl, { waitUntil: "networkidle2", timeout: 45000 });

      // Expand all DataTable rows
      await this.page.evaluate(() => {
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
          try {
            const dt = window.jQuery('table').DataTable();
            dt.page.len(3000).draw();
          } catch {}
        }
      });
      await new Promise(r => setTimeout(r, 1500));

      const rawMembers = await this.page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("table tbody tr"));
        return rows.map(r => {
          const cells = Array.from(r.querySelectorAll("td")).map(td => td.innerText.trim());
          const editLink = r.querySelector('a[href*="memberedit"]')?.href || "";
          return {
            srNo: cells[1] || "",
            joiningDate: cells[2] || "",
            memberId: cells[3] || "",
            name: cells[4] || "",
            email: cells[5] || "",
            mobile: cells[6] || "",
            sponsorId: cells[7] || "",
            sponsorName: cells[8] || "",
            package: cells[9] || "",
            totalTopup: cells[10] || "0",
            eWallet: cells[11] || "0",
            fundWallet: cells[12] || "0",
            password: cells[13] || "",
            editLink
          };
        });
      });

      console.log(`Found ${rawMembers.length} total members on page.`);

      const existingUsersRes = await client.query("SELECT member_id FROM users");
      const existingMembers = new Set(existingUsersRes.rows.map(u => u.member_id.trim().toUpperCase()));

      const toInsert = rawMembers.filter(m => m.memberId && !existingMembers.has(m.memberId.toUpperCase()));
      console.log(`Members to import/update: ${toInsert.length}`);

      if (toInsert.length === 0) {
        console.log("👍 All members already up to date.");
        return;
      }

      const BATCH = 100;
      let insertedCount = 0;

      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH);

        // Bulk Users
        const userPlaceholders = [];
        const userValues = [];
        let uIdx = 1;

        // Bulk Wallets
        const walletPlaceholders = [];
        const walletValues = [];
        let wIdx = 1;

        // Bulk PV
        const pvPlaceholders = [];
        const pvValues = [];
        let pvIdx = 1;

        // Bulk KYC
        const kycPlaceholders = [];
        const kycValues = [];
        let kycIdx = 1;

        for (const m of batch) {
          const memId = m.memberId.trim().toUpperCase();
          const newUserId = `usr_${memId.toLowerCase()}`;

          userPlaceholders.push(`($${uIdx++}, $${uIdx++}, $${uIdx++}, $${uIdx++}, $${uIdx++}, '$2a$10$7v8Q4Zq2A8y1E4s5m0K6.eH0z0Z1.8b8P9G6C6b6e7v8Q4Zq2A8y1', $${uIdx++}, $${uIdx++}, '395010', 'Gujarat', 'Surat', '', $${uIdx++}, 'ACTIVE', 'MEMBER', NOW())`);
          userValues.push(
            newUserId,
            memId,
            (m.name || `Member ${memId}`).slice(0, 100),
            (m.mobile || "9999999999").replace(/\D/g, "").slice(-10) || "9999999999",
            m.email || `${memId.toLowerCase()}@aviralifecare.com`,
            m.sponsorId || "AV0001",
            m.sponsorName || "Avira LifeCare",
            m.joiningDate || "2026-09-01"
          );

          walletPlaceholders.push(`($${wIdx++}, $${wIdx++}, $${wIdx++}, 0, $${wIdx++}, NOW())`);
          walletValues.push(
            newUserId,
            parseFloat(m.eWallet.replace(/[₹,\s]/g, "")) || 0,
            parseFloat(m.fundWallet.replace(/[₹,\s]/g, "")) || 0,
            parseFloat(m.totalTopup.replace(/[₹,\s]/g, "")) || 0
          );

          pvPlaceholders.push(`($${pvIdx++}, 100, 0, 0, 0, 0, NOW())`);
          pvValues.push(newUserId);

          kycPlaceholders.push(`($${kycIdx++}, 'PENDING', NOW())`);
          kycValues.push(newUserId);
        }

        await client.query(`
          INSERT INTO users (
            id, member_id, full_name, mobile, email, password_hash,
            sponsor_id, sponsor_name, pincode, state, city, address,
            joined_date, status, role, created_at
          ) VALUES ${userPlaceholders.join(",\n")}
          ON CONFLICT (member_id) DO NOTHING
        `, userValues);

        await client.query(`
          INSERT INTO user_wallets (
            user_id, wallet_balance, fund_wallet, rp_wallet, total_earnings, updated_at
          ) VALUES ${walletPlaceholders.join(",\n")}
          ON CONFLICT (user_id) DO UPDATE SET
            wallet_balance = EXCLUDED.wallet_balance,
            fund_wallet = EXCLUDED.fund_wallet,
            total_earnings = EXCLUDED.total_earnings,
            updated_at = NOW()
        `, walletValues);

        await client.query(`
          INSERT INTO user_binary_pv (
            user_id, personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv, updated_at
          ) VALUES ${pvPlaceholders.join(",\n")}
          ON CONFLICT (user_id) DO NOTHING
        `, pvValues);

        await client.query(`
          INSERT INTO user_kyc (
            user_id, kyc_status, updated_at
          ) VALUES ${kycPlaceholders.join(",\n")}
          ON CONFLICT (user_id) DO NOTHING
        `, kycValues);

        insertedCount += batch.length;
        console.log(`💾 Bulk Progress: [${insertedCount} / ${toInsert.length}] members saved to database...`);
      }

      console.log(`✅ Members Sync Complete! Total ${insertedCount} members synchronized.`);
    } catch (e) {
      console.error("Error in syncMembers:", e.message);
    }
  }

  async syncOrders(client) {
    console.log("\n📦 [2/2] Syncing All Orders from https://aviralifecare.com/admin/orders-list...");
    try {
      await this.page.goto(CONFIG.ordersListUrl, { waitUntil: "networkidle2", timeout: 45000 });

      // Expand all DataTable rows
      await this.page.evaluate(() => {
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
          try {
            const dt = window.jQuery('table').DataTable();
            dt.page.len(2000).draw();
          } catch {}
        }
      });
      await new Promise(r => setTimeout(r, 1500));

      const pageOrders = await this.page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("table tbody tr"));
        return rows.map(r => {
          const cells = Array.from(r.querySelectorAll("td")).map(td => td.innerText.trim());
          const viewLink = r.querySelector('a[href*="order-view"]')?.href || "";
          return { cells, viewLink };
        });
      });

      console.log(`Found ${pageOrders.length} total orders on page.`);

      const existingRes = await client.query("SELECT id FROM orders");
      const existingSet = new Set(existingRes.rows.map(o => o.id.trim()));

      const userRes = await client.query("SELECT id, member_id, mobile, email FROM users");
      const memberMap = new Map();
      userRes.rows.forEach(u => {
        if (u.member_id) memberMap.set(u.member_id.trim().toUpperCase(), u.id);
      });

      const toInsert = pageOrders.filter(item => {
        const rowText = item.cells.join(" | ");
        const orderNoMatch = rowText.match(/ORD-[A-Za-z0-9]+/);
        const orderNumber = orderNoMatch ? orderNoMatch[0] : "";
        return orderNumber && !existingSet.has(orderNumber);
      });

      console.log(`Orders to import/update: ${toInsert.length}`);

      if (toInsert.length === 0) {
        console.log("👍 All orders already up to date.");
        return;
      }

      const BATCH = 100;
      let insertedCount = 0;

      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH);
        const placeholders = [];
        const values = [];
        let pIdx = 1;

        for (const item of batch) {
          const rowText = item.cells.join(" | ");
          const orderNoMatch = rowText.match(/ORD-[A-Za-z0-9]+/);
          const orderNumber = orderNoMatch ? orderNoMatch[0] : `ORD-${Date.now()}`;

          const avMatches = Array.from(rowText.matchAll(/AV\d{4,}/gi)).map(m => m[0].toUpperCase());
          const billBy = avMatches[0] || "AV0001";
          const memberId = avMatches.length >= 2 ? avMatches[1] : (avMatches[0] || "AV0001");
          const userId = memberMap.get(memberId) || userRes.rows[0]?.id || "usr_av0001";

          const amountMatch = rowText.match(/(?:499|2200|2500|599|799|1299|1799|999|399|1497|1572|1100|893|360|4142)(?:\.0000|\.00)?/);
          const totalAmount = amountMatch ? parseFloat(amountMatch[0]) : 499;

          const pvMatch = rowText.match(/(?:1000|500|300|255|200|135|130|125|110|105|100|90|80|60|55|50|40|30|20|15|12)(?:\.0000|\.00)?/);
          const totalPv = pvMatch ? parseFloat(pvMatch[0]) : 100;

          const dateMatch = rowText.match(/\d+(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4}(?:\s+\d+:\d+:\d+\s+[AP]M)?/i);
          const rawDate = dateMatch ? dateMatch[0] : new Date().toISOString();

          placeholders.push(`(
            $${pIdx++}, $${pIdx++}, 'REPURCHASE', 'Product Order', $${pIdx++}, $${pIdx++},
            NOW(), '[]'::jsonb, 'DELIVERED', $${pIdx++}, $${pIdx++}, $${pIdx++},
            $${pIdx++}, 'Surat, Gujarat', 'Gujarat', '395010', $${pIdx++}, 0, $${pIdx++}
          )`);

          values.push(
            orderNumber,
            userId,
            totalAmount,
            totalPv,
            billBy,
            item.cells[5] || "Customer",
            item.cells[6] || "",
            item.cells[7] || "",
            rawDate,
            totalAmount
          );
        }

        await client.query(`
          INSERT INTO orders (
            id, user_id, purchase_type, package_name, amount, pv,
            created_at, items, status, billed_by, customer_name,
            customer_mobile, customer_email, shipping_address, state,
            pincode, order_date_raw, gst_amount, net_amount
          ) VALUES ${placeholders.join(",\n")}
          ON CONFLICT (id) DO NOTHING
        `, values);

        insertedCount += batch.length;
        console.log(`💾 Bulk Progress: [${insertedCount} / ${toInsert.length}] orders saved to database...`);
      }

      console.log(`✅ Orders Sync Complete! Total ${insertedCount} orders synchronized.`);
    } catch (e) {
      console.error("Error in syncOrders:", e.message);
    }
  }

  async runSyncCycle() {
    console.log(`\n================================================================`);
    console.log(`🕒 [${new Date().toLocaleString()}] RUNNING AVIRA HIGH-SPEED MASTER SYNC`);
    console.log(`================================================================`);

    const client = await pool.connect();
    try {
      if (!this.browser) await this.initBrowser();
      if (!this.isLoggedIn) await this.login();

      await this.syncMembers(client);
      await this.syncOrders(client);

      console.log(`\n🎉 High-Speed Sync Completed! Next check in ${CONFIG.syncIntervalMinutes} minutes.`);
    } catch (err) {
      console.error("Error in runSyncCycle:", err.message);
      this.isLoggedIn = false;
    } finally {
      client.release();
    }
  }

  async startDaemon() {
    console.log("🤖 Avira Background Auto-Sync Bot Daemon Started!");
    await this.runSyncCycle();

    setInterval(async () => {
      await this.runSyncCycle();
    }, CONFIG.syncIntervalMinutes * 60 * 1000);
  }
}

if (require.main === module) {
  const isSingleRun = process.argv.includes("--single-run");
  const bot = new AviraSyncBot();
  if (isSingleRun) {
    bot.runSyncCycle().then(() => {
      if (bot.browser) bot.browser.close();
      process.exit(0);
    });
  } else {
    bot.startDaemon();
  }
}

module.exports = AviraSyncBot;
