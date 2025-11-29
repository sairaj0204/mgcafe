import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();
    const { action, phone, otp, name } = await request.json();

    // --- 1. SEND OTP (Simulated) ---
    if (action === "send_otp") {
      // Check if user exists, if not create them
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ 
            phone, 
            name: name || "New User",
            isVerified: false 
        });
      }
      
      // In a real app, we would send SMS here.
      // For now, we do nothing because the code is always 123456.
      return NextResponse.json({ message: "OTP sent successfully" });
    }

    // --- 2. VERIFY OTP (Static Check) ---
    if (action === "verify_otp") {
      // THE BACKDOOR: Check if OTP is 123456
      if (otp === "123456") {
        
        // Find and update user
        const user = await User.findOneAndUpdate(
            { phone },
            { isVerified: true },
            { new: true } // Return updated doc
        );

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({ 
          message: "Login successful", 
          user: { _id: user._id, phone: user.phone, role: user.role, name: user.name } 
        });
      } else {
        return NextResponse.json({ error: "Invalid OTP (Hint: Use 123456)" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}