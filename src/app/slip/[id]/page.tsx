import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import ParcelSlip, { ParcelSlipProps } from "@/components/invoice/ParcelSlip";
import { pool } from "@/lib/db";
import { getSession, getAdminSession, getShoppySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SAMPLE_SLIP: ParcelSlipProps["order"] = {
  id: "AO-741295",
  invoiceNo: 1,
  createdAt: "2026-08-23T10:00:00.000Z",
  billedBy: "AV26324",
  memberId: "AV26324",
  fullName: "Radhika Panchal",
  customerName: "Radhika Panchal",
  mobile: "7877232967",
  customerMobile: "7877232967",
  shippingAddress: "District jhalawar rajsthan Pin code 326036",
  recipientState: "Rajasthan",
  recipientPincode: "326036",
  amount: 1073,
  pv: 200,
  status: "APPROVED",
};

export default async function SlipPage(props: PageProps) {
  const { id: orderId } = await props.params;
  const searchParams = await props.searchParams;
  const autoPrint = searchParams?.print === "1";

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-black text-gray-900">Order ID Required</h2>
          <p className="text-xs text-gray-500">Please provide a valid order identifier.</p>
        </div>
      </div>
    );
  }

  if (orderId === "preview" || orderId === "sample") {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white flex flex-col items-center">
        <ParcelSlip order={SAMPLE_SLIP} autoPrint={autoPrint} />
      </div>
    );
  }

  // 1. Authenticate Requester (Admin, Shoppy Hub, or Member)
  const [memberSession, adminSession, shoppySession] = await Promise.all([
    getSession(),
    getAdminSession(),
    getShoppySession(),
  ]);

  if (!memberSession && !adminSession && !shoppySession) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-lg font-black text-gray-900">Authentication Required</h2>
          <p className="text-xs text-gray-500">
            You must be logged in as an Admin, Shoppy, or Member to access this dispatch slip.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch directly from Postgres without client roundtrip delays
  const client = await pool.connect();
  let orderData: ParcelSlipProps["order"] | null = null;
  let authError: string | null = null;

  try {
    const res = await client.query(
      `
      SELECT 
        o.id,
        o.invoice_no,
        o.user_id,
        o.purchase_type,
        o.package_name,
        o.amount,
        o.pv,
        o.status,
        o.billed_by,
        o.customer_name,
        o.customer_mobile,
        o.shipping_address,
        o.transaction_id,
        o.courier_name,
        o.tracking_number,
        o.created_at,
        u.member_id as recipient_member_id,
        u.full_name as recipient_name,
        u.mobile as recipient_mobile,
        u.address as recipient_address,
        u.city as recipient_city,
        u.state as recipient_state,
        u.pincode as recipient_pincode,
        b.member_id as buyer_member_id,
        b.full_name as buyer_name,
        b.mobile as buyer_mobile
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
      WHERE o.id = $1;
    `,
      [orderId]
    );

    if (res.rows.length === 0) {
      authError = "Order not found in database";
    } else {
      const r = res.rows[0];

      // Authorize requester
      if (!adminSession && !shoppySession) {
        const requesterMemberId = (memberSession?.memberId || "").toUpperCase();
        const requesterUserId = memberSession?.userId || "";
        const isRecipient =
          (r.recipient_member_id && r.recipient_member_id.toUpperCase() === requesterMemberId) ||
          r.user_id === requesterUserId;
        const isBiller = r.billed_by && r.billed_by.toUpperCase() === requesterMemberId;

        if (!isRecipient && !isBiller) {
          authError = "Unauthorized. You do not have permission to view this dispatch slip.";
        }
      }

      if (!authError) {
        orderData = {
          id: r.id,
          invoiceNo: r.invoice_no ? parseInt(r.invoice_no, 10) : undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          billedBy: r.billed_by,
          memberId: r.recipient_member_id || r.billed_by,
          fullName: r.recipient_name || r.customer_name,
          customerName: r.customer_name || r.recipient_name,
          mobile: r.recipient_mobile || r.customer_mobile,
          customerMobile: r.customer_mobile || r.recipient_mobile,
          shippingAddress:
            r.shipping_address ||
            r.recipient_address ||
            [r.recipient_city, r.recipient_state, r.recipient_pincode ? `PIN: ${r.recipient_pincode}` : ""]
              .filter(Boolean)
              .join(", "),
          recipientState: r.recipient_state || "Gujarat",
          recipientPincode: r.recipient_pincode || "395010",
          amount: parseFloat(r.amount || "0"),
          pv: parseFloat(r.pv || "0"),
          status: r.status,
          courierName: r.courier_name,
          trackingNumber: r.tracking_number,
        };
      }
    }
  } catch (err) {
    console.error("Server component parcel slip fetch error:", err);
    authError = "Database error loading parcel slip details.";
  } finally {
    client.release();
  }

  if (authError || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-black text-gray-900">Slip Unavailable</h2>
          <p className="text-xs text-gray-500">{authError || "Could not find dispatch slip for this order."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white flex flex-col items-center">
      <ParcelSlip order={orderData} autoPrint={autoPrint} />
    </div>
  );
}
