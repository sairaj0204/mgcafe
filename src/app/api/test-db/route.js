import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "Database Connected Successfully! 🚀" });
  } catch (error) {
    return NextResponse.json({ error: "Connection Failed", details: error.message }, { status: 500 });
  }
}