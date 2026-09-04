import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        p.id, 
        p.name, 
        p.category_name as category, 
        p.hsn_code,
        p.net_quantity, 
        p.mrp, 
        p.discount_price, 
        p.pv, 
        p.image_url, 
        p.description, 
        p.in_stock, 
        p.tag, 
        p.image_icon,
        h.sgst as hsn_sgst,
        h.cgst as hsn_cgst
      FROM products p
      LEFT JOIN hsn_codes h ON p.hsn_code = h.hsn_code
      WHERE p.in_stock = true
      ORDER BY p.created_at DESC;
    `);

    const products = res.rows.map((r) => {
      const calculatedGst =
        r.hsn_sgst !== null && r.hsn_sgst !== undefined && r.hsn_cgst !== null && r.hsn_cgst !== undefined
          ? Number(r.hsn_sgst) + Number(r.hsn_cgst)
          : 5.0;

      return {
        id: r.id,
        name: r.name,
        category: r.category || "Cellular Nutrition",
        hsnCode: r.hsn_code || "3004",
        gstRate: calculatedGst,
        netQuantity: r.net_quantity || "1 Unit",
        mrp: parseFloat(r.mrp || "0"),
        discountPrice: parseFloat(r.discount_price || "0"),
        pv: parseFloat(r.pv || "0"),
        imageUrl: r.image_url || "",
        description: r.description || "",
        inStock: Boolean(r.in_stock),
        tag: r.tag || `${r.pv} PV`,
        imageIcon: r.image_icon || "spa",
      };
    });

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
