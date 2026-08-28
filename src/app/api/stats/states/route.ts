import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

// Comprehensive Mapping of State Names, Codes, and Variants
const STATE_MAP: Record<string, { code: string; name: string }> = {
  "andaman and nicobar": { code: "AN", name: "Andaman & Nicobar" },
  "andaman and nicobar islands": { code: "AN", name: "Andaman & Nicobar" },
  "andhra pradesh": { code: "AP", name: "Andhra Pradesh" },
  "arunachal pradesh": { code: "AR", name: "Arunachal Pradesh" },
  "assam": { code: "AS", name: "Assam" },
  "bihar": { code: "BR", name: "Bihar" },
  "chandigarh": { code: "CH", name: "Chandigarh" },
  "chhattisgarh": { code: "CT", name: "Chhattisgarh" },
  "dadra and nagar haveli": { code: "DN", name: "Dadra & Nagar Haveli" },
  "daman and diu": { code: "DD", name: "Daman & Diu" },
  "delhi": { code: "DL", name: "Delhi" },
  "goa": { code: "GA", name: "Goa" },
  "gujarat": { code: "GJ", name: "Gujarat" },
  "haryana": { code: "HR", name: "Haryana" },
  "himachal pradesh": { code: "HP", name: "Himachal Pradesh" },
  "jammu and kashmir": { code: "JK", name: "Jammu and Kashmir" },
  "jammu & kashmir": { code: "JK", name: "Jammu and Kashmir" },
  "jharkhand": { code: "JH", name: "Jharkhand" },
  "karnataka": { code: "KA", name: "Karnataka" },
  "kerala": { code: "KL", name: "Kerala" },
  "ladakh": { code: "LA", name: "Ladakh" },
  "lakshadweep": { code: "LD", name: "Lakshadweep" },
  "madhya pradesh": { code: "MP", name: "Madhya Pradesh" },
  "maharashtra": { code: "MH", name: "Maharashtra" },
  "manipur": { code: "MN", name: "Manipur" },
  "meghalaya": { code: "ML", name: "Meghalaya" },
  "mizoram": { code: "MZ", name: "Mizoram" },
  "nagaland": { code: "NL", name: "Nagaland" },
  "odisha": { code: "OR", name: "Odisha" },
  "orissa": { code: "OR", name: "Odisha" },
  "puducherry": { code: "PY", name: "Puducherry" },
  "pondicherry": { code: "PY", name: "Puducherry" },
  "punjab": { code: "PB", name: "Punjab" },
  "rajasthan": { code: "RJ", name: "Rajasthan" },
  "sikkim": { code: "SK", name: "Sikkim" },
  "tamil nadu": { code: "TN", name: "Tamil Nadu" },
  "telangana": { code: "TG", name: "Telangana" },
  "tripura": { code: "TR", name: "Tripura" },
  "uttar pradesh": { code: "UP", name: "Uttar Pradesh" },
  "uttarakhand": { code: "UT", name: "Uttarakhand" },
  "west bengal": { code: "WB", name: "West Bengal" },
};

export async function GET() {
  const client = await pool.connect();
  try {
    // 1. Group users by state from real users table
    const stateQuery = await client.query(`
      SELECT 
        COALESCE(NULLIF(TRIM(state), ''), 'Gujarat') as raw_state,
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'ACTIVE' OR personal_pv >= 100 THEN 1 END) as active_count,
        COALESCE(SUM(personal_pv), 0) as total_pv
      FROM v_users_full
      GROUP BY raw_state
      ORDER BY total_count DESC;
    `);

    // 2. Query top cities for each state
    const cityQuery = await client.query(`
      SELECT 
        COALESCE(NULLIF(TRIM(state), ''), 'Gujarat') as raw_state,
        COALESCE(NULLIF(TRIM(city), ''), 'Main District') as raw_city,
        COUNT(*) as city_count
      FROM v_users_full
      GROUP BY raw_state, raw_city
      ORDER BY raw_state, city_count DESC;
    `);

    const citiesByState: Record<string, Array<{ city: string; count: number }>> = {};
    for (const crow of cityQuery.rows) {
      const stateName = (crow.raw_state || "Gujarat").trim().toLowerCase();
      if (!citiesByState[stateName]) {
        citiesByState[stateName] = [];
      }
      if (citiesByState[stateName].length < 6) {
        citiesByState[stateName].push({
          city: crow.raw_city,
          count: parseInt(crow.city_count, 10) || 0,
        });
      }
    }

    const aggregated: Record<
      string,
      {
        code: string;
        name: string;
        total: number;
        active: number;
        totalPv: number;
        topCities: Array<{ city: string; count: number }>;
      }
    > = {};

    let grandTotal = 0;
    let grandActive = 0;
    let grandPv = 0;

    for (const row of stateQuery.rows) {
      const raw = (row.raw_state || "Gujarat").trim();
      const lower = raw.toLowerCase();
      const count = parseInt(row.total_count, 10) || 0;
      const active = parseInt(row.active_count, 10) || 0;
      const pv = parseFloat(row.total_pv || "0");

      grandTotal += count;
      grandActive += active;
      grandPv += pv;

      // Find standard mapping
      const standard = STATE_MAP[lower] || {
        code: raw.substring(0, 2).toUpperCase(),
        name: raw.charAt(0).toUpperCase() + raw.slice(1),
      };

      const matchedCities = citiesByState[lower] || [];

      if (!aggregated[standard.code]) {
        aggregated[standard.code] = {
          code: standard.code,
          name: standard.name,
          total: 0,
          active: 0,
          totalPv: 0,
          topCities: matchedCities,
        };
      }

      aggregated[standard.code].total += count;
      aggregated[standard.code].active += active;
      aggregated[standard.code].totalPv += pv;
    }

    const stateList = Object.values(aggregated)
      .map((st) => ({
        code: st.code,
        name: st.name,
        total: st.total,
        active: st.active,
        inactive: st.total - st.active,
        totalPv: Math.round(st.totalPv),
        percentage: grandTotal > 0 ? Number(((st.total / grandTotal) * 100).toFixed(1)) : 0,
        activePercentage: st.total > 0 ? Number(((st.active / st.total) * 100).toFixed(1)) : 0,
        topCities: st.topCities || [],
      }))
      .sort((a, b) => b.total - a.total);

    // Assign Rank
    const rankedStates = stateList.map((st, index) => ({
      ...st,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      states: rankedStates,
      summary: {
        totalMembers: grandTotal,
        activeMembers: grandActive,
        inactiveMembers: grandTotal - grandActive,
        totalPv: Math.round(grandPv),
        totalStatesCount: stateList.length,
        topState: rankedStates[0] || null,
      },
    });
  } catch (error: any) {
    console.error("State stats API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch state distribution statistics" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
