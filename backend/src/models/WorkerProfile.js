const mongoose = require("mongoose");

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    skills: {
      type: [String],
      required: true
    },
    experience: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    ratingAvg: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkerProfile", workerProfileSchema);
