import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM products 
       WHERE id = $1 
          OR slug = $1 
          OR slug = REPLACE($1, 'prod_', '')
          OR id = 'prod_' || $1
       LIMIT 1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const r = res.rows[0];
    const product = {
      id: r.id,
      name: r.name,
      slug: r.slug,
      categoryId: r.category_id || "",
      category: r.category_name || r.category || "General",
      hsnCode: r.hsn_code || "3004",
      hsnGst: 5.0,
      stock: r.stock_quantity !== null && r.stock_quantity !== undefined ? Number(r.stock_quantity) : (r.stock || 100),
      netQuantity: r.net_quantity || "1 Unit",
      mrp: parseFloat(r.mrp || "0"),
      amount: parseFloat(r.mrp || "0"),
      dp: parseFloat(r.dp || r.discount_price || r.mrp || "0"),
      discountPrice: parseFloat(r.discount_price || r.dp || r.mrp || "0"),
      pv: parseFloat(r.pv || "0"),
      imageUrl: r.image_url || "",
      description: r.description || "",
      inStock: Boolean(r.in_stock),
      isActive: Boolean(r.is_active !== false),
      tag: r.tag || `${r.pv} PV`,
      imageIcon: r.image_icon || "spa",
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Fetch single product error:", error);
    return NextResponse.json({ success: false, message: "Failed to load product" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();
  try {
    const body = await req.json();
    const {
      name,
      category,
      categoryId,
      hsnCode,
      netQuantity,
      mrp,
      dp,
      discountPrice,
      pv,
      imageUrl,
      description,
      stock,
      inStock,
      isActive,
      tag,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "Product name is required" }, { status: 400 });
    }

    const parsedMrp = parseFloat(mrp?.toString() || "0");
    const parsedDp = parseFloat((dp || discountPrice)?.toString() || "0");
    const parsedPv = parseFloat(pv?.toString() || "0");
    const parsedStock = parseInt(stock?.toString() || "100", 10);
    const isInStock = inStock !== undefined ? Boolean(inStock) : true;
    const active = isActive !== undefined ? Boolean(isActive) : true;
    const finalTag = tag || (parsedPv >= 100 ? "Bestseller" : "Popular");

    const finalImageUrl = imageUrl && imageUrl.startsWith("data:") 
      ? await uploadToCloudinary(imageUrl, "products") 
      : (imageUrl || "");

    await client.query(
      `
      UPDATE products SET
        name = $1,
        category = $2,
        category_name = $2,
        category_id = $3,
        hsn_code = $4,
        net_quantity = $5,
        mrp = $6,
        dp = $7,
        discount_price = $7,
        pv = $8,
        image_url = $9,
        description = $10,
        stock = $11,
        stock_quantity = $11,
        in_stock = $12,
        is_active = $13,
        tag = $14
      WHERE id = $15
    `,
      [
        name.trim(),
        category || "Health & Wellness",
        categoryId || "",
        hsnCode || "30049011",
        netQuantity || "1 Unit",
        parsedMrp,
        parsedDp,
        parsedPv,
        finalImageUrl,
        description || "",
        parsedStock,
        isInStock,
        active,
        finalTag,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Product "${name}" updated successfully!`,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  } finally {
    client.release();
  }
}
