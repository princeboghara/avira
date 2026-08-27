import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, member_id, full_name, mobile, email, pincode, city, state, address,
                gst_number, nominee_name, nominee_relation, avatar_url, wallet_balance,
                personal_pv, status, joined_date, created_at
         FROM users
         WHERE UPPER(member_id) = UPPER($1)
         LIMIT 1`,
        [session.memberId]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      const row = res.rows[0];
      return NextResponse.json({
        success: true,
        profile: {
          id: row.id,
          memberId: row.member_id,
          fullName: row.full_name, // NON-EDITABLE
          mobile: row.mobile,       // NON-EDITABLE
          pincode: row.pincode,     // NON-EDITABLE
          email: row.email || "",
          address: row.address || "",
          city: row.city || "",
          state: row.state || "",
          gstNumber: row.gst_number || "",
          nomineeName: row.nominee_name || "",
          nomineeRelation: row.nominee_relation || "",
          avatarUrl: row.avatar_url || "",
          personalPv: Number(row.personal_pv || 0),
          walletBalance: Number(row.wallet_balance || 0),
          status: row.status,
          joinedDate: row.joined_date || row.created_at,
        },
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching member profile:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      avatarUrl,
      email,
      address,
      city,
      state,
      gstNumber,
      nomineeName,
      nomineeRelation,
    } = body;

    // Upload avatar to Cloudinary folder 'avatars' if provided
    const finalAvatarUrl = avatarUrl ? await uploadToCloudinary(avatarUrl, "avatars") : null;

    // Strict security: Name, Member ID, Mobile, and Pincode are strictly protected from modification here.
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE users
         SET avatar_url = COALESCE($1, avatar_url),
             email = COALESCE($2, email),
             address = COALESCE($3, address),
             city = COALESCE($4, city),
             state = COALESCE($5, state),
             gst_number = COALESCE($6, gst_number),
             nominee_name = COALESCE($7, nominee_name),
             nominee_relation = COALESCE($8, nominee_relation),
             updated_at = NOW()
         WHERE UPPER(member_id) = UPPER($9)`,
        [
          finalAvatarUrl,
          email ?? null,
          address ?? null,
          city ?? null,
          state ?? null,
          gstNumber ?? null,
          nomineeName ?? null,
          nomineeRelation ?? null,
          session.memberId,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully!",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error updating member profile:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
