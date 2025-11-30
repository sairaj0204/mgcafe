import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Table from "@/models/Table";
import User from "@/models/User"; 


// 1. GET ORDERS (For Admin)
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = {};
  if (status === "active") {
    // Fetch everything EXCEPT completed/cancelled
    query = { status: { $nin: ["completed", "cancelled"] } };
  }

  // Fetch Orders AND populate User details (Name/Phone)
  const orders = await Order.find(query)
    .populate("userId", "name phone") 
    .sort({ createdAt: -1 });

  return NextResponse.json(orders);
}

// 2. CREATE ORDER (For Checkout)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // 👇 SECURITY UPDATE: Force correct payment status
    // If Cash -> Pending. If Online -> Paid.
    const orderData = {
        ...body,
        paymentStatus: body.paymentMethod === "cash" ? "pending" : "paid"
    };

    // A. Create the Order
    const newOrder = await Order.create(orderData);

    // B. AUTO-LOCK THE TABLE (Mark as Occupied)
    await Table.findOneAndUpdate(
      { tableNo: body.tableNo },
      { status: "occupied", occupiedAt: new Date() }
    );

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. UPDATE ORDER (For Admin Actions)
export async function PUT(request) {
  try {
    await connectDB();
    const { orderId, status, paymentStatus } = await request.json();

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}