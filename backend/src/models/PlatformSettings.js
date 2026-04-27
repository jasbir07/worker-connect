const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    commissionPercentage: {
      type: Number,
      default: 10
    },
    minimumCommission: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Ensure only one document exists
platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
