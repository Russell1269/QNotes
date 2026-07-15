const Questions = require("../models/questionSchema");
const QuestionAnswer = require("../models/questionAnswer");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudconfig");

module.exports.index = async (req, res, next) => {
  let { tag } = req.query;
  let query = {};

  if (tag && tag.trim() !== "") {
    const searchTag = tag.trim().toLowerCase();
    query = {
      tags: {
        $in: [new RegExp(searchTag, "i")],
      },
    };
  }

  let data = await Questions.find(query)
    .populate("owner")
    .sort({ year: -1, session: -1 });

  if (!data) {
    req.flash("error", "Something went wrong");
    next(new ExpressError(500, "Internal Server Error."));
  }


  res.render("UI_MAIN/home.ejs", {
    questions: data,
    currentSearchTag: tag || "",
  });
};

module.exports.postQuestion = async (req, res, next) => {
  const { title, description, subject, year, session, tags } = req.body;

  let finalImageObject = undefined;
  let finalFileObject = undefined;

  if (req.files && req.files["imageUrl"] && req.files["imageUrl"].length > 0) {
    const urlsArray = req.files["imageUrl"].map((file) => file.path);

    const firstFilename =
      req.files["imageUrl"][0].filename || req.files["imageUrl"][0].public_id;

    finalImageObject = {
      url: urlsArray,
      filename: firstFilename,
    };
  }

  if (req.files && req.files["fileUrl"] && req.files["fileUrl"][0]) {
    finalFileObject = {
      url: req.files["fileUrl"][0].path, // পিডিএফ এর Cloudinary URL
      filename:
        req.files["fileUrl"][0].filename || req.files["fileUrl"][0].public_id, // পিডিএফ এর Cloudinary ফাইলনেম
    };
  }

  // Process the tags string into an array of strings split by commas (e.g., "bba, math" -> ["bba", "math"])
  let tagsArray = [];
  if (tags && tags.trim() !== "") {
    tagsArray = tags.split(",").map((tag) => tag.trim());
  }

  const newQuestion = new Questions({
    title: title,
    description: description,
    subject: subject,
    year: year ? Number(year) : undefined, // Parse integer string safely
    session: session,
    fileUrl: finalFileObject, // এতে { url, filename } সেভ হবে
    imageUrl: finalImageObject,
    tags: tagsArray,
  });
  if (!newQuestion) {
    req.flash("error", "Something went wrong");
    throw new ExpressError(404, "hello");
  }

  newQuestion.owner = req.user._id;
  await newQuestion.save();
  req.flash("success", "You successfully upload a question");
  res.redirect("/question");
};

module.exports.formForPostQuestion = (req, res) => {
  res.render("UI_MAIN/create_question.ejs");
};

module.exports.detailQuestion = async (req, res) => {
  let { id } = req.params;
  let info = await Questions.findById(id)
    .populate("owner")
    .populate({
      path: "answers",
      populate: {
        path: "author", // Populates the author for EVERY individual answer
      },
    });

  if (!info) {
    req.flash("error", "Something went wrong");
    return res.redirect("/question");
  }
  res.render("UI_MAIN/questionView.ejs", { question: info });
};

module.exports.deleteQuestionItsAssociates = async (req, res) => {
  let { id } = req.params;
  const question = await Questions.findById(id).populate("answers");
  if (!question) {
    req.flash("error", "Question not found.");
    return res.redirect("/question");
  }
  if (question.imageUrl && question.imageUrl.filename) {
    await cloudinary.uploader.destroy(question.imageUrl.filename);
  }
  if (question.fileUrl && question.fileUrl.filename) {
    await cloudinary.uploader.destroy(question.fileUrl.filename, {
      resource_type: "raw",
    });
  }
  if (question.answers && question.answers.length > 0) {
    for (let answer of question.answers) {
      // গ. উত্তরের সাথে যুক্ত ছবি ক্লাউডিনারি থেকে ডিলিট করা (আপনার স্কিমার 'fileName' অনুযায়ী)
      if (answer.imageUrl && answer.imageUrl.fileName) {
        await cloudinary.uploader.destroy(answer.imageUrl.fileName);
      }

      // ঘ. উত্তরের সাথে যুক্ত পিডিএফ ক্লাউডিনারি থেকে ডিলিট করা (resource_type: "raw")
      if (answer.fileUrl && answer.fileUrl.fileName) {
        await cloudinary.uploader.destroy(answer.fileUrl.fileName, {
          resource_type: "raw",
        });
      }
    }
    await QuestionAnswer.deleteMany({ _id: { $in: question.answers } });
  }
  await Questions.findByIdAndDelete(id);
  req.flash(
    "success",
    "Question and it's related answer successfully deleted.",
  );
  res.redirect("/question");
};

module.exports.editQuestionsForm = async (req, res) => {
  let { id } = req.params;
  const question = await Questions.findById(id);
  if (!question) {
    req.flash("error", "Something went wrong");
    next(new ExpressError(500, "Question not found."));
  }
  res.render("UI_MAIN/edit_question.ejs", { question: question });
};

module.exports.postUpdatedQuestion = async (req, res) => {
  const { id } = req.params;
  if (!req.body) {
    req.flash("error", "Something went wrong");
    throw new ExpressError(400, "send valid data.");
  }
  const {
    title,
    description,
    subject,
    year,
    session,
    fileUrl,
    imageUrl,
    tags,
  } = req.body;

  const updateData = {
    title: title,
    description: description,
    subject: subject,
    year: year ? Number(year) : undefined,
    session: session,
  };

  if (req.files && req.files["imageUrl"] && req.files["imageUrl"].length > 0) {
    const urlsArray = req.files["imageUrl"].map((file) => file.path);
    const firstFilename = req.files["imageUrl"][0].filename;

    updateData.imageUrl = {
      url: urlsArray,
      filename: firstFilename,
    };
  }

  if (req.files && req.files["fileUrl"] && req.files["fileUrl"][0]) {
    updateData.fileUrl = {
      url: req.files["fileUrl"][0].path,
      filename: req.files["fileUrl"][0].filename,
    };
  }

  if (tags && tags.trim() !== "") {
    updateData.tags = tags.split(",").map((tag) => tag.trim());
  }

  const updatedQuestion = await Questions.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
  });

  if (!updatedQuestion) {
    req.flash("error", "Question not found.");
    return res.redirect("/question");
  }
  // Redirect the user back to the detailed single view page to confirm changes
  req.flash("success", "Upgradradtion successfull");
  res.redirect(`/question/${id}`);
};
