const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

programSchema.index({ title: 1 });

module.exports = mongoose.model("Program", programSchema);
