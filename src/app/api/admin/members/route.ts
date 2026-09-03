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
        v.id, v.member_id, v.full_name, v.mobile, v.email, v.sponsor_id, v.sponsor_name,
        v.pincode, v.city, v.state, v.address, v.gst_number, v.role, v.status, v.wallet_balance, v.total_earnings,
        v.personal_pv, v.left_pv, v.right_pv, v.carry_left_pv, v.carry_right_pv, v.joined_date,
        v.pan_number, v.aadhaar_name, v.aadhaar_number, v.bank_name, v.bank_account_number, v.ifsc_code, v.upi_id,
        v.nominee_name, v.nominee_relation, v.kyc_document_url, v.kyc_status, v.kyc_submitted_at, v.kyc_verified_at,
        v.created_at,
        COALESCE(pu.member_id, ub.binary_parent_id, '') as parent_id
      FROM v_users_full v
      LEFT JOIN user_binary_pv ub ON ub.user_id = v.id
      LEFT JOIN users pu ON pu.id = ub.binary_parent_id
    `;

    const params: any[] = [];
    if (search.trim()) {
      query += `
        WHERE (v.role IS NULL OR v.role != 'ADMIN')
          AND (
            v.member_id ILIKE $1 
            OR v.full_name ILIKE $1 
            OR v.mobile ILIKE $1 
            OR v.city ILIKE $1 
            OR v.sponsor_id ILIKE $1
          )
      `;
      params.push(`%${search.trim()}%`);
    } else {
      query += ` WHERE (v.role IS NULL OR v.role != 'ADMIN') `;
    }

    const limitParam = searchParams.get("limit");
    if (limitParam && !isNaN(Number(limitParam))) {
      params.push(Number(limitParam));
      query += ` ORDER BY v.created_at DESC LIMIT $${params.length};`;
    } else {
      query += ` ORDER BY v.created_at DESC;`;
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
      parentId: row.parent_id || "",
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

    const targetIdentifier = String(memberId || id || "").trim();
    if (!targetIdentifier) {
      return NextResponse.json(
        { success: false, message: "Member ID or ID is required" },
        { status: 400 }
      );
    }

    // 1. Find user by ID or member_id
    const userRes = await client.query(
      "SELECT id, member_id FROM users WHERE (UPPER(member_id) = UPPER($1) OR id = $1) AND role != 'ADMIN' LIMIT 1",
      [targetIdentifier]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Member "${targetIdentifier}" not found in system` },
        { status: 404 }
      );
    }

    const userId = userRes.rows[0].id;

    let passwordHash: string | null = null;
    if (password && typeof password === "string" && password.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    await client.query("BEGIN");

    // 2. Update users core profile
    await client.query(
      `
      UPDATE users SET
        full_name = COALESCE($1, full_name),
        mobile = COALESCE($2, mobile),
        email = COALESCE($3, email),
        sponsor_id = COALESCE($4, sponsor_id),
        pincode = COALESCE($5, pincode),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        address = COALESCE($8, address),
        status = COALESCE($9, status),
        password_hash = COALESCE($10, password_hash),
        updated_at = NOW()
      WHERE id = $11;
    `,
      [
        fullName !== undefined ? fullName?.trim() : null,
        mobile !== undefined ? mobile?.trim() : null,
        email !== undefined ? (email ? email.trim().toLowerCase() : null) : null,
        sponsorId !== undefined ? (sponsorId ? sponsorId.trim().toUpperCase() : null) : null,
        pincode !== undefined ? pincode?.trim() : null,
        city !== undefined ? city?.trim() : null,
        state !== undefined ? state?.trim() : null,
        address !== undefined ? address?.trim() : null,
        status !== undefined ? status : null,
        passwordHash,
        userId,
      ]
    );

    // 3. Update user_kyc table for banking, KYC, nominee, and GST
    await client.query(
      `
      INSERT INTO user_kyc (
        user_id, gst_number, aadhaar_name, aadhaar_number, pan_number,
        bank_name, bank_account_number, ifsc_code, upi_id,
        nominee_name, nominee_relation, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        gst_number = COALESCE($2, user_kyc.gst_number),
        aadhaar_name = COALESCE($3, user_kyc.aadhaar_name),
        aadhaar_number = COALESCE($4, user_kyc.aadhaar_number),
        pan_number = COALESCE($5, user_kyc.pan_number),
        bank_name = COALESCE($6, user_kyc.bank_name),
        bank_account_number = COALESCE($7, user_kyc.bank_account_number),
        ifsc_code = COALESCE($8, user_kyc.ifsc_code),
        upi_id = COALESCE($9, user_kyc.upi_id),
        nominee_name = COALESCE($10, user_kyc.nominee_name),
        nominee_relation = COALESCE($11, user_kyc.nominee_relation),
        updated_at = NOW();
    `,
      [
        userId,
        gstNumber !== undefined ? (gstNumber ? gstNumber.trim().toUpperCase() : null) : null,
        aadhaarName !== undefined ? (aadhaarName ? aadhaarName.trim() : null) : null,
        aadhaarNumber !== undefined ? (aadhaarNumber ? aadhaarNumber.trim() : null) : null,
        panNumber !== undefined ? (panNumber ? panNumber.trim().toUpperCase() : null) : null,
        bankName !== undefined ? (bankName ? bankName.trim() : null) : null,
        bankAccountNumber !== undefined ? (bankAccountNumber ? bankAccountNumber.trim() : null) : null,
        ifscCode !== undefined ? (ifscCode ? ifscCode.trim().toUpperCase() : null) : null,
        upiId !== undefined ? (upiId ? upiId.trim() : null) : null,
        nomineeName !== undefined ? (nomineeName ? nomineeName.trim() : null) : null,
        nomineeRelation !== undefined ? (nomineeRelation ? nomineeRelation.trim() : null) : null,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Associate member profile updated successfully!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update member error in PATCH:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update member profile" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
