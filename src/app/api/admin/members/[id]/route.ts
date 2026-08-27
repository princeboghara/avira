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
      `SELECT * FROM users WHERE id = $1 OR UPPER(member_id) = UPPER($1) LIMIT 1`,
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

    let passwordHash: string | null = null;
    if (password && typeof password === "string" && password.trim().length >= 4) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

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
        gst_number = COALESCE($10, gst_number),
        aadhaar_name = COALESCE($11, aadhaar_name),
        aadhaar_number = COALESCE($12, aadhaar_number),
        pan_number = COALESCE($13, pan_number),
        bank_name = COALESCE($14, bank_name),
        bank_account_number = COALESCE($15, bank_account_number),
        ifsc_code = COALESCE($16, ifsc_code),
        upi_id = COALESCE($17, upi_id),
        status = COALESCE($18, status),
        nominee_name = COALESCE($19, nominee_name),
        nominee_relation = COALESCE($20, nominee_relation),
        updated_at = NOW()
      WHERE id = $21 OR UPPER(member_id) = UPPER($21);
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
        gstNumber !== undefined ? gstNumber.trim().toUpperCase() : null,
        aadhaarName !== undefined ? aadhaarName.trim() : null,
        aadhaarNumber !== undefined ? aadhaarNumber.trim() : null,
        panNumber !== undefined ? panNumber.trim().toUpperCase() : null,
        bankName !== undefined ? bankName.trim() : null,
        bankAccountNumber !== undefined ? bankAccountNumber.trim() : null,
        ifscCode !== undefined ? ifscCode.trim().toUpperCase() : null,
        upiId !== undefined ? upiId.trim() : null,
        status !== undefined ? status : null,
        nomineeName !== undefined ? nomineeName.trim() : null,
        nomineeRelation !== undefined ? nomineeRelation.trim() : null,
        id.trim(),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Member details updated successfully!",
    });
  } catch (error) {
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
