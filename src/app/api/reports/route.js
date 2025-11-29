import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Expense from "@/models/Expense";
import User from "@/models/User"; // Import User model to populate data

export async function GET() {
  await connectDB();
  
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const monthlyOrders = await Order.find({
      paymentStatus: "paid", // Only count paid orders
      createdAt: { $gte: startOfMonth }
    });

    const todaysOrders = monthlyOrders.filter(o => new Date(o.createdAt) >= startOfDay);

    const monthlyExpenses = await Expense.find({
      date: { $gte: startOfMonth }
    }).sort({ date: -1 });

    // 👇 UPDATED: Fetch Recent Sales WITH Customer Details
    const recentSales = await Order.find({ paymentStatus: "paid" })
        .sort({ createdAt: -1 })
        .limit(20) // Increased limit to see more history
        .populate("userId", "name phone"); // <--- Magic line to get User details

    // Calculations
    const todayRevenue = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = monthRevenue - totalExpenses;

    return NextResponse.json({
      todayRevenue,
      todayOrdersCount: todaysOrders.length,
      monthRevenue,
      totalExpenses,
      netProfit,
      expenses: monthlyExpenses,
      recentSales: recentSales // Return populated sales
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const newExpense = await Expense.create(body);
    return NextResponse.json(newExpense);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}

// 👇 NEW: DELETE EXPENSE
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Expense.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}