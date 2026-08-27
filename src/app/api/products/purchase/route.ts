import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserByIdentifier } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

const orderItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string(),
  hsnCode: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  mrp: z.number().nonnegative().default(0),
  price: z.number().nonnegative().optional(),
  discountPrice: z.number().nonnegative().optional(),
  gst: z.number().nonnegative().optional(),
  pv: z.number().nonnegative().default(0),
  subtotalMrp: z.number().nonnegative().optional(),
  subtotalPv: z.number().nonnegative().optional(),
});

const purchaseSchema = z.object({
  billedBy: z.string().optional(),
  memberId: z.string().min(1, "Recipient Member ID is required"),
  targetMemberId: z.string().optional(),
  customerName: z.string().optional(),
  customerMobile: z.string().optional(),
  shippingAddress: z.string().optional(),
  transactionId: z.string().min(1, "Transaction ID / UTR is required"),
  paymentSlip: z.string().min(1, "Payment slip image is required"),
  paymentSlipUrl: z.string().optional(),
  packageName: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  totalAmount: z.number().optional(),
  pv: z.number().positive("PV must be positive"),
  totalPv: z.number().optional(),
  purchaseType: z.enum(["ACTIVATION", "REPURCHASE"]).default("ACTIVATION"),
  items: z.array(orderItemSchema).min(1, "Order cart cannot be empty"),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const normalizedItems = Array.isArray(rawBody.items)
      ? rawBody.items.map((it: any) => ({
          productId: it.productId || it.id || "",
          name: it.name || "Avira Product",
          hsnCode: it.hsnCode || "30049011",
          quantity: Number(it.quantity || 1),
          mrp: Number(
            it.mrp !== undefined
              ? it.mrp
              : it.price !== undefined
              ? it.price
              : it.discountPrice || 0
          ),
          price: Number(
            it.price !== undefined
              ? it.price
              : it.discountPrice !== undefined
              ? it.discountPrice
              : it.mrp || 0
          ),
          discountPrice: Number(
            it.discountPrice !== undefined
              ? it.discountPrice
              : it.price !== undefined
              ? it.price
              : it.mrp || 0
          ),
          gst: Number(it.gst || 0),
          pv: Number(it.pv || 0),
          subtotalMrp: Number(it.subtotalMrp || 0),
          subtotalPv: Number(it.subtotalPv || 0),
        }))
      : [];

    const body = {
      ...rawBody,
      memberId: (rawBody.memberId || rawBody.targetMemberId || "").trim().toUpperCase(),
      amount: Number(rawBody.amount !== undefined ? rawBody.amount : rawBody.totalAmount || 0),
      pv: Number(rawBody.pv !== undefined ? rawBody.pv : rawBody.totalPv || 0),
      paymentSlip: rawBody.paymentSlip || rawBody.paymentSlipUrl || "",
      items: normalizedItems,
    };

    const result = purchaseSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid purchase details";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const {
      billedBy,
      memberId,
      customerName,
      customerMobile,
      shippingAddress,
      transactionId,
      paymentSlip,
      amount,
      pv,
      purchaseType,
      items,
    } = result.data;

    // Determine who billed the order
    let finalBilledBy = billedBy?.trim().toUpperCase();
    if (!finalBilledBy) {
      const authHeader = req.headers.get("authorization");
      let token = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else {
        const cookieToken = req.cookies.get("avira_access_token");
        if (cookieToken) token = cookieToken.value;
      }
      if (token) {
        const { verifyAccessToken } = await import("@/lib/jwt");
        const payload = verifyAccessToken(token);
        if (payload?.memberId) finalBilledBy = payload.memberId;
      }
    }
    if (!finalBilledBy) finalBilledBy = memberId.trim().toUpperCase();

    // Verify recipient member exists
    const cleanMemberId = memberId.trim().toUpperCase();
    const user = await findUserByIdentifier(cleanMemberId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: `Recipient Member "${cleanMemberId}" not found in system.` },
        { status: 404 }
      );
    }

    // Determine descriptive package/order name
    let finalOrderName = result.data.packageName;
    if (!finalOrderName || finalOrderName.trim() === "") {
      if (items && items.length > 0) {
        finalOrderName = items.map((it) => `${it.name} (${it.quantity}x)`).join(", ");
      } else {
        finalOrderName = `Product Order (${pv} PV)`;
      }
    }

    const finalCustomerName = customerName?.trim() || user.fullName;
    const finalCustomerMobile = customerMobile?.trim() || user.mobile;
    const finalShippingAddress =
      shippingAddress?.trim() ||
      [user.city, user.state, user.pincode ? `PIN: ${user.pincode}` : ""]
        .filter(Boolean)
        .join(", ") ||
      "Main Delivery Address";

    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `AV-ORD-${Date.now().toString().slice(-6)}-${uniqueSuffix}`;
    const finalSlipUrl = paymentSlip ? await uploadToCloudinary(paymentSlip, "slips") : "";

    const { pool } = await import("@/lib/db");
    const client = await pool.connect();
    try {
      await client.query(
        `
        INSERT INTO orders (
          id, 
          user_id, 
          purchase_type, 
          package_name, 
          amount, 
          pv, 
          items, 
          status, 
          billed_by, 
          customer_name, 
          customer_mobile, 
          shipping_address, 
          transaction_id, 
          payment_slip
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9, $10, $11, $12, $13);
      `,
        [
          orderId,
          user.id,
          purchaseType,
          finalOrderName,
          amount,
          pv,
          JSON.stringify(items || []),
          finalBilledBy,
          finalCustomerName,
          finalCustomerMobile,
          finalShippingAddress,
          transactionId.trim(),
          finalSlipUrl,
        ]
      );
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} submitted successfully! Awaiting Admin Approval to verify payment slip and credit +${pv} PV.`,
      status: "PENDING",
      data: {
        orderId,
        memberId: user.memberId,
        billedBy: finalBilledBy,
        customerName: finalCustomerName,
        customerMobile: finalCustomerMobile,
        shippingAddress: finalShippingAddress,
        transactionId: transactionId.trim(),
        personalPv: user.personalPv,
        pendingPv: pv,
        amount,
        purchaseType,
        orderName: finalOrderName,
        itemsCount: items ? items.reduce((acc, cur) => acc + cur.quantity, 0) : 1,
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during product order processing" },
      { status: 500 }
    );
  }
}
