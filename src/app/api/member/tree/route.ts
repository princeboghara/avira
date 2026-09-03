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
  totalTeamCount?: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const nodeParam = searchParams.get("node");
    let targetRoot = (
      nodeParam ||
      searchParams.get("root") ||
      searchParams.get("rootId") ||
      searchParams.get("id") ||
      (session.role === "ADMIN" ? "AV0001" : session.memberId)
    ).trim().toUpperCase();

    if (targetRoot === "ADMIN") {
      targetRoot = "AV0001";
    }

    const searchTarget = searchParams.get("search")?.trim().toUpperCase() || null;
    const requestedDepth = Math.min(Math.max(Number(searchParams.get("depth") || 3), 1), 5);

    const client = await pool.connect();
    try {
      let treeRes: any;
      let expandedNodeIds: string[] = [];
      let foundSearchTarget: string | null = null;

      if (searchTarget) {
        // --- SEARCH MODE: Expand entire tree from targetRoot down to searched member ---
        const userExists = await client.query(
          "SELECT id, member_id, full_name FROM users WHERE (UPPER(member_id) = UPPER($1) OR id = $1) AND role != 'ADMIN' LIMIT 1",
          [searchTarget]
        );
        if (userExists.rows.length === 0) {
          return NextResponse.json(
            { success: false, message: `Member ID "${searchTarget}" not found.` },
            { status: 404 }
          );
        }

        const ancestorsRes = await client.query(
          `
          WITH RECURSIVE ancestors AS (
            SELECT u.id, u.member_id, u.full_name, b.binary_parent_id, 1 as depth
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            WHERE (UPPER(u.member_id) = UPPER($1) OR u.id = $1)

            UNION ALL

            SELECT u.id, u.member_id, u.full_name, b.binary_parent_id, a.depth + 1
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            INNER JOIN ancestors a ON u.id = a.binary_parent_id
            WHERE u.role != 'ADMIN'
          )
          SELECT id, member_id, full_name, binary_parent_id, depth FROM ancestors ORDER BY depth DESC;
          `,
          [searchTarget]
        );

        const ancestorMemberIds = ancestorsRes.rows.map((r) => r.member_id);
        const ancestorUserIds = ancestorsRes.rows.map((r) => r.id);

        if (session.role !== "ADMIN" && !ancestorMemberIds.includes(session.memberId)) {
          return NextResponse.json(
            {
              success: false,
              message: `Member ID "${searchTarget}" is not in your downline network.`,
            },
            { status: 403 }
          );
        }

        expandedNodeIds = [...ancestorUserIds, ...ancestorMemberIds];
        foundSearchTarget = userExists.rows[0].member_id;

        treeRes = await client.query(
          `
          WITH RECURSIVE ancestors AS (
            SELECT u.id, u.member_id, b.binary_parent_id, 1 as depth
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            WHERE (UPPER(u.member_id) = UPPER($1) OR u.id = $1)

            UNION ALL

            SELECT u.id, u.member_id, b.binary_parent_id, a.depth + 1
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            INNER JOIN ancestors a ON u.id = a.binary_parent_id
            WHERE u.role != 'ADMIN'
          ),
          root_seed AS (
            SELECT u.id, u.member_id, b.left_child_id, b.right_child_id, 1 as depth
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            WHERE (UPPER(u.member_id) = UPPER($2) OR u.id = $2)

            UNION ALL

            SELECT u.id, u.member_id, b.left_child_id, b.right_child_id, rs.depth + 1
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            INNER JOIN root_seed rs ON (u.id = rs.left_child_id OR u.id = rs.right_child_id)
            WHERE rs.depth < 3
          ),
          ancestor_children AS (
            SELECT b.left_child_id as child_id FROM ancestors a JOIN user_binary_pv b ON a.id = b.user_id WHERE b.left_child_id IS NOT NULL
            UNION
            SELECT b.right_child_id as child_id FROM ancestors a JOIN user_binary_pv b ON a.id = b.user_id WHERE b.right_child_id IS NOT NULL
          ),
          all_needed_ids AS (
            SELECT id FROM ancestors
            UNION
            SELECT child_id AS id FROM ancestor_children
            UNION
            SELECT id FROM root_seed
          )
          SELECT 
            u.id, u.member_id, u.full_name, u.avatar_url, u.status, u.sponsor_id, u.sponsor_name, u.joined_date, u.created_at,
            b.personal_pv, b.left_pv, b.right_pv, b.carry_left_pv, b.carry_right_pv, b.binary_position, b.binary_parent_id, b.left_child_id, b.right_child_id,
            p.member_id as parent_member_id,
            COALESCE(w.total_team_count, 0) AS total_team_count,
            1 AS depth
          FROM all_needed_ids ani
          JOIN users u ON ani.id = u.id
          JOIN user_binary_pv b ON u.id = b.user_id
          LEFT JOIN users p ON b.binary_parent_id = p.id
          LEFT JOIN user_wallets w ON u.id = w.user_id
          WHERE u.role != 'ADMIN';
          `,
          [searchTarget, targetRoot]
        );
      } else {
        // --- NORMAL MODE: Enforce Downline Access Control ---
        if (session.role !== "ADMIN" && targetRoot !== session.memberId) {
          const downlineCheck = await client.query(
            `
            WITH RECURSIVE my_downline AS (
              SELECT u.id, u.member_id, b.left_child_id, b.right_child_id
              FROM users u
              JOIN user_binary_pv b ON u.id = b.user_id
              WHERE UPPER(u.member_id) = UPPER($1)

              UNION ALL

              SELECT u.id, u.member_id, b.left_child_id, b.right_child_id
              FROM users u
              JOIN user_binary_pv b ON u.id = b.user_id
              INNER JOIN my_downline md ON (u.id = md.left_child_id OR u.id = md.right_child_id)
            )
            SELECT 1 FROM my_downline WHERE UPPER(member_id) = UPPER($2) LIMIT 1;
          `,
            [session.memberId, targetRoot]
          );

          if (downlineCheck.rows.length === 0) {
            return NextResponse.json(
              {
                success: false,
                message: `Member ID "${targetRoot}" is not in your downline network. You can only view members within your team.`,
              },
              { status: 403 }
            );
          }
        }

        // Fetch tree up to requestedDepth
        treeRes = await client.query(
          `
          WITH RECURSIVE tree_nodes AS (
            SELECT 
              u.id, u.member_id, u.full_name, u.avatar_url, u.status, u.sponsor_id, u.sponsor_name, u.joined_date, u.created_at,
              b.personal_pv, b.left_pv, b.right_pv, b.carry_left_pv, b.carry_right_pv, b.binary_position, b.binary_parent_id, b.left_child_id, b.right_child_id,
              p.member_id as parent_member_id,
              COALESCE(w.total_team_count, 0) AS total_team_count,
              1 AS depth
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            LEFT JOIN users p ON b.binary_parent_id = p.id
            LEFT JOIN user_wallets w ON u.id = w.user_id
            WHERE (UPPER(u.member_id) = UPPER($1) OR u.id = $1) AND u.role != 'ADMIN'

            UNION ALL

            SELECT 
              u.id, u.member_id, u.full_name, u.avatar_url, u.status, u.sponsor_id, u.sponsor_name, u.joined_date, u.created_at,
              b.personal_pv, b.left_pv, b.right_pv, b.carry_left_pv, b.carry_right_pv, b.binary_position, b.binary_parent_id, b.left_child_id, b.right_child_id,
              tn.member_id as parent_member_id,
              COALESCE(w.total_team_count, 0) AS total_team_count,
              tn.depth + 1
            FROM users u
            JOIN user_binary_pv b ON u.id = b.user_id
            LEFT JOIN user_wallets w ON u.id = w.user_id
            INNER JOIN tree_nodes tn ON (u.id = tn.left_child_id OR u.id = tn.right_child_id)
            WHERE tn.depth < $2 AND u.role != 'ADMIN'
          )
          SELECT * FROM tree_nodes;
        `,
          [targetRoot, requestedDepth]
        );
      }

      if (!treeRes || treeRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: `Member node "${targetRoot}" was not found.` },
          { status: 404 }
        );
      }

      // 2. Build tree hierarchy in-memory from the result set
      const nodeMap = new Map<string, any>();
      for (const row of treeRes.rows) {
        const pPv = parseFloat(row.personal_pv || "0");
        const status = pPv >= 100 ? "ACTIVE" : "INACTIVE";
        const hasLeft = Boolean(row.left_child_id);
        const hasRight = Boolean(row.right_child_id);

        nodeMap.set(row.id, {
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
          totalTeamCount: Number(row.total_team_count || 0),
          sponsorId: row.sponsor_id || "AV0001",
          sponsorName: row.sponsor_name || "Avira LifeCare",
          activationDate: row.joined_date || (row.created_at ? new Date(row.created_at).toISOString() : "Recent"),
          position: (row.binary_position || "ROOT").toUpperCase() as any,
          hasLeftChild: hasLeft,
          hasRightChild: hasRight,
          leftChildId: row.left_child_id,
          rightChildId: row.right_child_id,
          parentMemberId: row.parent_member_id || null,
          depth: row.depth,
        });
      }

      function constructNode(nodeId: string, currentDepth: number): TreeNodeData | null {
        const item = nodeMap.get(nodeId);
        if (!item) return null;

        let leftChild: TreeNodeData | null = null;
        let rightChild: TreeNodeData | null = null;

        const shouldTraverse = searchTarget ? true : currentDepth < requestedDepth;

        if (shouldTraverse) {
          if (item.leftChildId && nodeMap.has(item.leftChildId)) {
            leftChild = constructNode(item.leftChildId, currentDepth + 1);
          }
          if (item.rightChildId && nodeMap.has(item.rightChildId)) {
            rightChild = constructNode(item.rightChildId, currentDepth + 1);
          }
        }

        return {
          id: item.id,
          memberId: item.memberId,
          fullName: item.fullName,
          avatarUrl: item.avatarUrl,
          status: item.status,
          personalPv: item.personalPv,
          leftPv: item.leftPv,
          rightPv: item.rightPv,
          carryLeftPv: item.carryLeftPv,
          carryRightPv: item.carryRightPv,
          leftTeamCount: item.leftTeamCount,
          rightTeamCount: item.rightTeamCount,
          totalTeamCount: item.totalTeamCount,
          sponsorId: item.sponsorId,
          sponsorName: item.sponsorName,
          activationDate: item.activationDate,
          position: item.position,
          leftChild,
          rightChild,
          hasLeftChild: item.hasLeftChild,
          hasRightChild: item.hasRightChild,
          hasMoreChildren: (item.hasLeftChild && !leftChild) || (item.hasRightChild && !rightChild),
          parentMemberId: item.parentMemberId,
        };
      }

      const rootRow =
        nodeMap.get(targetRoot) ||
        Array.from(nodeMap.values()).find((n: any) => n.memberId.toUpperCase() === targetRoot.toUpperCase()) ||
        treeRes.rows[0];

      const tree = constructNode(rootRow.id, 1);

      // 3. Fetch ancestor breadcrumb path from Root down to targetRoot
      const breadcrumbsRes = await client.query(
        `
        WITH RECURSIVE ancestors AS (
          SELECT u.id, u.member_id, u.full_name, b.binary_parent_id, b.binary_position, 1 as depth
          FROM users u
          JOIN user_binary_pv b ON u.id = b.user_id
          WHERE (UPPER(u.member_id) = UPPER($1) OR u.id = $1) AND u.role != 'ADMIN'

          UNION ALL

          SELECT u.id, u.member_id, u.full_name, b.binary_parent_id, b.binary_position, a.depth + 1
          FROM users u
          JOIN user_binary_pv b ON u.id = b.user_id
          INNER JOIN ancestors a ON u.id = a.binary_parent_id
          WHERE u.role != 'ADMIN'
        )
        SELECT member_id, full_name, binary_position, depth 
        FROM ancestors 
        ORDER BY depth DESC;
      `,
        [rootRow.member_id]
      );

      const breadcrumbs = breadcrumbsRes.rows.map((r) => ({
        memberId: r.member_id,
        fullName: r.full_name,
        position: r.binary_position,
      }));

      if (!tree) {
        return NextResponse.json({ success: false, message: "Tree root not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        tree,
        breadcrumbs,
        parentMemberId: tree.parentMemberId || null,
        totalTeamCount: Number(rootRow.total_team_count || 0),
        expandedNodeIds,
        targetMemberId: foundSearchTarget,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error generating binary tree:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
