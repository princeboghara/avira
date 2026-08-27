import { NextRequest, NextResponse } from "next/server";
import { getBinaryTree } from "@/lib/binary";
import { getSession, getAdminSession } from "@/lib/auth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { id } = await params;

  const [memberSession, adminSession] = await Promise.all([
    getSession(req),
    getAdminSession(req),
  ]);

  if (!memberSession && !adminSession) {
    return NextResponse.json(
      { success: false, message: "Authentication required to view binary tree" },
      { status: 401 }
    );
  }

  try {
    const tree = await getBinaryTree(id, 4); // Fetch 4 levels deep

    if (!tree) {
      return NextResponse.json(
        { success: false, message: `Member ${id} not found in binary tree` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tree,
    });
  } catch (error) {
    console.error("Binary tree fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch binary tree" },
      { status: 500 }
    );
  }
}
