import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool, findShoppyById } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const shoppy = await findShoppyById(id);

  if (!shoppy) {
    return NextResponse.json(
      { success: false, message: "Shoppy not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, shoppy });
}

export async function PUT(
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
      storeName,
      ownerName,
      mobile,
      email,
      password,
      address,
      city,
      state,
      pincode,
      status,
    } = body;

    const shoppy = await findShoppyById(id);
    if (!shoppy) {
      return NextResponse.json(
        { success: false, message: "Shoppy not found" },
        { status: 404 }
      );
    }

    let passwordHash = shoppy.passwordHash;
    if (password && password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await client.query(
      `UPDATE shoppies SET
        store_name = COALESCE($1, store_name),
        owner_name = COALESCE($2, owner_name),
        mobile = COALESCE($3, mobile),
        email = COALESCE($4, email),
        password_hash = COALESCE($5, password_hash),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        pincode = COALESCE($9, pincode),
        status = COALESCE($10, status),
        updated_at = NOW()
      WHERE id = $11 OR shoppy_id = $11`,
      [
        storeName ? storeName.trim() : null,
        ownerName ? ownerName.trim() : null,
        mobile ? mobile.trim() : null,
        email ? email.trim() : null,
        passwordHash,
        address !== undefined ? address : null,
        city !== undefined ? city : null,
        state !== undefined ? state : null,
        pincode !== undefined ? pincode : null,
        status || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Shoppy "${shoppy.shoppyId}" updated successfully`,
    });
  } catch (error) {
    console.error("Update shoppy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update shoppy" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
