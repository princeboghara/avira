import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export interface TreeNodeData {
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
  leftTeamCount: number;
  rightTeamCount: number;
  sponsorId: string;
  sponsorName: string;
  activationDate: string;
  position?: "LEFT" | "RIGHT" | "TOP" | "ROOT";
  leftChild?: TreeNodeData | null;
  rightChild?: TreeNodeData | null;
  hasLeftChild: boolean;
  hasRightChild: boolean;
  hasMoreChildren: boolean;
  parentMemberId?: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const nodeParam = searchParams.get("node");
    const targetRoot = (nodeParam || searchParams.get("root") || session.memberId).trim().toUpperCase();
    const requestedDepth = Math.min(Math.max(Number(searchParams.get("depth") || 3), 1), 5);

    const client = await pool.connect();
    try {
      // 1. Recursive helper to build tree nodes up to maxDepth
      async function buildNode(memberIdOrId: string, currentDepth: number): Promise<TreeNodeData | null> {
        const res = await client.query(
          `SELECT u.id, u.member_id, u.full_name, u.avatar_url, u.status, u.personal_pv,
                  u.left_pv, u.right_pv, u.carry_left_pv, u.carry_right_pv,
                  u.sponsor_id, u.sponsor_name,
                  u.total_team_count,
                  u.joined_date, u.created_at, u.binary_position, u.binary_parent_id,
                  u.left_child_id, u.right_child_id,
                  p.member_id as parent_member_id
           FROM users u
           LEFT JOIN users p ON u.binary_parent_id = p.id
           WHERE UPPER(u.member_id) = UPPER($1) OR u.id = $1
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

        if (currentDepth < requestedDepth) {
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
          leftTeamCount: row.left_pv ? Math.round(parseFloat(row.left_pv) / 100) : 0,
          rightTeamCount: row.right_pv ? Math.round(parseFloat(row.right_pv) / 100) : 0,
          sponsorId: row.sponsor_id || "AV0001",
          sponsorName: row.sponsor_name || "Avira LifeCare",
          activationDate: row.joined_date || (row.created_at ? new Date(row.created_at).toISOString() : "Recent"),
          position: (row.binary_position || "ROOT").toUpperCase() as any,
          leftChild,
          rightChild,
          hasLeftChild: hasLeft,
          hasRightChild: hasRight,
          hasMoreChildren: (hasLeft && !leftChild) || (hasRight && !rightChild),
          parentMemberId: row.parent_member_id || null,
        };
      }

      const tree = await buildNode(targetRoot, 1);
      if (!tree) {
        return NextResponse.json(
          { success: false, message: `Member ID ${targetRoot} not found in database.` },
          { status: 404 }
        );
      }

      // 2. Fetch ancestor breadcrumb path from Root down to targetRoot
      const breadcrumbsRes = await client.query(
        `
        WITH RECURSIVE ancestors AS (
          SELECT id, member_id, full_name, binary_parent_id, binary_position, 1 as depth
          FROM users
          WHERE UPPER(member_id) = UPPER($1)
          UNION ALL
          SELECT u.id, u.member_id, u.full_name, u.binary_parent_id, u.binary_position, a.depth + 1
          FROM users u
          INNER JOIN ancestors a ON u.id = a.binary_parent_id
        )
        SELECT member_id, full_name, binary_position, depth 
        FROM ancestors 
        ORDER BY depth DESC;
      `,
        [targetRoot]
      );

      const breadcrumbs = breadcrumbsRes.rows.map((r) => ({
        memberId: r.member_id,
        fullName: r.full_name,
        position: r.binary_position,
      }));

      return NextResponse.json({
        success: true,
        tree,
        breadcrumbs,
        parentMemberId: tree.parentMemberId,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error generating binary tree:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
