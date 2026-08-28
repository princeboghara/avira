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

async function run() {
  const client = await pool.connect();
  try {
    console.log("1. Deleting all old products from database...");
    await client.query("BEGIN");
    
    await client.query("DELETE FROM products;");
    console.log("Old products cleared successfully.");

    console.log("2. Loading new 44 exact products catalogue...");
    const jsonPath = "D:\\aviracare\\avira\\scripts\\exact_user_products.json";
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const products = JSON.parse(raw);

    console.log(`Inserting ${products.length} products with category and HSN code into Supabase...`);

    for (const p of products) {
      await client.query(`
        INSERT INTO products (
          id, name, slug, net_quantity, mrp, dp, discount_price, pv,
          category, category_name, hsn_code, image_url, description,
          stock, stock_quantity, in_stock, is_active, tag, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, NOW()
        )
      `, [
        p.id,
        p.name,
        p.slug,
        p.net_quantity,
        p.mrp,
        p.dp,
        p.discount_price,
        p.pv,
        p.category,
        p.category_name,
        p.hsn_code,
        p.image_url,
        p.description,
        p.stock,
        p.stock_quantity,
        p.in_stock,
        p.is_active,
        p.tag
      ]);
    }

    await client.query("COMMIT");
    console.log(`✅ All ${products.length} new products successfully added!\n`);

    // Verification by category
    const catRes = await client.query(`
      SELECT category, COUNT(*) as product_count, MIN(mrp) as min_price, MAX(mrp) as max_price, MIN(pv) as min_pv, MAX(pv) as max_pv
      FROM products
      GROUP BY category
      ORDER BY product_count DESC
    `);
    console.log("=== Category-Wise Products Summary ===");
    console.table(catRes.rows);

    // Full List Verification
    const allProds = await client.query(`
      SELECT id, name, category, hsn_code, mrp, pv, tag
      FROM products
      ORDER BY pv DESC, name ASC
    `);
    console.log("\n=== Complete Active Products in Catalog ===");
    console.table(allProds.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error replacing products:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
