import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Fetch Global Shipping Settings and Product Shipping Roster
export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    // 1. Global Shipping Settings
    const settingsRes = await client.query(
      "SELECT default_shipping_charge, free_shipping_threshold, enable_free_shipping, updated_at FROM shipping_settings ORDER BY id ASC LIMIT 1"
    );

    const globalSettings = settingsRes.rows[0] || {
      default_shipping_charge: 50,
      free_shipping_threshold: 999,
      enable_free_shipping: false,
      updated_at: new Date().toISOString(),
    };

    // 2. Product Shipping Roster
    const productsRes = await client.query(`
      SELECT 
        id, 
        name, 
        category_name, 
        mrp, 
        discount_price, 
        pv, 
        COALESCE(shipping_charge, 0) as shipping_charge,
        COALESCE(is_free_shipping, false) as is_free_shipping,
        COALESCE(in_stock, true) as in_stock,
        image_url
      FROM products 
      ORDER BY id ASC
    `);

    return NextResponse.json({
      success: true,
      globalSettings: {
        defaultShippingCharge: parseFloat(globalSettings.default_shipping_charge || "50"),
        freeShippingThreshold: parseFloat(globalSettings.free_shipping_threshold || "999"),
        enableFreeShipping: false, // Locked / disabled per instructions
        updatedAt: globalSettings.updated_at,
      },
      products: productsRes.rows.map((p) => ({
        id: p.id,
        name: p.name,
        categoryName: p.category_name,
        mrp: parseFloat(p.mrp || "0"),
        discountPrice: p.discount_price ? parseFloat(p.discount_price) : null,
        pv: parseFloat(p.pv || "0"),
        shippingCharge: parseFloat(p.shipping_charge || "0"),
        isFreeShipping: Boolean(p.is_free_shipping),
        inStock: Boolean(p.in_stock),
        imageUrl: p.image_url,
      })),
    });
  } catch (error: any) {
    console.error("Admin shipping GET error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load shipping configurations." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST: Update Global Shipping Settings or Individual Product Shipping Surcharge
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "UPDATE_GLOBAL") {
      const defaultCharge = parseFloat(body.defaultShippingCharge ?? "50");

      if (isNaN(defaultCharge) || defaultCharge < 0) {
        return NextResponse.json(
          { success: false, message: "Default shipping charge must be a valid positive amount." },
          { status: 400 }
        );
      }

      // 1. Update shipping_settings table
      await client.query(`
        UPDATE shipping_settings 
        SET 
          default_shipping_charge = $1,
          enable_free_shipping = false,
          updated_at = NOW()
        WHERE id = (SELECT id FROM shipping_settings ORDER BY id ASC LIMIT 1)
      `, [defaultCharge]);

      // 2. Sync to system_settings for member cart lookup
      await client.query(`
        INSERT INTO system_settings (key, value, description, updated_at)
        VALUES ('shipping_charge', $1, 'Standard delivery shipping charge in INR', NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
      `, [String(defaultCharge)]);

      // 3. Propagate this default shipping charge to ALL products!
      await client.query(`
        UPDATE products 
        SET shipping_charge = $1
      `, [defaultCharge]);

      return NextResponse.json({
        success: true,
        message: `Default shipping charge of ₹${defaultCharge} successfully applied to all products and member cart!`,
      });
    }

    if (action === "UPDATE_PRODUCT") {
      const { productId, shippingCharge, isFreeShipping } = body;
      const charge = parseFloat(shippingCharge || "0");

      if (!productId) {
        return NextResponse.json(
          { success: false, message: "Product ID is required." },
          { status: 400 }
        );
      }

      await client.query(`
        UPDATE products 
        SET 
          shipping_charge = $1,
          is_free_shipping = $2
        WHERE id = $3
      `, [charge, Boolean(isFreeShipping), productId]);

      return NextResponse.json({
        success: true,
        message: "Product shipping charge updated successfully!",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action type provided." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin shipping POST error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update shipping settings." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
