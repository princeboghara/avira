import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        p.id, 
        p.name, 
        p.category_id, 
        p.category_name, 
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
        p.created_at,
        h.sgst as hsn_sgst,
        h.cgst as hsn_cgst
      FROM products p
      LEFT JOIN hsn_codes h ON p.hsn_code = h.hsn_code
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
        categoryId: r.category_id || "",
        category: r.category_name || "General",
        hsnCode: r.hsn_code || "3004",
        hsnGst: calculatedGst,
        stock: r.stock_quantity !== null && r.stock_quantity !== undefined ? Number(r.stock_quantity) : 100,
        netQuantity: r.net_quantity || "1 Unit",
        mrp: parseFloat(r.mrp || "0"),
        amount: parseFloat(r.mrp || "0"),
        discountPrice: parseFloat(r.discount_price || r.mrp || "0"),
        pv: parseFloat(r.pv || "0"),
        imageUrl: r.image_url || "",
        description: r.description || "",
        inStock: Boolean(r.in_stock),
        tag: r.tag || `${r.pv} PV`,
        imageIcon: r.image_icon || "spa",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Fetch admin products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load products" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const {
      id,
      name,
      category,
      categoryId,
      hsnCode,
      netQuantity,
      mrp,
      discountPrice,
      pv,
      imageUrl,
      description,
      inStock,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Item / Product name is required" },
        { status: 400 }
      );
    }

    const prodId = id && id.trim() !== "" ? id : `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedMrp = parseFloat(mrp?.toString() || "0");
    const parsedDp = parseFloat(discountPrice?.toString() || "0");
    const parsedPv = parseFloat(pv?.toString() || "0");
    const isInStock = inStock !== undefined ? Boolean(inStock) : true;
    const tag = `${parsedPv} PV`;

    // Upload to Cloudinary folder 'products' if base64/data URI, otherwise retain URL
    const finalImageUrl = imageUrl ? await uploadToCloudinary(imageUrl, "products") : "";

    await client.query(
      `
      INSERT INTO products (
        id, name, category_id, category_name, hsn_code, net_quantity,
        mrp, discount_price, pv, image_url, description, in_stock, tag, image_icon
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category_id = EXCLUDED.category_id,
        category_name = EXCLUDED.category_name,
        hsn_code = EXCLUDED.hsn_code,
        net_quantity = EXCLUDED.net_quantity,
        mrp = EXCLUDED.mrp,
        discount_price = EXCLUDED.discount_price,
        pv = EXCLUDED.pv,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        in_stock = EXCLUDED.in_stock,
        tag = EXCLUDED.tag;
    `,
      [
        prodId,
        name.trim(),
        categoryId || "",
        category || "Cellular Nutrition",
        hsnCode || "",
        netQuantity || "1 Unit",
        parsedMrp,
        parsedDp,
        parsedPv,
        finalImageUrl || "",
        description || "",
        isInStock,
        tag,
        "spa",
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Product "${name}" saved successfully!`,
      product: {
        id: prodId,
        name: name.trim(),
        category: category || "Cellular Nutrition",
        categoryId,
        hsnCode,
        netQuantity,
        mrp: parsedMrp,
        discountPrice: parsedDp,
        pv: parsedPv,
        imageUrl: finalImageUrl,
        description,
        inStock: isInStock,
      },
    });
  } catch (error) {
    console.error("Save product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save product" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let ids: string[] = [];

    try {
      const body = await req.json();
      if (body) {
        if (body.id) id = body.id;
        if (Array.isArray(body.ids)) ids = body.ids;
      }
    } catch {
      // Body is empty when called with query params
    }

    if (!id && ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product ID is required for deletion" },
        { status: 400 }
      );
    }

    if (ids.length > 0) {
      await client.query("DELETE FROM products WHERE id = ANY($1)", [ids]);
    } else if (id) {
      await client.query("DELETE FROM products WHERE id = $1", [id]);
    }

    return NextResponse.json({
      success: true,
      message: "Product(s) deleted successfully from catalog!",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
