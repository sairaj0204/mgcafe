import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Guest" },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    
    // 👇 ADD THESE TWO FIELDS
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// Check if model exists before compiling to prevent Next.js hot-reload errors
export default mongoose.models.User || mongoose.model("User", UserSchema);