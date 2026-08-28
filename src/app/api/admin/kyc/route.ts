import { NextRequest, NextResponse } from "next/server";
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
        u.id, u.member_id, u.full_name, u.mobile, u.email, u.created_at,
        k.aadhaar_name, k.aadhaar_number, k.aadhaar_front_url, k.aadhaar_back_url, k.aadhaar_status, k.aadhaar_rejection_reason,
        k.pan_number, k.pan_card_url, k.pan_status, k.pan_rejection_reason,
        k.bank_name, k.bank_account_number, k.ifsc_code, k.bank_proof_url, k.bank_status, k.bank_rejection_reason,
        k.kyc_document_url, k.kyc_status,
        k.kyc_submitted_at, k.kyc_verified_at, k.kyc_rejection_reason
      FROM users u
      LEFT JOIN user_kyc k ON u.id = k.user_id
      WHERE (k.kyc_status IS NOT NULL AND k.kyc_status != 'NOT_SUBMITTED')
         OR (k.aadhaar_number IS NOT NULL AND k.aadhaar_number != '')
         OR (k.pan_number IS NOT NULL AND k.pan_number != '')
         OR (k.bank_account_number IS NOT NULL AND k.bank_account_number != '')
    `;

    const params: unknown[] = [];
    if (search.trim()) {
      query += `
        AND (
          u.member_id ILIKE $1 
          OR u.full_name ILIKE $1 
          OR k.pan_number ILIKE $1 
          OR k.aadhaar_number ILIKE $1
          OR k.bank_account_number ILIKE $1
        )
      `;
      params.push(`%${search.trim()}%`);
    }

    const limitParam = searchParams.get("limit");
    if (limitParam && !isNaN(Number(limitParam))) {
      params.push(Number(limitParam));
      query += ` ORDER BY k.kyc_submitted_at DESC NULLS LAST, u.created_at DESC LIMIT $${params.length};`;
    } else {
      query += ` ORDER BY k.kyc_submitted_at DESC NULLS LAST, u.created_at DESC;`;
    }

    const res = await client.query(query, params);

    const submissions = res.rows.map((row) => ({
      id: row.id,
      memberId: row.member_id,
      fullName: row.full_name,
      mobile: row.mobile,
      email: row.email || "",
      // Aadhaar Details
      aadhaarName: row.aadhaar_name || row.full_name,
      aadhaarNumber: row.aadhaar_number || "",
      aadhaarFrontUrl: row.aadhaar_front_url || row.kyc_document_url || "",
      aadhaarBackUrl: row.aadhaar_back_url || "",
      aadhaarStatus: row.aadhaar_status || row.kyc_status || "PENDING",
      aadhaarRejectionReason: row.aadhaar_rejection_reason || "",
      // PAN Details
      panNumber: row.pan_number || "",
      panCardUrl: row.pan_card_url || "",
      panStatus: row.pan_status || row.kyc_status || "PENDING",
      panRejectionReason: row.pan_rejection_reason || "",
      // Bank Details
      bankName: row.bank_name || "",
      bankAccountNumber: row.bank_account_number || "",
      ifscCode: row.ifsc_code || "",
      bankProofUrl: row.bank_proof_url || "",
      bankStatus: row.bank_status || row.kyc_status || "PENDING",
      bankRejectionReason: row.bank_rejection_reason || "",
      // Overall
      kycDocumentUrl: row.kyc_document_url || row.aadhaar_front_url || "",
      kycStatus: row.kyc_status || "PENDING",
      kycSubmittedAt: row.kyc_submitted_at
        ? new Date(row.kyc_submitted_at).toISOString()
        : new Date().toISOString(),
      kycVerifiedAt: row.kyc_verified_at
        ? new Date(row.kyc_verified_at).toISOString()
        : undefined,
      kycRejectionReason: row.kyc_rejection_reason || "",
    }));

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error("Fetch KYC error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch KYC records" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  return handleKycUpdate(req);
}

export async function PATCH(req: NextRequest) {
  return handleKycUpdate(req);
}

async function handleKycUpdate(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { memberId, status, reason, section } = body;

    if (!memberId || !status) {
      return NextResponse.json(
        { success: false, message: "memberId and status are required" },
        { status: 400 }
      );
    }

    // Get user id
    const uRes = await client.query(
      "SELECT id FROM users WHERE UPPER(member_id) = UPPER($1) OR id = $1 LIMIT 1",
      [memberId]
    );

    if (uRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    const userId = uRes.rows[0].id;

    if (section === "aadhaar") {
      await client.query(
        `UPDATE user_kyc SET
          aadhaar_status = $1,
          aadhaar_rejection_reason = $2,
          updated_at = NOW()
         WHERE user_id = $3`,
        [status, status === "REJECTED" ? (reason || "Aadhaar verification rejected") : null, userId]
      );
    } else if (section === "pan") {
      await client.query(
        `UPDATE user_kyc SET
          pan_status = $1,
          pan_rejection_reason = $2,
          updated_at = NOW()
         WHERE user_id = $3`,
        [status, status === "REJECTED" ? (reason || "PAN verification rejected") : null, userId]
      );
    } else if (section === "bank") {
      await client.query(
        `UPDATE user_kyc SET
          bank_status = $1,
          bank_rejection_reason = $2,
          updated_at = NOW()
         WHERE user_id = $3`,
        [status, status === "REJECTED" ? (reason || "Bank details verification rejected") : null, userId]
      );
    } else {
      // Overall update
      if (status === "VERIFIED") {
        await client.query(
          `UPDATE user_kyc SET
            kyc_status = 'VERIFIED',
            aadhaar_status = 'VERIFIED',
            pan_status = 'VERIFIED',
            bank_status = 'VERIFIED',
            aadhaar_rejection_reason = NULL,
            pan_rejection_reason = NULL,
            bank_rejection_reason = NULL,
            kyc_verified_at = NOW(),
            kyc_rejection_reason = NULL,
            updated_at = NOW()
           WHERE user_id = $1`,
          [userId]
        );
      } else if (status === "REJECTED") {
        await client.query(
          `UPDATE user_kyc SET
            kyc_status = 'REJECTED',
            kyc_rejection_reason = $1,
            updated_at = NOW()
           WHERE user_id = $2`,
          [reason || "KYC documents rejected. Please re-upload.", userId]
        );
      }
    }

    // When a specific section is updated, re-evaluate overall KYC status
    if (section) {
      const userRes = await client.query(
        `SELECT aadhaar_status, pan_status, bank_status, aadhaar_rejection_reason, pan_rejection_reason, bank_rejection_reason
         FROM user_kyc
         WHERE user_id = $1 LIMIT 1`,
        [userId]
      );

      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        const aStatus = u.aadhaar_status || "PENDING";
        const pStatus = u.pan_status || "PENDING";
        const bStatus = u.bank_status || "PENDING";

        if (aStatus === "VERIFIED" && pStatus === "VERIFIED" && bStatus === "VERIFIED") {
          await client.query(
            `UPDATE user_kyc SET
              kyc_status = 'VERIFIED',
              kyc_verified_at = NOW(),
              kyc_rejection_reason = NULL,
              updated_at = NOW()
             WHERE user_id = $1`,
            [userId]
          );
        } else if (aStatus === "REJECTED" || pStatus === "REJECTED" || bStatus === "REJECTED") {
          const rejectedParts: string[] = [];
          if (aStatus === "REJECTED") rejectedParts.push(`Aadhaar: ${u.aadhaar_rejection_reason || "Rejected"}`);
          if (pStatus === "REJECTED") rejectedParts.push(`PAN: ${u.pan_rejection_reason || "Rejected"}`);
          if (bStatus === "REJECTED") rejectedParts.push(`Bank: ${u.bank_rejection_reason || "Rejected"}`);

          await client.query(
            `UPDATE user_kyc SET
              kyc_status = 'REJECTED',
              kyc_rejection_reason = $1,
              updated_at = NOW()
             WHERE user_id = $2`,
            [rejectedParts.join(" | ") || "One or more KYC documents were rejected. Please re-upload.", userId]
          );
        } else {
          await client.query(
            `UPDATE user_kyc SET
              kyc_status = 'PENDING',
              kyc_verified_at = NULL,
              kyc_rejection_reason = NULL,
              updated_at = NOW()
             WHERE user_id = $1`,
            [userId]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `KYC for ${memberId} updated successfully.`,
    });
  } catch (error) {
    console.error("Update KYC error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update KYC status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
