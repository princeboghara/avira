import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

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
      fullName,
      mobile,
      email,
      pincode,
      city,
      state,
      status,
      nomineeName,
      nomineeRelation,
    } = body;

    await client.query(
      `
      UPDATE users SET
        full_name = COALESCE($1, full_name),
        mobile = COALESCE($2, mobile),
        email = COALESCE($3, email),
        pincode = COALESCE($4, pincode),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        status = COALESCE($7, status),
        nominee_name = COALESCE($8, nominee_name),
        nominee_relation = COALESCE($9, nominee_relation),
        updated_at = NOW()
      WHERE id = $10 OR member_id = $10;
    `,
      [
        fullName,
        mobile,
        email,
        pincode,
        city,
        state,
        status,
        nomineeName,
        nomineeRelation,
        id,
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
