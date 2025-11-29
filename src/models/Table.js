import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    tableNo: { type: Number, required: true, unique: true },
    status: { 
      type: String, 
      enum: ["available", "occupied"], 
      default: "available" 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);