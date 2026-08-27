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
        id, 
        hsn_code, 
        sgst, 
        cgst, 
        igst, 
        description, 
        created_at
      FROM hsn_codes
      ORDER BY hsn_code ASC;
    `);

    const hsnCodes = res.rows.map((r) => ({
      id: r.id,
      hsnCode: r.hsn_code,
      sgst: parseFloat(r.sgst || "0"),
      cgst: parseFloat(r.cgst || "0"),
      igst: parseFloat(r.igst || "0"),
      description: r.description || "",
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, hsnCodes });
  } catch (error) {
    console.error("Fetch HSN error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch HSN codes" },
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
    const { id, hsnCode, sgst, cgst, igst, description } = body;

    if (!hsnCode || hsnCode.trim() === "") {
      return NextResponse.json(
        { success: false, message: "HSN code is required" },
        { status: 400 }
      );
    }

    const hsnId = id && id.trim() !== "" ? id : `hsn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedSgst = parseFloat(sgst?.toString() || "0");
    const parsedCgst = parseFloat(cgst?.toString() || "0");
    const parsedIgst = parseFloat(igst?.toString() || "0");

    await client.query(
      `
      INSERT INTO hsn_codes (id, hsn_code, sgst, cgst, igst, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        hsn_code = EXCLUDED.hsn_code,
        sgst = EXCLUDED.sgst,
        cgst = EXCLUDED.cgst,
        igst = EXCLUDED.igst,
        description = EXCLUDED.description;
    `,
      [hsnId, hsnCode.trim(), parsedSgst, parsedCgst, parsedIgst, description || ""]
    );

    return NextResponse.json({
      success: true,
      message: `HSN Code "${hsnCode}" saved successfully!`,
      hsnCode: {
        id: hsnId,
        hsnCode: hsnCode.trim(),
        sgst: parsedSgst,
        cgst: parsedCgst,
        igst: parsedIgst,
        description: description || "",
      },
    });
  } catch (error: any) {
    console.error("Save HSN error:", error);
    const msg = error.code === "23505" ? "An entry for this HSN code already exists." : "Failed to save HSN code.";
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
        { success: false, message: "HSN Code ID is required for deletion" },
        { status: 400 }
      );
    }

    await client.query("DELETE FROM hsn_codes WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "HSN Code deleted successfully!",
    });
  } catch (error) {
    console.error("Delete HSN error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete HSN code" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
