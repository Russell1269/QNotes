const { required } = require("joi");
const mongoose = require("mongoose");
const Report = require("./reports");

const answerSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
  writtenAnswer: {
    type: String,
    required: true,
  },
  imageUrl: {
    url: { type: [String] },
    fileName: { type: String },
  },
  fileUrl: {
    url: String,
    fileName: String,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

answerSchema.post("findOneAndDelete", async function (answer) {
  if (answer) {
    console.log(`Deleting all reports for Answer ID: ${answer._id}`);
    await Report.deleteMany({ targetId: answer._id });

    console.log("Successfully deleted all associated reports for this answer!");
  }
});

const QuestionAnswer = mongoose.model("QuestionAnswer", answerSchema);
module.exports = QuestionAnswer;
