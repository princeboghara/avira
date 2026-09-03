import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/settings/shipping - Read current shipping charge
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT value FROM system_settings WHERE key = 'shipping_charge' LIMIT 1"
      );
      const charge = res.rows.length > 0 ? Number(res.rows[0].value) || 0 : 0;
      return NextResponse.json({ success: true, shippingCharge: charge });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error fetching shipping charge:", err);
    return NextResponse.json({ success: true, shippingCharge: 0 });
  }
}

// POST /api/settings/shipping - Update shipping charge (Admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const charge = Math.max(0, Number(body.shippingCharge) || 0);

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ('shipping_charge', $1, 'Standard delivery shipping charge in INR', NOW())
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(charge)]
      );
      return NextResponse.json({ success: true, shippingCharge: charge });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error updating shipping charge:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update shipping charge" },
      { status: 500 }
    );
  }
}
