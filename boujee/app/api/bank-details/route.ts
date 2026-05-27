import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "bank-details.json");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

const DEFAULTS = {
  bankName: process.env.BANK_NAME || "First Bank of Nigeria",
  accountName: process.env.BANK_ACCOUNT_NAME || "Ball & Boujee",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
};

function readBankDetails() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return { ...DEFAULTS, ...JSON.parse(raw) };
    }
  } catch {
    console.error("Failed to read bank-details.json");
  }
  return { ...DEFAULTS };
}

function writeBankDetails(data: { bankName: string; accountName: string; accountNumber: string }) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write bank-details.json:", error);
    return false;
  }
}

async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data?.user?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  const data = readBankDetails();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const isAdmin = await verifyAdmin(token);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bankName, accountName, accountNumber } = body;

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const updated = { bankName, accountName, accountNumber };
    const saved = writeBankDetails(updated);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to save bank details. In production, update via environment variables instead." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update bank details" },
      { status: 500 }
    );
  }
}
