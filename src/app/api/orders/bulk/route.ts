import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, getAdminSession, getShoppySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam || !idsParam.trim()) {
    return NextResponse.json(
      { success: false, message: "No order IDs provided" },
      { status: 400 }
    );
  }

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json(
      { success: false, message: "Invalid order IDs list" },
      { status: 400 }
    );
  }

  // Authenticate requester (Admin, Shoppy Hub, or Member)
  const [memberSession, adminSession, shoppySession] = await Promise.all([
    getSession(req),
    getAdminSession(req),
    getShoppySession(req),
  ]);

  if (!memberSession && !adminSession && !shoppySession) {
    return NextResponse.json(
      { success: false, message: "Authentication required to access order invoices." },
      { status: 401 }
    );
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      SELECT 
        o.id,
        o.user_id,
        o.purchase_type,
        o.package_name,
        o.amount,
        o.pv,
        o.items,
        o.shipping_charge,
        o.invoice_no,
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
        b.pincode as buyer_pincode
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users b ON UPPER(o.billed_by) = UPPER(b.member_id)
      WHERE o.id = ANY($1::text[])
      ORDER BY o.created_at DESC;
    `,
      [ids]
    );

    const orders = res.rows.map((r) => {
      let parsedItems = [];
      try {
        parsedItems = typeof r.items === "string" ? JSON.parse(r.items) : r.items || [];
      } catch {
        parsedItems = [];
      }

      return {
        id: r.id,
        userId: r.user_id,
        purchaseType: r.purchase_type,
        packageName: r.package_name,
        amount: parseFloat(r.amount || "0"),
        pv: parseFloat(r.pv || "0"),
        items: parsedItems,
        shippingCharge: parseFloat(r.shipping_charge || "0"),
        invoiceNo: parseInt(r.invoice_no || "1", 10),
        status: r.status,
        billedBy: r.billed_by,
        buyerName: r.buyer_name || r.billed_by,
        buyerMobile: r.buyer_mobile || "",
        buyerAddress: r.buyer_address || [r.buyer_city, r.buyer_state, r.buyer_pincode ? `PIN: ${r.buyer_pincode}` : ""].filter(Boolean).join(", "),
        buyerCity: r.buyer_city || "",
        buyerState: r.buyer_state || "Gujarat",
        buyerPincode: r.buyer_pincode || "395010",
        customerName: r.customer_name || r.recipient_name,
        customerMobile: r.customer_mobile || r.recipient_mobile,
        shippingAddress: r.shipping_address || r.recipient_address || [r.recipient_city, r.recipient_state, r.recipient_pincode ? `PIN: ${r.recipient_pincode}` : ""].filter(Boolean).join(", "),
        transactionId: r.transaction_id,
        memberId: r.recipient_member_id || r.billed_by,
        fullName: r.recipient_name || r.customer_name,
        mobile: r.recipient_mobile || r.customer_mobile,
        recipientState: r.recipient_state || "Gujarat",
        recipientPincode: r.recipient_pincode || "395010",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Bulk orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bulk order details" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
