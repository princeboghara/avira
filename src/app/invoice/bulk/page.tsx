import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import TaxInvoice, { TaxInvoiceProps } from "@/components/invoice/TaxInvoice";
import BulkInvoiceControls from "@/components/invoice/BulkInvoiceControls";
import { pool } from "@/lib/db";
import { getSession, getAdminSession, getShoppySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface BulkInvoicePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BulkInvoicePage(props: BulkInvoicePageProps) {
  const searchParams = await props.searchParams;
  const idsParam = typeof searchParams?.ids === "string" ? searchParams.ids : "";
  const autoPrint = searchParams?.print === "1";

  if (!idsParam.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-red-100 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-black text-gray-800">No Orders Selected</h2>
          <p className="text-xs text-gray-500">Please provide comma-separated order IDs.</p>
        </div>
      </div>
    );
  }

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Authenticate
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
          <p className="text-xs text-gray-500">Please log in to view order invoices.</p>
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

  const client = await pool.connect();
  let orders: TaxInvoiceProps["order"][] = [];
  let errorMsg = "";

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
        o.items,
        o.shipping_charge,
        o.status,
        o.billed_by,
        o.customer_name,
        o.customer_mobile,
        o.shipping_address,
        o.transaction_id,
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
        b.mobile as buyer_mobile,
        b.address as buyer_address,
        b.city as buyer_city,
        b.state as buyer_state,
        b.pincode as buyer_pincode,
        uk.gst_number as recipient_gstin,
        bk.gst_number as buyer_gstin
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN user_kyc uk ON u.id = uk.user_id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
      LEFT JOIN user_kyc bk ON b.id = bk.user_id
      WHERE o.id = ANY($1::text[])
      ORDER BY o.created_at DESC;
    `,
      [ids]
    );

    orders = res.rows.map((r) => {
      let parsedItems = [];
      try {
        parsedItems = typeof r.items === "string" ? JSON.parse(r.items) : r.items || [];
      } catch {
        parsedItems = [];
      }

      return {
        id: r.id,
        invoiceNo: r.invoice_no ? parseInt(r.invoice_no, 10) : 1,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        billedBy: r.billed_by || r.buyer_member_id,
        buyerName: r.buyer_name || r.billed_by,
        buyerMobile: r.buyer_mobile || "",
        buyerAddress: r.buyer_address || [r.buyer_city, r.buyer_state, r.buyer_pincode ? `PIN: ${r.buyer_pincode}` : ""].filter(Boolean).join(", "),
        buyerCity: r.buyer_city || "",
        buyerState: r.buyer_state || "Gujarat",
        buyerPincode: r.buyer_pincode || "395010",
        buyerGstin: r.buyer_gstin || "",
        customerName: r.customer_name || r.recipient_name,
        customerMobile: r.customer_mobile || r.recipient_mobile,
        shippingAddress: r.shipping_address || r.recipient_address || [r.recipient_city, r.recipient_state, r.recipient_pincode ? `PIN: ${r.recipient_pincode}` : ""].filter(Boolean).join(", "),
        consigneeGstin: r.recipient_gstin || "",
        consigneeMemberId: r.recipient_member_id || "",
        transactionId: r.transaction_id,
        memberId: r.recipient_member_id || r.billed_by,
        fullName: r.recipient_name || r.customer_name,
        mobile: r.recipient_mobile || r.customer_mobile,
        recipientState: r.recipient_state || "Gujarat",
        recipientPincode: r.recipient_pincode || "395010",
        amount: parseFloat(r.amount || "0"),
        shippingCharge: parseFloat(r.shipping_charge || "0"),
        pv: parseFloat(r.pv || "0"),
        items: parsedItems,
        packageName: r.package_name,
        status: r.status,
      };
    });
  } catch (err) {
    console.error("Bulk invoice error:", err);
    errorMsg = "Database error loading bulk invoices";
  } finally {
    client.release();
  }

  if (errorMsg || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-red-100 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-black text-gray-800">Unable to Load Invoices</h2>
          <p className="text-xs text-gray-500">{errorMsg || "No matching orders found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12 print:bg-white print:p-0 print:m-0">
      <BulkInvoiceControls ordersCount={orders.length} autoPrint={autoPrint} />
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 px-4 print:p-0">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="print:break-after-page print:mb-0 print:p-0 shadow-sm rounded-2xl bg-white p-4 print:shadow-none print:rounded-none"
            style={{ breakAfter: "page" }}
          >
            <TaxInvoice order={ord} />
          </div>
        ))}
      </div>
    </div>
  );
}
