import { NextResponse } from 'next/server';
import  connectDB  from '@/lib/db';
import Order from '@/models/Order';
export const dynamic = 'force-dynamic'

// 1. GET: Fetch Order Details for the Payment Page
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // FIX: Await params in Next.js 15+
    const { id } = await params;
    
    const order = await Order.findById(id).select('totalAmount tableNo paymentStatus _id');

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Error fetching order for payment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 2. PUT: Handle "Verify Payment" (User enters UTR)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    // FIX: Await params in Next.js 15+
    const { id } = await params;
    
    const { utr } = await request.json();

    if (!utr) {
      return NextResponse.json({ error: "UTR is required" }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        paymentStatus: 'paid',
        'razorpay.paymentId': utr 
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });

  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}