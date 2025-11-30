import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch orders only for this user, sorted by newest first
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("MyOrders API Error:", error);
    return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 });
  }
}