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

async function importProducts() {
  const client = await pool.connect();
  try {
    console.log("1. Reading products catalogue JSON...");
    const jsonPath = "D:\\aviracare\\avira\\scripts\\products_catalogue.json";
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const products = JSON.parse(raw);

    console.log(`Parsed ${products.length} products to import/upsert into Supabase...`);

    await client.query("BEGIN");

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
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          net_quantity = EXCLUDED.net_quantity,
          mrp = EXCLUDED.mrp,
          dp = EXCLUDED.dp,
          discount_price = EXCLUDED.discount_price,
          pv = EXCLUDED.pv,
          category = EXCLUDED.category,
          category_name = EXCLUDED.category_name,
          hsn_code = EXCLUDED.hsn_code,
          image_url = EXCLUDED.image_url,
          description = EXCLUDED.description,
          stock = EXCLUDED.stock,
          stock_quantity = EXCLUDED.stock_quantity,
          in_stock = EXCLUDED.in_stock,
          is_active = EXCLUDED.is_active,
          tag = EXCLUDED.tag
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
    console.log(`✅ All ${products.length} products successfully saved to Database!`);

    // Verification
    const res = await client.query(`
      SELECT category, COUNT(*) as product_count, MIN(mrp) as min_mrp, MAX(mrp) as max_mrp, MIN(pv) as min_pv, MAX(pv) as max_pv
      FROM products
      GROUP BY category
      ORDER BY product_count DESC
    `);
    console.log("\n=== Products by Category Breakdown ===");
    console.table(res.rows);

    const sample = await client.query(`
      SELECT id, name, category, hsn_code, net_quantity, mrp, pv, tag
      FROM products
      ORDER BY pv DESC
      LIMIT 10
    `);
    console.log("\n=== Top High-PV Products ===");
    console.table(sample.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error importing products:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

importProducts();
