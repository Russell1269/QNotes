const mongoose = require("mongoose");
const Questions = require("../models/questionSchema");
const QuestionAnswer = require("../models/questionAnswer");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudconfig");

module.exports.postAnswer = async (req, res, next) => {
  const { id } = req.params;
  const { writtenAnswer } = req.body;

  let finalImageObject = undefined;
  let finalFileObject = undefined;

  if (req.files && req.files["imageUrl"] && req.files["imageUrl"].length > 0) {
    const urlsArray = req.files["imageUrl"].map((file) => file.path);
    const firstFilename = req.files["imageUrl"][0].filename;
    finalImageObject = {
      url: urlsArray,
      fileName: firstFilename,
    };
  }

  if (req.files && req.files["fileUrl"] && req.files["fileUrl"][0]) {
    finalFileObject = {
      url: req.files["fileUrl"][0].path,
      fileName: req.files["fileUrl"][0].filename,
    };
  }

  let newAnswer = new QuestionAnswer({
    question: id,
    writtenAnswer: writtenAnswer,
    imageUrl: finalImageObject,
    fileUrl: finalFileObject || undefined,
  });
  let question = await Questions.findById(id);
  if (!question) {
    req.flash("error", "Question not found");
    return res.redirect("/question");
  }
  question.answers.push(newAnswer);
  newAnswer.author = req.user._id;

  await newAnswer.save();
  await question.save();

  req.flash("success", "Answer Added successfully");
  res.redirect(`/question/${id}`);
};

module.exports.editAnswer = async (req, res, next) => {
  const { id, answerId } = req.params;
  if (!req.body || Object.keys(req.body).length === 0) {
    req.flash("error", "Something went wrong");
    throw new ExpressError(400, "send valid data.");
  }
  const { writtenAnswer } = req.body;
  const updateData = {
    writtenAnswer: writtenAnswer,
  };

  if (req.files && req.files["imageUrl"] && req.files["imageUrl"].length > 0) {
    const urlsArray = req.files["imageUrl"].map((file) => file.path);
    const firstFilename =
      req.files["imageUrl"][0].filename || req.files["imageUrl"][0].public_id;

    updateData.imageUrl = {
      url: urlsArray,
      fileName: firstFilename,
    };
  }
  if (req.files && req.files["fileUrl"] && req.files["fileUrl"][0]) {
    updateData.fileUrl = {
      url: req.files["fileUrl"][0].path,
      fileName:
        req.files["fileUrl"][0].filename || req.files["fileUrl"][0].public_id,
    };
  }
  const updatedAnswer = await QuestionAnswer.findByIdAndUpdate(
    answerId,
    updateData,
    {
      returnDocument: "after",
    },
  );
  if (!updatedAnswer) {
    req.flash("error", "Answer not found.");
    return res.redirect(`/question/${id}`);
  }
  req.flash("success", "Upgradradtion successfull");
  res.redirect(`/question/${id}`);
};

module.exports.deleteAnswer = async (req, res, next) => {
  let { id, answerId } = req.params;

  if (!id && !answerId) {
    req.flash("error", "something went wrong");
    return new ExpressError(400, "Something went wrong.");
  }
  const answer = await QuestionAnswer.findById(answerId);
  if (!answer) {
    req.flash("error", "Answer not found.");
    return res.redirect(`/question/${id}`);
  }

  if (answer.imageUrl && answer.imageUrl.fileName) {
    await cloudinary.uploader.destroy(answer.imageUrl.fileName);
  }
  if (answer.fileUrl && answer.fileUrl.fileName) {
    // পিডিএফ এর জন্য অবশ্যই resource_type: "raw" দিতে হবে
    await cloudinary.uploader.destroy(answer.fileUrl.fileName, {
      resource_type: "raw",
    });
  }

  await Questions.findByIdAndUpdate(id, { $pull: { answers: answerId } }); //remove from the existing array
  await QuestionAnswer.findByIdAndDelete(answerId);
  req.flash("success", "Deletation successfull");
  res.redirect(`/question/${id}`);
};

module.exports.vote = async (req, res) => {
  const { answerId } = req.params;
  const { voteType } = req.body;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const answer = await QuestionAnswer.findById(answerId);
  if (!answer) {
    return res
      .status(404)
      .json({ success: false, message: "Answer not found" });
  }

  if (!answer.upvotes) answer.upvotes = [];
  if (!answer.downvotes) answer.downvotes = [];

  const hasUpvoted = answer.upvotes.some(
    (id) => id.toString() === userId.toString(),
  );
  const hasDownvoted = answer.downvotes.some(
    (id) => id.toString() === userId.toString(),
  );
  let userVote = "";
  if (voteType === "yes") {
    if (hasUpvoted) {
      answer.upvotes = answer.upvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      answer.upvotes.push(userId);
      answer.downvotes = answer.downvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      userVote = "yes";
    }
  } else if (voteType === "no") {
    if (hasDownvoted) {
      answer.downvotes = answer.downvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      answer.downvotes.push(userId);
      answer.upvotes = answer.upvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      userVote = "no";
    }
  }

  answer.markModified("upvotes");
  answer.markModified("downvotes");

  await answer.save();

  const yesCount = answer.upvotes.length;
  const noCount = answer.downvotes.length;
  const totalVotes = yesCount + noCount;
  const percentage =
    totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;

  return res.json({ success: true, percentage, totalVotes, userVote });
};

module.exports.redirectAnswer = (req, res) => {
  let { id } = req.params;
  res.redirect(`/question/${id}`);
};
