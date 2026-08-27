import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession, getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Order ID is required" },
      { status: 400 }
    );
  }

  // 1. Authenticate requester (Admin or Member)
  const [memberSession, adminSession] = await Promise.all([
    getSession(req),
    getAdminSession(req),
  ]);

  if (!memberSession && !adminSession) {
    return NextResponse.json(
      { success: false, message: "Authentication required to access order invoice." },
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
      WHERE o.id = $1;
    `,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const r = res.rows[0];

    // 2. Authorize requester (Admin or Order Recipient or Biller)
    if (!adminSession) {
      const requesterMemberId = (memberSession?.memberId || "").toUpperCase();
      const requesterUserId = memberSession?.userId || "";
      const isRecipient =
        (r.recipient_member_id && r.recipient_member_id.toUpperCase() === requesterMemberId) ||
        r.user_id === requesterUserId;
      const isBiller = r.billed_by && r.billed_by.toUpperCase() === requesterMemberId;

      if (!isRecipient && !isBiller) {
        return NextResponse.json(
          { success: false, message: "Unauthorized. You do not have permission to view this order." },
          { status: 403 }
        );
      }
    }
    let parsedItems = [];
    try {
      parsedItems = typeof r.items === "string" ? JSON.parse(r.items) : r.items || [];
    } catch {
      parsedItems = [];
    }

    const order = {
      id: r.id,
      userId: r.user_id,
      purchaseType: r.purchase_type,
      packageName: r.package_name,
      amount: parseFloat(r.amount || "0"),
      pv: parseFloat(r.pv || "0"),
      items: parsedItems,
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

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Fetch single order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
