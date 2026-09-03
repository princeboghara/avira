const { Pool } = require('pg');
const connectionString = "postgresql://postgres.jtwpsnezyppfpqcpbnkj:C%2BZS7%4023hUidBfH@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
const p = new Pool({ connectionString });

async function main() {
  const r = await p.query("SELECT * FROM system_settings");
  console.log(r.rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
