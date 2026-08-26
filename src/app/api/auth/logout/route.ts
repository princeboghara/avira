import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete("avira_access_token");
  response.cookies.delete("avira_refresh_token");

  return response;
}
