import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

const ACTION_MAP: Record<string, string> = {
  login: "/auth/login",
  register: "/auth/register",
  "forgot-password": "/auth/forgot-password",
  "reset-password": "/auth/reset-password",
  getMe: "/auth/me",
  getWishlist: "/auth/me",
};

export async function POST(request: Request, { params }: { params: Promise<{ auth?: string[] }> }) {
  try {
    const { auth } = await params;
    const body = await request.json();

    // action from URL path (e.g. /api/auth/login) or from body (e.g. { action: "getMe" })
    const action = auth?.[0] || body.action;
    const endpoint = ACTION_MAP[action] || `/auth/${action}`;
    const isGet = action === "getMe" || action === "getWishlist";

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = body.token || auth?.[1];
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: isGet ? "GET" : "POST",
      headers,
      body: isGet ? undefined : JSON.stringify(body),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
