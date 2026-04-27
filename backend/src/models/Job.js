const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
     workerId: {
    type: mongoose.Schema.Types.ObjectId,   // ✅ FIX
    ref: "User"
  },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["open", "pending_payment", "in-progress", "completed", "cancelled"],
      default: "open"
    },
    selectedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    amount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "funded", "released"],
      default: "unpaid"
    },
    razorpayOrderId: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
