import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
        pincode, city, state, address, gst_number, role, status, wallet_balance, total_earnings,
        personal_pv, left_pv, right_pv, carry_left_pv, carry_right_pv, joined_date,
        pan_number, aadhaar_name, aadhaar_number, bank_name, bank_account_number, ifsc_code, upi_id,
        nominee_name, nominee_relation, kyc_document_url, kyc_status, kyc_submitted_at, kyc_verified_at,
        created_at
      FROM v_users_full
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

    const limitParam = searchParams.get("limit");
    if (limitParam && !isNaN(Number(limitParam))) {
      params.push(Number(limitParam));
      query += ` ORDER BY created_at DESC LIMIT $${params.length};`;
    } else {
      query += ` ORDER BY created_at DESC;`;
    }

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
      address: row.address || "",
      gstNumber: row.gst_number || "",
      role: row.role,
      status: row.status,
      walletBalance: parseFloat(row.wallet_balance || "0"),
      totalEarnings: parseFloat(row.total_earnings || "0"),
      personalPv: parseFloat(row.personal_pv || "0"),
      leftPv: parseFloat(row.left_pv || "0"),
      rightPv: parseFloat(row.right_pv || "0"),
      carryLeftPv: parseFloat(row.carry_left_pv || "0"),
      carryRightPv: parseFloat(row.carry_right_pv || "0"),
      joinedDate: row.joined_date || row.created_at,
      panNumber: row.pan_number || "",
      aadhaarName: row.aadhaar_name || "",
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

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const {
      memberId,
      id,
      sponsorId,
      fullName,
      mobile,
      email,
      password,
      pincode,
      city,
      state,
      address,
      gstNumber,
      aadhaarName,
      aadhaarNumber,
      panNumber,
      bankName,
      bankAccountNumber,
      ifscCode,
      upiId,
      status,
      nomineeName,
      nomineeRelation,
    } = body;

    const targetIdentifier = memberId || id;
    if (!targetIdentifier) {
      return NextResponse.json(
        { success: false, message: "Member ID or ID is required" },
        { status: 400 }
      );
    }

    // Optional: hash new password if provided
    let passwordHashUpdate = "";
    const queryParams: any[] = [
      fullName,
      mobile,
      email,
      sponsorId,
      pincode,
      city,
      state,
      address,
      gstNumber,
      aadhaarName,
      aadhaarNumber,
      panNumber,
      bankName,
      bankAccountNumber,
      ifscCode,
      upiId,
      status,
      nomineeName,
      nomineeRelation,
      targetIdentifier,
    ];

    let query = `
      UPDATE users SET
        full_name = COALESCE($1, full_name),
        mobile = COALESCE($2, mobile),
        email = COALESCE($3, email),
        sponsor_id = COALESCE($4, sponsor_id),
        pincode = COALESCE($5, pincode),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        address = COALESCE($8, address),
        gst_number = COALESCE($9, gst_number),
        aadhaar_name = COALESCE($10, aadhaar_name),
        aadhaar_number = COALESCE($11, aadhaar_number),
        pan_number = COALESCE($12, pan_number),
        bank_name = COALESCE($13, bank_name),
        bank_account_number = COALESCE($14, bank_account_number),
        ifsc_code = COALESCE($15, ifsc_code),
        upi_id = COALESCE($16, upi_id),
        status = COALESCE($17, status),
        nominee_name = COALESCE($18, nominee_name),
        nominee_relation = COALESCE($19, nominee_relation),
        updated_at = NOW()
    `;

    if (password && String(password).trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(String(password).trim(), salt);
      queryParams.push(hash);
      query += `, password_hash = $${queryParams.length}`;
    }

    query += ` WHERE member_id = $20 OR id::text = $20;`;

    await client.query(query, queryParams);

    return NextResponse.json({
      success: true,
      message: "Associate member profile updated successfully!",
    });
  } catch (error) {
    console.error("Update member error in PATCH:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update member profile" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
