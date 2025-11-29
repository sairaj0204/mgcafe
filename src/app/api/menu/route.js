import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MenuItem from "@/models/MenuItem";

export async function GET() {
  try {
    await connectDB();
    // Fetch all items, sorted by category for neatness
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}