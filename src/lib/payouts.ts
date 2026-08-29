import { pool } from "@/lib/db";

export interface WeekPeriod {
  identifier: string; // e.g. "2026-W35"
  startDate: string;  // "YYYY-MM-DD"
  endDate: string;    // "YYYY-MM-DD"
  label: string;      // "25 Aug 2026 - 31 Aug 2026"
  isCurrent: boolean;
}

/**
 * Returns the list of 16 weekly periods (Monday to Sunday cycles)
 */
export function getWeeklyPeriods(count: number = 16): WeekPeriod[] {
  const periods: WeekPeriod[] = [];
  const now = new Date();

  // Find Monday of the current week
  const day = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  for (let i = 0; i < count; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - i * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startYear = monday.getFullYear();
    const startMonth = String(monday.getMonth() + 1).padStart(2, "0");
    const startDay = String(monday.getDate()).padStart(2, "0");

    const endYear = sunday.getFullYear();
    const endMonth = String(sunday.getMonth() + 1).padStart(2, "0");
    const endDay = String(sunday.getDate()).padStart(2, "0");

    const startDateStr = `${startYear}-${startMonth}-${startDay}`;
    const endDateStr = `${endYear}-${endMonth}-${endDay}`;

    // Compute ISO Week number
    const tempDate = new Date(monday.getTime());
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const firstThursday = tempDate.getTime();
    tempDate.setMonth(0, 1);
    if (tempDate.getDay() !== 4) {
      tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - tempDate.getTime()) / 604800000);
    const identifier = `${startYear}-W${String(weekNumber).padStart(2, "0")}`;

    const label = `${monday.getDate()} ${monthNames[monday.getMonth()]} ${startYear} - ${sunday.getDate()} ${monthNames[sunday.getMonth()]} ${endYear}`;

    periods.push({
      identifier,
      startDate: startDateStr,
      endDate: endDateStr,
      label,
      isCurrent: i === 0,
    });
  }

  return periods;
}

/**
 * Ensures payout records exist for a week and returns all payouts for that week
 */
export async function syncAndGetWeeklyPayouts(week: WeekPeriod) {
  const client = await pool.connect();
  try {
    // 1. Find all members with earnings within this week's start and end date
    const earningsRes = await client.query(
      `
      SELECT 
        t.user_id,
        u.member_id,
        u.full_name,
        u.mobile,
        u.bank_name,
        u.bank_account_number,
        u.ifsc_code,
        u.upi_id,
        u.kyc_status,
        COALESCE(SUM(t.amount), 0) as gross_amount
      FROM transactions t
      JOIN v_users_full u ON u.id = t.user_id
      WHERE (t.type IN ('BINARY_MATCHING', 'LEADERSHIP_BONUS', 'ROYALTY_INCOME') OR t.description ILIKE '%binary%' OR t.description ILIKE '%leadership%' OR t.description ILIKE '%royalty%')
        AND t.created_at >= $1::timestamp
        AND t.created_at <= ($2 || ' 23:59:59')::timestamp
      GROUP BY 
        t.user_id, u.member_id, u.full_name, u.mobile,
        u.bank_name, u.bank_account_number, u.ifsc_code, u.upi_id, u.kyc_status
      HAVING SUM(t.amount) > 0
    `,
      [week.startDate, week.endDate]
    );

    // 2. Insert or sync with existing payout records
    for (const row of earningsRes.rows) {
      const gross = parseFloat(row.gross_amount || "0");
      const tds = Math.round(gross * 0.02 * 100) / 100; // 2% TDS
      const adminCharge = Math.round(gross * 0.08 * 100) / 100; // 8% Admin Charge
      const rpWallet = Math.round(gross * 0.05 * 100) / 100; // 5% RP Wallet
      const net = Math.round((gross - tds - adminCharge - rpWallet) * 100) / 100; // 85% Net

      const payoutId = `payout_${week.identifier}_${row.member_id}`;

      // Insert if not exists, otherwise update bank/KYC info if still PENDING
      await client.query(
        `
        INSERT INTO payouts (
          id,
          week_identifier,
          week_start_date,
          week_end_date,
          week_label,
          user_id,
          member_id,
          full_name,
          mobile,
          gross_amount,
          tds_amount,
          admin_charge,
          rp_wallet_deduction,
          net_amount,
          bank_name,
          bank_account_number,
          ifsc_code,
          upi_id,
          kyc_status,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'PENDING')
        ON CONFLICT (id) DO UPDATE SET
          gross_amount = CASE WHEN payouts.status = 'PENDING' THEN EXCLUDED.gross_amount ELSE payouts.gross_amount END,
          tds_amount = CASE WHEN payouts.status = 'PENDING' THEN EXCLUDED.tds_amount ELSE payouts.tds_amount END,
          admin_charge = CASE WHEN payouts.status = 'PENDING' THEN EXCLUDED.admin_charge ELSE payouts.admin_charge END,
          rp_wallet_deduction = CASE WHEN payouts.status = 'PENDING' THEN EXCLUDED.rp_wallet_deduction ELSE payouts.rp_wallet_deduction END,
          net_amount = CASE WHEN payouts.status = 'PENDING' THEN EXCLUDED.net_amount ELSE payouts.net_amount END,
          bank_name = EXCLUDED.bank_name,
          bank_account_number = EXCLUDED.bank_account_number,
          ifsc_code = EXCLUDED.ifsc_code,
          upi_id = EXCLUDED.upi_id,
          kyc_status = EXCLUDED.kyc_status,
          updated_at = NOW();
      `,
        [
          payoutId,
          week.identifier,
          week.startDate,
          week.endDate,
          week.label,
          row.user_id,
          row.member_id,
          row.full_name,
          row.mobile,
          gross,
          tds,
          adminCharge,
          rpWallet,
          net,
          row.bank_name || "",
          row.bank_account_number || "",
          row.ifsc_code || "",
          row.upi_id || "",
          row.kyc_status || "NOT_SUBMITTED",
        ]
      );
    }

    // 3. Query all payouts for this week
    const res = await client.query(
      `
      SELECT 
        p.*,
        u.avatar_url
      FROM payouts p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.week_identifier = $1
      ORDER BY p.status ASC, p.gross_amount DESC
    `,
      [week.identifier]
    );

    return res.rows.map((r, idx) => ({
      id: r.id,
      srNo: idx + 1,
      weekIdentifier: r.week_identifier,
      weekStartDate: r.week_start_date,
      weekEndDate: r.week_end_date,
      weekLabel: r.week_label,
      userId: r.user_id,
      memberId: r.member_id,
      fullName: r.full_name,
      mobile: r.mobile,
      grossAmount: parseFloat(r.gross_amount || "0"),
      tdsAmount: parseFloat(r.tds_amount || "0"),
      adminCharge: parseFloat(r.admin_charge || "0"),
      rpWalletDeduction: parseFloat(r.rp_wallet_deduction || "0"),
      netAmount: parseFloat(r.net_amount || "0"),
      bankName: r.bank_name || "",
      bankAccountNumber: r.bank_account_number || "",
      ifscCode: r.ifsc_code || "",
      upiId: r.upi_id || "",
      kycStatus: r.kyc_status || "NOT_SUBMITTED",
      status: r.status || "PENDING",
      paidAt: r.paid_at,
      transactionReference: r.transaction_reference || "",
      notes: r.notes || "",
    }));
  } finally {
    client.release();
  }
}
