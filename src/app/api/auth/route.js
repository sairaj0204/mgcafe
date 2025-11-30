import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();
    const { action, phone, otp, name } = await request.json();

    // --- 1. SEND OTP (SIMULATED) ---
    if (action === "send_otp") {
      let user = await User.findOne({ phone });
      
      if (!user) {
        user = await User.create({ 
            phone, 
            name: name || "Guest User",
            isVerified: false,
            role: "user"
        });
      }

      // Generate 4-digit OTP
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Save to DB
      user.otp = generatedOtp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
      await user.save();

      // Return OTP to Frontend for Alert (Simulation)
      return NextResponse.json({ 
          message: "OTP Generated", 
          debug_code: generatedOtp 
      });
    }

    // --- 2. VERIFY OTP ---
    if (action === "verify_otp") {
      // Backdoor for testing
      if (otp === "1112") {
         const user = await User.findOneAndUpdate(
             { phone }, 
             { isVerified: true }, 
             { new: true }
         );
         return NextResponse.json({ message: "Login successful", user });
      }

      const user = await User.findOne({ phone });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Check DB stored OTP
      if (user.otp === otp && new Date(user.otpExpires) > new Date()) {
        user.isVerified = true;
        user.otp = undefined; // Clear OTP
        user.otpExpires = undefined;
        await user.save();

        return NextResponse.json({ message: "Login successful", user });
      } else {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}