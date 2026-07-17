const mongoose = require("mongoose");
const QuestionAnswer = require("./questionAnswer");
const Report = require("./reports");
const { type } = require("node:os");
const { ref } = require("node:process");
const { required } = require("joi");

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  examType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
  },
  batch: {
    type: String,
    required: true,
  },
  session: {
    type: String,
  },
  fileUrl: {
    url: {
      type: String,
    },
    filename: {
      type: String,
    },
  },
  imageUrl: {
    url: {
      type: [String],
      default:
        "https://images.unsplash.com/photo-1773332598414-44a45e364d85?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    filename: {
      type: String,
    },
  },
  tags: [
    {
      type: String,
    },
  ],
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuestionAnswer" }],
  // reports: [{type: mongoose.Schema.Types.ObjectId, ref: "Report"}],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.index({ year: -1, session: -1 });

questionSchema.post("findOneAndDelete", async (question) => {
  if (question) {
    await Report.deleteMany({ targetId: question._id });

    if (question.answers && question.answers.length > 0) {
      await Report.deleteMany({ targetId: { $in: question.answers } });
      await QuestionAnswer.deleteMany({ _id: { $in: question.answers } });
    }
    console.log("Successfully deleted all cascade data!");
  }
});

module.exports = mongoose.model("Question", questionSchema);
