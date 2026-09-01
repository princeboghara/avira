import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { exec } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized Admin" }, { status: 401 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", "sync_bot.js");

    return new Promise<NextResponse>((resolve) => {
      exec(`node "${scriptPath}" --single-run`, (error, stdout, stderr) => {
        if (error) {
          console.error("Sync bot execution error:", error);
          resolve(NextResponse.json({
            success: false,
            message: "Sync failed",
            error: error.message,
            output: stdout || stderr
          }, { status: 500 }));
        } else {
          resolve(NextResponse.json({
            success: true,
            message: "Sync cycle completed successfully!",
            output: stdout
          }));
        }
      });
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
