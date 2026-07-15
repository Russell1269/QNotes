const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportOn: {
    type: String,
    required: true,
    enum: ["Question", "QuestionAnswer"], // শুধুমাত্র এই দুটি ভ্যালু গ্রহণ করবে
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "reportOn", // এটি ডাইনামিকালি Question বা Answer মডেলকে রেফার করবে
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
