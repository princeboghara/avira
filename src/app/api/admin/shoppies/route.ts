import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool, getAllShoppies } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const shoppies = await getAllShoppies();
    return NextResponse.json({
      success: true,
      shoppies,
    });
  } catch (error) {
    console.error("Fetch shoppies error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch shoppies" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const {
      storeName,
      ownerName,
      mobile,
      email,
      password,
      address,
      city,
      state,
      pincode,
    } = body;

    if (!storeName || !ownerName || !mobile || !password) {
      return NextResponse.json(
        { success: false, message: "Store Name, Owner Name, Mobile and Password are required" },
        { status: 400 }
      );
    }

    // Check if mobile or existing shoppy with this mobile
    const existingRes = await client.query(
      `SELECT id FROM shoppies WHERE mobile = $1 LIMIT 1`,
      [mobile.trim()]
    );
    if (existingRes.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "A Shoppy with this mobile number already exists" },
        { status: 400 }
      );
    }

    // Generate unique Shoppy ID e.g. SHP1001, SHP1002...
    const countRes = await client.query(`SELECT COUNT(*) FROM shoppies`);
    const totalCount = parseInt(countRes.rows[0].count || "0", 10) + 1;
    let shoppyId = `SHP${String(1000 + totalCount).padStart(4, "0")}`;

    // Verify uniqueness
    let exists = true;
    while (exists) {
      const checkRes = await client.query(
        `SELECT id FROM shoppies WHERE shoppy_id = $1 LIMIT 1`,
        [shoppyId]
      );
      if (checkRes.rows.length === 0) {
        exists = false;
      } else {
        shoppyId = `SHP${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const newId = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await client.query(
      `INSERT INTO shoppies (
        id, shoppy_id, store_name, owner_name, mobile, email, password_hash,
        address, city, state, pincode, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', NOW(), NOW()
      )`,
      [
        newId,
        shoppyId,
        storeName.trim(),
        ownerName.trim(),
        mobile.trim(),
        email ? email.trim() : null,
        passwordHash,
        address ? address.trim() : "",
        city ? city.trim() : "",
        state ? state.trim() : "",
        pincode ? pincode.trim() : "",
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Shoppy center "${storeName}" created successfully with ID: ${shoppyId}`,
      shoppy: {
        id: newId,
        shoppyId,
        storeName,
        ownerName,
        mobile,
        city,
        state,
        pincode,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Create shoppy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create shoppy center" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
