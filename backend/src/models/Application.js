const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "Pending"
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
