import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bad-boujee-server.vercel.app/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    let endpoint = "/auth/register";
    let method = "POST";

    if (action === "login") {
      endpoint = "/auth/login";
    } else if (action === "getMe") {
      endpoint = "/auth/me";
      method = "GET";
    } else if (action === "getWishlist") {
      endpoint = "/auth/me";
      method = "GET";
    } else if (action === "wishlist") {
      endpoint = `/auth/wishlist/${data.productId}`;
      method = "PUT";
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (data.token) {
      headers["Authorization"] = `Bearer ${data.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(data) : undefined,
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
