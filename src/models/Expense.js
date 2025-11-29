import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "Milk", "Electricity"
    amount: { type: Number, required: true },
    category: { type: String, default: "Inventory" }, // Inventory, Salary, Utility
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);