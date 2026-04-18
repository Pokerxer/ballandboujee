import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    let endpoint = "/events";
    if (type === "upcoming") endpoint = "/events/upcoming";
    if (type === "featured") endpoint = "/events/featured";

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, eventId, ...data } = body;

    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
