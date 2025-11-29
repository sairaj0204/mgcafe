import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tableNo: { type: Number, required: true },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    
    // UPDATED STATUS FLOW: pending -> preparing -> served -> completed
    status: { 
      type: String, 
      enum: ["pending", "preparing", "served", "completed", "cancelled"], 
      default: "pending" 
    },

    // NEW FIELD
    paymentMethod: { type: String, enum: ["cash", "online"], required: true },

    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },
    
    razorpay: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },

    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);