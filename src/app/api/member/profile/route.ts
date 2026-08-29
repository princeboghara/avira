import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, member_id, full_name, mobile, email, pincode, city, state, address,
                gst_number, nominee_name, nominee_relation, avatar_url, wallet_balance,
                personal_pv, status, joined_date, created_at
         FROM v_users_full
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
    const session = await getSession(req);
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

    const client = await pool.connect();
    try {
      // Get user ID
      const uRes = await client.query("SELECT id FROM users WHERE UPPER(member_id) = UPPER($1) LIMIT 1", [session.memberId]);
      if (uRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      const userId = uRes.rows[0].id;

      await client.query("BEGIN");

      // 1. Update users table for profile fields
      await client.query(
        `UPDATE users
         SET avatar_url = COALESCE($1, avatar_url),
             email = COALESCE($2, email),
             address = COALESCE($3, address),
             city = COALESCE($4, city),
             state = COALESCE($5, state),
             updated_at = NOW()
         WHERE id = $6`,
        [
          finalAvatarUrl,
          email ?? null,
          address ?? null,
          city ?? null,
          state ?? null,
          userId,
        ]
      );

      // 2. Update user_kyc table for gst and nominee fields
      await client.query(
        `INSERT INTO user_kyc (user_id, gst_number, nominee_name, nominee_relation, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           gst_number = COALESCE($2, user_kyc.gst_number),
           nominee_name = COALESCE($3, user_kyc.nominee_name),
           nominee_relation = COALESCE($4, user_kyc.nominee_relation),
           updated_at = NOW()`,
        [
          userId,
          gstNumber ?? null,
          nomineeName ?? null,
          nomineeRelation ?? null,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully!",
      });
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error updating member profile:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
