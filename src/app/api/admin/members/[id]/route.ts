import { NextRequest, NextResponse } from "next/server";
import { pool, mapRowToUser } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();

  try {
    const res = await client.query(
      `SELECT * FROM v_users_full WHERE (id = $1 OR UPPER(member_id) = UPPER($1)) AND role != 'ADMIN' LIMIT 1`,
      [id.trim()]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Member "${id}" not found in system` },
        { status: 404 }
      );
    }

    const member = mapRowToUser(res.rows[0]);

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("Get single member error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch member details" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();

  try {
    const body = await req.json();
    const {
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

    // Get user id and current details
    const uRes = await client.query(
      "SELECT id FROM users WHERE (id = $1 OR UPPER(member_id) = UPPER($1)) AND role != 'ADMIN' LIMIT 1",
      [id.trim()]
    );

    if (uRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Member "${id}" not found in system` },
        { status: 404 }
      );
    }
    const userId = uRes.rows[0].id;

    let passwordHash: string | null = null;
    if (password && typeof password === "string" && password.trim().length >= 4) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await client.query("BEGIN");

    // 1. Update users core profile
    await client.query(
      `
      UPDATE users SET
        sponsor_id = COALESCE($1, sponsor_id),
        full_name = COALESCE($2, full_name),
        mobile = COALESCE($3, mobile),
        email = COALESCE($4, email),
        password_hash = COALESCE($5, password_hash),
        pincode = COALESCE($6, pincode),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        address = COALESCE($9, address),
        status = COALESCE($10, status),
        updated_at = NOW()
      WHERE id = $11;
    `,
      [
        sponsorId !== undefined ? (sponsorId ? sponsorId.trim().toUpperCase() : null) : null,
        fullName !== undefined ? fullName.trim() : null,
        mobile !== undefined ? mobile.trim() : null,
        email !== undefined ? (email ? email.trim().toLowerCase() : null) : null,
        passwordHash,
        pincode !== undefined ? pincode.trim() : null,
        city !== undefined ? city.trim() : null,
        state !== undefined ? state.trim() : null,
        address !== undefined ? address.trim() : null,
        status !== undefined ? status : null,
        userId,
      ]
    );

    // 2. Update user_kyc table
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
      message: "Member details updated successfully!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update member error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update member" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export const PATCH = POST;
