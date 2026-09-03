import { NextRequest, NextResponse } from "next/server";
import { getSession, getAdminSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

// Comprehensive Mapping of 28 States & 8 Union Territories with all aliases and variants
const STATE_MAP: Record<string, { code: string; name: string }> = {
  // 28 States of India
  "andhra pradesh": { code: "AP", name: "Andhra Pradesh" },
  "arunachal pradesh": { code: "AR", name: "Arunachal Pradesh" },
  "assam": { code: "AS", name: "Assam" },
  "bihar": { code: "BR", name: "Bihar" },
  "chhattisgarh": { code: "CT", name: "Chhattisgarh" },
  "goa": { code: "GA", name: "Goa" },
  "gujarat": { code: "GJ", name: "Gujarat" },
  "haryana": { code: "HR", name: "Haryana" },
  "himachal pradesh": { code: "HP", name: "Himachal Pradesh" },
  "jharkhand": { code: "JH", name: "Jharkhand" },
  "karnataka": { code: "KA", name: "Karnataka" },
  "kerala": { code: "KL", name: "Kerala" },
  "madhya pradesh": { code: "MP", name: "Madhya Pradesh" },
  "maharashtra": { code: "MH", name: "Maharashtra" },
  "manipur": { code: "MN", name: "Manipur" },
  "meghalaya": { code: "ML", name: "Meghalaya" },
  "mizoram": { code: "MZ", name: "Mizoram" },
  "nagaland": { code: "NL", name: "Nagaland" },
  "odisha": { code: "OR", name: "Odisha" },
  "orissa": { code: "OR", name: "Odisha" },
  "punjab": { code: "PB", name: "Punjab" },
  "rajasthan": { code: "RJ", name: "Rajasthan" },
  "sikkim": { code: "SK", name: "Sikkim" },
  "tamil nadu": { code: "TN", name: "Tamil Nadu" },
  "telangana": { code: "TG", name: "Telangana" },
  "tripura": { code: "TR", name: "Tripura" },
  "uttar pradesh": { code: "UP", name: "Uttar Pradesh" },
  "uttarakhand": { code: "UT", name: "Uttarakhand" },
  "uttaranchal": { code: "UT", name: "Uttarakhand" },
  "west bengal": { code: "WB", name: "West Bengal" },

  // 8 Union Territories of India
  "andaman and nicobar": { code: "AN", name: "Andaman and Nicobar Islands" },
  "andaman and nicobar islands": { code: "AN", name: "Andaman and Nicobar Islands" },
  "andaman & nicobar": { code: "AN", name: "Andaman and Nicobar Islands" },
  "andaman & nicobar islands": { code: "AN", name: "Andaman and Nicobar Islands" },
  "chandigarh": { code: "CH", name: "Chandigarh" },
  "dadra and nagar haveli and daman and diu": { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  "dadra & nagar haveli and daman & diu": { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  "dadra and nagar haveli": { code: "DN", name: "Dadra and Nagar Haveli" },
  "dadra & nagar haveli": { code: "DN", name: "Dadra and Nagar Haveli" },
  "daman and diu": { code: "DD", name: "Daman and Diu" },
  "daman & diu": { code: "DD", name: "Daman and Diu" },
  "delhi": { code: "DL", name: "Delhi" },
  "delhi (national capital territory)": { code: "DL", name: "Delhi" },
  "national capital territory of delhi": { code: "DL", name: "Delhi" },
  "nct of delhi": { code: "DL", name: "Delhi" },
  "nct delhi": { code: "DL", name: "Delhi" },
  "new delhi": { code: "DL", name: "Delhi" },
  "jammu and kashmir": { code: "JK", name: "Jammu and Kashmir" },
  "jammu & kashmir": { code: "JK", name: "Jammu and Kashmir" },
  "ladakh": { code: "LA", name: "Ladakh" },
  "leh ladakh": { code: "LA", name: "Ladakh" },
  "lakshadweep": { code: "LD", name: "Lakshadweep" },
  "puducherry": { code: "PY", name: "Puducherry" },
  "pondicherry": { code: "PY", name: "Puducherry" },
};

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const scopeParam = req.nextUrl.searchParams.get("scope");
    const adminSession = await getAdminSession(req);
    const memberSession = await getSession(req);

    // Determine if admin request (Master Map)
    const isAdmin =
      scopeParam === "admin" ||
      adminSession !== null ||
      memberSession?.role === "ADMIN";

    let stateRows: any[] = [];
    let cityRows: any[] = [];
    let isMemberScope = false;
    let targetMemberId: string | null = null;

    if (isAdmin) {
      // 1. ADMIN SCOPE: All users across India with real states
      const stateQuery = await client.query(`
        SELECT 
          TRIM(u.state) as raw_state,
          COUNT(*) as total_count,
          COUNT(CASE WHEN u.status = 'ACTIVE' OR b.personal_pv >= 100 THEN 1 END) as active_count,
          COALESCE(SUM(b.personal_pv), 0) as total_pv
        FROM users u
        LEFT JOIN user_binary_pv b ON u.id = b.user_id
        WHERE u.state IS NOT NULL AND TRIM(u.state) != ''
        GROUP BY raw_state
        ORDER BY total_count DESC;
      `);
      stateRows = stateQuery.rows;

      const cityQuery = await client.query(`
        SELECT 
          TRIM(u.state) as raw_state,
          TRIM(u.city) as raw_city,
          COUNT(*) as city_count
        FROM users u
        WHERE u.state IS NOT NULL AND TRIM(u.state) != '' AND u.city IS NOT NULL AND TRIM(u.city) != ''
        GROUP BY raw_state, raw_city
        ORDER BY raw_state, city_count DESC;
      `);
      cityRows = cityQuery.rows;
    } else {
      // 2. MEMBER SCOPE: Only this logged-in member's downline tree
      isMemberScope = true;
      if (!memberSession || !memberSession.memberId) {
        return NextResponse.json({
          success: true,
          scope: "member",
          states: [],
          summary: {
            totalMembers: 0,
            activeMembers: 0,
            inactiveMembers: 0,
            totalPv: 0,
            totalStatesCount: 0,
            topState: null,
          },
        });
      }

      targetMemberId = req.nextUrl.searchParams.get("memberId") || memberSession.memberId;

      // Find root user ID
      const rootRes = await client.query(
        `SELECT id, member_id FROM users WHERE UPPER(member_id) = UPPER($1) OR id = $1 LIMIT 1`,
        [targetMemberId]
      );

      if (rootRes.rows.length === 0) {
        return NextResponse.json({
          success: true,
          scope: "member",
          states: [],
          summary: {
            totalMembers: 0,
            activeMembers: 0,
            inactiveMembers: 0,
            totalPv: 0,
            totalStatesCount: 0,
            topState: null,
          },
        });
      }

      const rootId = rootRes.rows[0].id;
      const rootMemberId = rootRes.rows[0].member_id;

      // Recursive CTE to fetch ONLY this user's downline subtree
      const stateQuery = await client.query(
        `
        WITH RECURSIVE downline AS (
          SELECT user_id
          FROM user_binary_pv
          WHERE binary_parent_id = $1 OR binary_parent_id = $2

          UNION ALL

          SELECT b.user_id
          FROM user_binary_pv b
          INNER JOIN downline d ON b.binary_parent_id = d.user_id
        )
        SELECT 
          TRIM(u.state) as raw_state,
          COUNT(*) as total_count,
          COUNT(CASE WHEN u.status = 'ACTIVE' OR b.personal_pv >= 100 THEN 1 END) as active_count,
          COALESCE(SUM(b.personal_pv), 0) as total_pv
        FROM downline d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN user_binary_pv b ON d.user_id = b.user_id
        WHERE u.state IS NOT NULL AND TRIM(u.state) != ''
        GROUP BY raw_state
        ORDER BY total_count DESC;
      `,
        [rootId, rootMemberId]
      );
      stateRows = stateQuery.rows;

      const cityQuery = await client.query(
        `
        WITH RECURSIVE downline AS (
          SELECT user_id
          FROM user_binary_pv
          WHERE binary_parent_id = $1 OR binary_parent_id = $2

          UNION ALL

          SELECT b.user_id
          FROM user_binary_pv b
          INNER JOIN downline d ON b.binary_parent_id = d.user_id
        )
        SELECT 
          TRIM(u.state) as raw_state,
          TRIM(u.city) as raw_city,
          COUNT(*) as city_count
        FROM downline d
        JOIN users u ON d.user_id = u.id
        WHERE u.state IS NOT NULL AND TRIM(u.state) != '' AND u.city IS NOT NULL AND TRIM(u.city) != ''
        GROUP BY raw_state, raw_city
        ORDER BY raw_state, city_count DESC;
      `,
        [rootId, rootMemberId]
      );
      cityRows = cityQuery.rows;
    }

    // Process cities by state
    const citiesByState: Record<string, Array<{ city: string; count: number }>> = {};
    for (const crow of cityRows) {
      const stateName = (crow.raw_state || "").trim().toLowerCase();
      if (!stateName) continue;
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

    for (const row of stateRows) {
      const raw = (row.raw_state || "").trim();
      if (!raw) continue;
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
      scope: isMemberScope ? "member" : "admin",
      memberId: targetMemberId,
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
