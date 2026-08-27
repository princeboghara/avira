import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

interface TreeNodeData {
  id: string;
  memberId: string;
  fullName: string;
  avatarUrl?: string;
  status: string;
  personalPv: number;
  leftPv: number;
  rightPv: number;
  carryLeftPv: number;
  carryRightPv: number;
  sponsorId: string;
  activationDate: string;
  position?: "LEFT" | "RIGHT" | "ROOT";
  leftChild?: TreeNodeData | null;
  rightChild?: TreeNodeData | null;
  hasMoreChildren?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetRoot = (searchParams.get("root") || session.memberId).trim().toUpperCase();
    const maxDepth = Math.min(Number(searchParams.get("depth") || 3), 4);

    const client = await pool.connect();
    try {
      // Build tree recursively
      async function buildNode(memberIdOrId: string, currentDepth: number): Promise<TreeNodeData | null> {
        const res = await client.query(
          `SELECT id, member_id, full_name, avatar_url, status, personal_pv,
                  left_pv, right_pv, carry_left_pv, carry_right_pv, sponsor_id,
                  joined_date, created_at, binary_position, left_child_id, right_child_id
           FROM users
           WHERE UPPER(member_id) = UPPER($1) OR id = $1
           LIMIT 1`,
          [memberIdOrId]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        const pPv = parseFloat(row.personal_pv || "0");
        const status = pPv >= 100 ? "ACTIVE" : "INACTIVE";

        const hasLeft = Boolean(row.left_child_id);
        const hasRight = Boolean(row.right_child_id);

        let leftChild: TreeNodeData | null = null;
        let rightChild: TreeNodeData | null = null;

        if (currentDepth < maxDepth) {
          if (row.left_child_id) {
            leftChild = await buildNode(row.left_child_id, currentDepth + 1);
          }
          if (row.right_child_id) {
            rightChild = await buildNode(row.right_child_id, currentDepth + 1);
          }
        }

        return {
          id: row.id,
          memberId: row.member_id,
          fullName: row.full_name,
          avatarUrl: row.avatar_url || "",
          status,
          personalPv: pPv,
          leftPv: parseFloat(row.left_pv || "0"),
          rightPv: parseFloat(row.right_pv || "0"),
          carryLeftPv: parseFloat(row.carry_left_pv || "0"),
          carryRightPv: parseFloat(row.carry_right_pv || "0"),
          sponsorId: row.sponsor_id || "None",
          activationDate: row.joined_date || (row.created_at ? new Date(row.created_at).toISOString() : "Recent"),
          position: row.binary_position || "ROOT",
          leftChild,
          rightChild,
          hasMoreChildren: (hasLeft && !leftChild) || (hasRight && !rightChild),
        };
      }

      const tree = await buildNode(targetRoot, 1);
      if (!tree) {
        return NextResponse.json(
          { success: false, message: `Member ID ${targetRoot} not found in database.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        tree,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error generating binary tree:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
