import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        id, 
        name, 
        category_name as category, 
        hsn_code,
        net_quantity, 
        mrp, 
        discount_price, 
        pv, 
        image_url, 
        description, 
        in_stock, 
        tag, 
        image_icon
      FROM products
      WHERE in_stock = true
      ORDER BY created_at DESC;
    `);

    const products = res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category || "Cellular Nutrition",
      hsnCode: r.hsn_code || "",
      netQuantity: r.net_quantity || "1 Unit",
      mrp: parseFloat(r.mrp || "0"),
      discountPrice: parseFloat(r.discount_price || "0"),
      pv: parseFloat(r.pv || "0"),
      imageUrl: r.image_url || "",
      description: r.description || "",
      inStock: Boolean(r.in_stock),
      tag: r.tag || `${r.pv} PV`,
      imageIcon: r.image_icon || "spa",
    }));

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load products", products: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } finally {
    client.release();
  }
}
