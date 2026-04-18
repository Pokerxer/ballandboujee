import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bad-boujee-server.vercel.app/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "API request failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to connect to API" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  return fetchAPI(`/${route.join("/")}`, { method: "GET" });
}

export async function POST(request: Request, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const body = await request.json();
  return fetchAPI(`/${route.join("/")}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const body = await request.json();
  return fetchAPI(`/${route.join("/")}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  return fetchAPI(`/${route.join("/")}`, { method: "DELETE" });
}
