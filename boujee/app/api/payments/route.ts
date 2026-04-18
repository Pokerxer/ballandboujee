import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, ...data } = body;

    let endpoint = "/payments";
    let method = "POST";

    if (action === "stripeCreateIntent") {
      endpoint = "/payments/stripe/create-intent";
    } else if (action === "stripeVerify") {
      endpoint = "/payments/stripe/verify";
    } else if (action === "paystackInitialize") {
      endpoint = "/payments/paystack/initialize";
    } else if (action === "paystackVerify") {
      endpoint = "/payments/paystack/verify";
    } else if (action === "paystackCreateRecipient") {
      endpoint = "/payments/paystack/create-recipient";
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process payment request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let endpoint = "/payments";

    if (action === "getBanks") {
      endpoint = "/payments/paystack/banks";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment data" },
      { status: 500 }
    );
  }
}
