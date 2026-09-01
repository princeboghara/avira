import { PoolClient } from "pg";
import { pool } from "@/lib/db";

export interface LeadershipSettings {
  level1: number;
  level2: number;
  updatedAt?: string;
}

/**
 * Fetches dynamic Leadership Supporting Bonus percentages from database
 * Level 1 (Direct Sponsor) default: 15%
 * Level 2 (2nd Generation Upline Sponsor) default: 5%
 */
export async function getLeadershipPercentages(existingClient?: PoolClient): Promise<LeadershipSettings> {
  const client = existingClient || (await pool.connect());
  try {
    const res = await client.query(
      `SELECT key, value, updated_at 
       FROM system_settings 
       WHERE key IN ('leadership_level1_percent', 'leadership_level2_percent')`
    );

    let level1 = 15;
    let level2 = 5;
    let updatedAt: string | undefined;

    for (const row of res.rows) {
      if (row.key === "leadership_level1_percent") {
        const val = parseFloat(row.value);
        if (!isNaN(val) && val >= 0) level1 = val;
        if (row.updated_at) updatedAt = new Date(row.updated_at).toISOString();
      } else if (row.key === "leadership_level2_percent") {
        const val = parseFloat(row.value);
        if (!isNaN(val) && val >= 0) level2 = val;
      }
    }

    return { level1, level2, updatedAt };
  } catch (err) {
    console.error("Error fetching leadership percentages:", err);
    return { level1: 15, level2: 5 };
  } finally {
    if (!existingClient) {
      client.release();
    }
  }
}

/**
 * Updates Leadership Supporting Bonus percentages in system_settings
 */
export async function updateLeadershipPercentages(
  level1: number,
  level2: number
): Promise<LeadershipSettings> {
  if (isNaN(level1) || level1 < 0 || level1 > 100) {
    throw new Error("Level 1 percentage must be between 0% and 100%");
  }
  if (isNaN(level2) || level2 < 0 || level2 > 100) {
    throw new Error("Level 2 percentage must be between 0% and 100%");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO system_settings (key, value, description, updated_at)
       VALUES ('leadership_level1_percent', $1, 'Leadership Supporting Bonus Level 1 Percentage', NOW())
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW()`,
      [level1.toString()]
    );

    await client.query(
      `INSERT INTO system_settings (key, value, description, updated_at)
       VALUES ('leadership_level2_percent', $1, 'Leadership Supporting Bonus Level 2 Percentage', NOW())
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW()`,
      [level2.toString()]
    );

    await client.query("COMMIT");

    return {
      level1,
      level2,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
