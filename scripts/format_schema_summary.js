const fs = require("fs");

const fullSchema = JSON.parse(fs.readFileSync("D:\\aviracare\\avira\\scripts\\full_db_schema.json", "utf-8"));

const targetTables = [
  "users",
  "user_kyc",
  "user_wallets",
  "user_binary_pv",
  "orders",
  "transactions",
  "payouts",
  "fund_requests",
  "products"
];

console.log("================================================================================");
console.log("           AVIRA NEW DATABASE SCHEMA - TABLES & EVERY SINGLE COLUMN             ");
console.log("================================================================================");

for (const t of targetTables) {
  if (fullSchema[t]) {
    console.log(`\n📦 TABLE: [ ${t.toUpperCase()} ] (${fullSchema[t].length} Columns)`);
    console.log("--------------------------------------------------------------------------------");
    fullSchema[t].forEach((c, idx) => {
      const nullable = c.is_nullable === "NO" ? "[REQUIRED/NOT NULL]" : "[OPTIONAL/NULLABLE]";
      const typeStr = c.character_maximum_length ? `${c.data_type}(${c.character_maximum_length})` : c.data_type;
      console.log(`  ${(idx + 1).toString().padStart(2, ' ')}. ${c.column_name.padEnd(25, ' ')} : ${typeStr.padEnd(20, ' ')} ${nullable}`);
    });
  }
}
