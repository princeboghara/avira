import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.created_at, 
        COUNT(p.id) as item_count
      FROM categories c
      LEFT JOIN products p ON LOWER(p.category_name) = LOWER(c.name)
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.created_at ASC;
    `);

    const categories = res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      itemCount: parseInt(r.item_count || "0", 10),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
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
    const { id, name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const catId = id && id.trim() !== "" ? id : `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Upsert category
    await client.query(
      `
      INSERT INTO categories (id, name, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `,
      [catId, name.trim(), description || ""]
    );

    return NextResponse.json({
      success: true,
      message: `Category "${name}" saved successfully!`,
      category: { id: catId, name: name.trim(), description: description || "" },
    });
  } catch (error: any) {
    console.error("Save category error:", error);
    const msg = error.code === "23505" ? "A category with this name already exists." : "Failed to save category.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req);
  if (auth.errorResponse) return auth.errorResponse;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category ID is required for deletion" },
        { status: 400 }
      );
    }

    await client.query("DELETE FROM categories WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully!",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
