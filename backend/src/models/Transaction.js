const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "release", "commission"],
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
