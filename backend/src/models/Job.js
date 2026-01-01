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
      enum: ["open", "assigned", "completed"],
      default: "open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
