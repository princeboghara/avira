import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let query = `
      SELECT 
        id, member_id, full_name, mobile, email, sponsor_id, sponsor_name,
        pincode, city, state, role, status, wallet_balance, total_earnings,
        personal_pv, left_pv, right_pv, joined_date,
        pan_number, aadhaar_number, bank_name, bank_account_number, ifsc_code, upi_id,
        nominee_name, nominee_relation, kyc_document_url, kyc_status, kyc_submitted_at, kyc_verified_at,
        created_at
      FROM users
    `;

    const params: any[] = [];
    if (search.trim()) {
      query += `
        WHERE member_id ILIKE $1 
           OR full_name ILIKE $1 
           OR mobile ILIKE $1 
           OR city ILIKE $1 
           OR sponsor_id ILIKE $1
      `;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 300;`;

    const res = await client.query(query, params);

    const members = res.rows.map((row) => ({
      id: row.id,
      memberId: row.member_id,
      fullName: row.full_name,
      mobile: row.mobile,
      email: row.email || "",
      sponsorId: row.sponsor_id,
      sponsorName: row.sponsor_name,
      pincode: row.pincode,
      city: row.city,
      state: row.state,
      role: row.role,
      status: row.status,
      walletBalance: parseFloat(row.wallet_balance || "0"),
      totalEarnings: parseFloat(row.total_earnings || "0"),
      personalPv: parseFloat(row.personal_pv || "0"),
      leftPv: parseFloat(row.left_pv || "0"),
      rightPv: parseFloat(row.right_pv || "0"),
      joinedDate: row.joined_date,
      panNumber: row.pan_number || "",
      aadhaarNumber: row.aadhaar_number || "",
      bankName: row.bank_name || "",
      bankAccountNumber: row.bank_account_number || "",
      ifscCode: row.ifsc_code || "",
      upiId: row.upi_id || "",
      nomineeName: row.nominee_name || "",
      nomineeRelation: row.nominee_relation || "",
      kycDocumentUrl: row.kyc_document_url || "",
      kycStatus: row.kyc_status || "NOT_SUBMITTED",
      kycSubmittedAt: row.kyc_submitted_at ? new Date(row.kyc_submitted_at).toISOString() : undefined,
      kycVerifiedAt: row.kyc_verified_at ? new Date(row.kyc_verified_at).toISOString() : undefined,
    }));

    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error("Fetch members error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch members" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
