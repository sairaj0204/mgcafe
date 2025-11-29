import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Table from "@/models/Table";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch all tables
    let tables = await Table.find().sort({ tableNo: 1 });

    // 2. THE "AUTO-RESET" LOGIC
    // Check if any table has been occupied for more than 1 hour
    const now = new Date();
    const ONE_HOUR = 60 * 60 * 1000; // 1 Hour in milliseconds

    // We use Promise.all to check and update tables in parallel
    const updatedTables = await Promise.all(tables.map(async (table) => {
        
        // If table is occupied AND has a timestamp
        if (table.status === "occupied" && table.occupiedAt) {
            const timePassed = now.getTime() - new Date(table.occupiedAt).getTime();
            
            // If more than 1 hour passed, Free it automatically
            if (timePassed > ONE_HOUR) {
                table.status = "available";
                table.occupiedAt = null;
                await table.save(); // Save changes to DB
            }
        }
        return table;
    }));

    return NextResponse.json(updatedTables);

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

// 3. MANUAL UPDATE (Used by Admin Page)
export async function PUT(request) {
    try {
        await connectDB();
        const { tableNo, action } = await request.json(); // action = "occupy" or "free"

        const updateData = action === "occupy" 
            ? { status: "occupied", occupiedAt: new Date() }
            : { status: "available", occupiedAt: null };

        const table = await Table.findOneAndUpdate(
            { tableNo },
            updateData,
            { new: true }
        );

        return NextResponse.json(table);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}