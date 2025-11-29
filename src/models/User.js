import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Guest" },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false }, // Will set to true after OTP
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);