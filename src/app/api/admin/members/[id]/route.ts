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
      `
      SELECT 
        v.*, 
        u.avatar_url, 
        u.plain_password, 
        COALESCE(pu.member_id, ub.binary_parent_id, '') as parent_id
      FROM v_users_full v
      LEFT JOIN users u ON u.id = v.id
      LEFT JOIN user_binary_pv ub ON ub.user_id = v.id
      LEFT JOIN users pu ON pu.id = ub.binary_parent_id
      WHERE (v.id = $1 OR UPPER(v.member_id) = UPPER($1)) AND (v.role IS NULL OR v.role != 'ADMIN') 
      LIMIT 1
      `,
      [id.trim()]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Member "${id}" not found in system` },
        { status: 404 }
      );
    }

    const row = res.rows[0];
    const member = {
      ...mapRowToUser(row),
      parentId: row.parent_id || "",
      avatarUrl: row.avatar_url || "",
      plainPassword: row.plain_password || "123456",
      nomineeName: row.nominee_name || "",
      nomineeRelation: row.nominee_relation || "",
    };

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
      avatarUrl,
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
      "SELECT id FROM users WHERE (id = $1 OR UPPER(member_id) = UPPER($1)) AND (role IS NULL OR role != 'ADMIN') LIMIT 1",
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
    let plainPassword: string | null = null;
    if (password && typeof password === "string" && password.trim().length >= 4) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
      plainPassword = password.trim();
    }

    // Lookup sponsor name if sponsorId provided
    let sponsorName: string | null = null;
    let cleanSponsorId: string | null = null;
    if (sponsorId !== undefined && sponsorId !== null && sponsorId.trim() !== "") {
      cleanSponsorId = sponsorId.trim().toUpperCase();
      const spRes = await client.query(
        "SELECT member_id, full_name FROM users WHERE UPPER(member_id) = $1 LIMIT 1",
        [cleanSponsorId]
      );
      if (spRes.rows.length > 0) {
        sponsorName = spRes.rows[0].full_name;
      }
    }

    await client.query("BEGIN");

    // 1. Update users core profile
    await client.query(
      `
      UPDATE users SET
        sponsor_id = COALESCE($1, sponsor_id),
        sponsor_name = COALESCE($2, sponsor_name),
        full_name = COALESCE($3, full_name),
        mobile = COALESCE($4, mobile),
        email = COALESCE($5, email),
        password_hash = COALESCE($6, password_hash),
        plain_password = COALESCE($7, plain_password),
        avatar_url = COALESCE($8, avatar_url),
        pincode = COALESCE($9, pincode),
        city = COALESCE($10, city),
        state = COALESCE($11, state),
        address = COALESCE($12, address),
        status = COALESCE($13, status),
        updated_at = NOW()
      WHERE id = $14;
    `,
      [
        cleanSponsorId,
        sponsorName,
        fullName !== undefined ? fullName.trim() : null,
        mobile !== undefined ? mobile.trim() : null,
        email !== undefined ? (email ? email.trim().toLowerCase() : null) : null,
        passwordHash,
        plainPassword,
        avatarUrl !== undefined ? avatarUrl : null,
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
