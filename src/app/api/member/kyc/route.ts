import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, member_id, full_name, mobile,
                aadhaar_name, aadhaar_number, aadhaar_front_url, aadhaar_back_url, aadhaar_status, aadhaar_rejection_reason,
                pan_number, pan_card_url, pan_status, pan_rejection_reason,
                bank_name, bank_account_number, ifsc_code, bank_proof_url, bank_status, bank_rejection_reason,
                kyc_status, kyc_submitted_at, kyc_verified_at, kyc_rejection_reason
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
        kyc: {
          memberId: row.member_id,
          fullName: row.full_name,
          mobile: row.mobile,
          // Aadhaar
          aadhaarName: row.aadhaar_name || "",
          aadhaarNumber: row.aadhaar_number || "",
          aadhaarFrontUrl: row.aadhaar_front_url || "",
          aadhaarBackUrl: row.aadhaar_back_url || "",
          aadhaarStatus: row.aadhaar_status || "NOT_SUBMITTED",
          aadhaarRejectionReason: row.aadhaar_rejection_reason || "",
          // PAN
          panNumber: row.pan_number || "",
          panCardUrl: row.pan_card_url || "",
          panStatus: row.pan_status || "NOT_SUBMITTED",
          panRejectionReason: row.pan_rejection_reason || "",
          // Bank
          bankName: row.bank_name || "",
          bankAccountNumber: row.bank_account_number || "",
          ifscCode: row.ifsc_code || "",
          bankProofUrl: row.bank_proof_url || "",
          bankStatus: row.bank_status || "NOT_SUBMITTED",
          bankRejectionReason: row.bank_rejection_reason || "",
          // Overall
          kycStatus: row.kyc_status || "NOT_SUBMITTED",
          kycSubmittedAt: row.kyc_submitted_at,
          kycVerifiedAt: row.kyc_verified_at,
          kycRejectionReason: row.kyc_rejection_reason || "",
        },
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error fetching member KYC details:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      aadhaarName,
      aadhaarNumber,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      panNumber,
      panCardUrl,
      bankName,
      bankAccountNumber,
      ifscCode,
      bankProofUrl,
    } = body;

    // Upload to dedicated Cloudinary folders: kyc/aadhar, kyc/pan, kyc/cheque
    const finalAadhaarFront = aadhaarFrontUrl ? await uploadToCloudinary(aadhaarFrontUrl, "kyc/aadhar") : null;
    const finalAadhaarBack = aadhaarBackUrl ? await uploadToCloudinary(aadhaarBackUrl, "kyc/aadhar") : null;
    const finalPanCard = panCardUrl ? await uploadToCloudinary(panCardUrl, "kyc/pan") : null;
    const finalBankProof = bankProofUrl ? await uploadToCloudinary(bankProofUrl, "kyc/cheque") : null;

    const client = await pool.connect();
    try {
      // Mark submitted sections as PENDING, preserving already VERIFIED sections
      await client.query(
        `UPDATE users
         SET aadhaar_name = COALESCE($1, aadhaar_name),
             aadhaar_number = COALESCE($2, aadhaar_number),
             aadhaar_front_url = COALESCE($3, aadhaar_front_url),
             aadhaar_back_url = COALESCE($4, aadhaar_back_url),
             aadhaar_status = CASE 
               WHEN aadhaar_status = 'VERIFIED' THEN 'VERIFIED'
               WHEN $2 IS NOT NULL OR $3 IS NOT NULL THEN 'PENDING' 
               ELSE aadhaar_status 
             END,
             aadhaar_rejection_reason = CASE
               WHEN aadhaar_status = 'VERIFIED' THEN NULL
               WHEN $2 IS NOT NULL OR $3 IS NOT NULL THEN NULL
               ELSE aadhaar_rejection_reason
             END,

             pan_number = COALESCE($5, pan_number),
             pan_card_url = COALESCE($6, pan_card_url),
             pan_status = CASE 
               WHEN pan_status = 'VERIFIED' THEN 'VERIFIED'
               WHEN $5 IS NOT NULL OR $6 IS NOT NULL THEN 'PENDING' 
               ELSE pan_status 
             END,
             pan_rejection_reason = CASE
               WHEN pan_status = 'VERIFIED' THEN NULL
               WHEN $5 IS NOT NULL OR $6 IS NOT NULL THEN NULL
               ELSE pan_rejection_reason
             END,

             bank_name = COALESCE($7, bank_name),
             bank_account_number = COALESCE($8, bank_account_number),
             ifsc_code = COALESCE($9, ifsc_code),
             bank_proof_url = COALESCE($10, bank_proof_url),
             bank_status = CASE 
               WHEN bank_status = 'VERIFIED' THEN 'VERIFIED'
               WHEN $8 IS NOT NULL OR $10 IS NOT NULL THEN 'PENDING' 
               ELSE bank_status 
             END,
             bank_rejection_reason = CASE
               WHEN bank_status = 'VERIFIED' THEN NULL
               WHEN $8 IS NOT NULL OR $10 IS NOT NULL THEN NULL
               ELSE bank_rejection_reason
             END,

             kyc_status = CASE
               WHEN aadhaar_status = 'VERIFIED' AND pan_status = 'VERIFIED' AND bank_status = 'VERIFIED' THEN 'VERIFIED'
               ELSE 'PENDING'
             END,
             kyc_rejection_reason = NULL,
             kyc_submitted_at = NOW(),
             updated_at = NOW()
         WHERE UPPER(member_id) = UPPER($11)`,
        [
          aadhaarName ?? null,
          aadhaarNumber ?? null,
          finalAadhaarFront,
          finalAadhaarBack,
          panNumber ?? null,
          finalPanCard,
          bankName ?? null,
          bankAccountNumber ?? null,
          ifscCode ?? null,
          finalBankProof,
          session.memberId,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "KYC documents submitted successfully for administrative verification!",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error submitting KYC:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
