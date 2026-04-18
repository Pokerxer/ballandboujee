import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    let endpoint = "/products";
    
    if (action === 'bySlug' && slug) {
      endpoint = `/products/slug/${slug}`;
    } else if (category) {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!);
      endpoint = `/products?${params.toString()}`;
    } else {
      const queryParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== 'action') {
          queryParams.set(key, value);
        }
      });
      if (queryParams.toString()) {
        endpoint = `/products?${queryParams.toString()}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, ...data } = body;

    let endpoint = "/products";
    let method = "POST";

    if (action === "search") {
      endpoint = `/products?search=${encodeURIComponent(data.query)}`;
      method = "GET";
    } else if (action === "featured") {
      endpoint = "/products/featured";
      method = "GET";
    } else if (action === "bySlug") {
      endpoint = `/products/slug/${data.slug}`;
      method = "GET";
    } else if (action === "byId") {
      endpoint = `/products/${data.id}`;
      method = "GET";
    } else if (action === "create" || action === "update") {
      endpoint = action === "update" ? `/products/${data.id}` : "/products";
      method = action === "update" ? "PUT" : "POST";
    } else if (action === "delete") {
      endpoint = `/products/${data.id}`;
      method = "DELETE";
    } else if (action === "addReview") {
      endpoint = `/products/${data.productId}/reviews`;
      method = "POST";
    } else if (action === "getReviews") {
      endpoint = `/products/${data.productId}/reviews`;
      method = "GET";
    } else if (action === "deleteReview") {
      endpoint = `/products/${data.productId}/reviews/${data.reviewId}`;
      method = "DELETE";
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, token, ...data } = body;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers,
    });
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
