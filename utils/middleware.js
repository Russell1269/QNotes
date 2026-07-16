const questionSchema = require("../models/questionSchema");
const { answerJoiSchema, questionJoiSchema } = require("../schema");
const ExpressError = require("./ExpressError");
const Question = require("../models/questionSchema");
const Answer = require("../models/questionAnswer");
const multer = require("multer");
const { upload } = require("../cloudconfig");

module.exports.validateQuestion = (req, res, next) => {
  const { error } = questionJoiSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateQuestionAnswer = (req, res, next) => {
  let { error } = answerJoiSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    }
    req.flash(
      "error",
      "To perform this particular task you have to be logged in.",
    );
    return res.redirect("/login");
  }

  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let qdata = await Question.findById(id);
  if (
    !qdata.owner._id.equals(res.locals.currentUser._id) &&
    req.user.role !== "admin"
  ) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/question/${id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  let { id, answerId } = req.params;
  let aData = await Answer.findById(answerId).populate("author");
  if (
    !aData.author._id.equals(res.locals.currentUser._id) &&
    req.user.role !== "admin"
  ) {
    req.flash("error", "You are not the author of this.");
    return res.redirect(`/question/${id}`);
  }
  next();
};

module.exports.isAdmin = async (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  req.flash("error", "You do not have permission to access this page!");
  res.redirect("/question");
};

//for max upload
// module.exports.handleUpload = (req, res, next) => {
//   const uploadFields = upload.fields([
//     { name: "imageUrl", maxCount: 4 },
//     { name: "fileUrl", maxCount: 1 },
//   ]);

//   uploadFields(req, res, (err) => {
//     if (err) {
//       const questionId = req.body.questionId;
//       if (err instanceof multer.MulterError) {
//         req.flash("error", err.message || "Try with lower sized file");
//         return questionId
//           ? res.redirect(`/question/${questionId}`)
//           : res.redirect("/question");
//       }
//       req.flash("error", "Something went wrong.");
//       return questionId
//         ? res.redirect(`/question/${questionId}`)
//         : res.redirect("/question");
//     }
//     next();
//   });
// };

module.exports.isProfileComplete = (req, res, next) => {
  if (req.isAuthenticated()) {
    const hasTempUsername =
      req.user.username && req.user.username.startsWith("google_");
    const hasNoUniversity =
      !req.user.university || req.user.university === "Not Provided Yet";

    if (hasTempUsername || hasNoUniversity) {
      req.flash(
        "error",
        "Please set your username and university name to continue.",
      );
      return res.redirect("/complete-profile");
    }
  }
  next();
};

// module.exports.validateUploadSize = (req, res, next) => {
//   const uploadFields = upload.fields([
//     { name: "imageUrl", maxCount: 4 },
//     { name: "fileUrl", maxCount: 1 },
//   ]);

//   uploadFields(req, res, (err) => {
//     if (err) {
//       req.flash("error", "Somthing error happend while you upload.");
//       return res.redirect("back");
//     }

    
//     const maxPdfSize = 5 * 1024 * 1024;  
//     const maxImgSize = 15 * 1024 * 1024; 

//     if (req.files && req.files["fileUrl"]) {
//       const pdfFile = req.files["fileUrl"][0];
//       if (pdfFile.size > maxPdfSize) {
//         req.flash("error", "PDF file cross 5MB limits.");
//         return res.redirect(`/question/${req.body.questionId}`); 
//         // নোট: যদি নির্দিষ্ট আইডি থাকে তবে দিতে পারেন: res.redirect(`/question/${req.body.questionId}`);
//       }
//     }

//     if (req.files && req.files["imageUrl"]) {
//       for (let imgFile of req.files["imageUrl"]) {
//         if (imgFile.size > maxImgSize) {
//           req.flash("error", "image cross 15MB limit.");
//           return res.redirect(`/question/${req.body.questionId}`);
//         }
//       }
//     }
//     next();
//   });
// };

module.exports.handleUploadAndSizeCheck = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: "imageUrl", maxCount: 4 },
    { name: "fileUrl", maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
    const questionId = req.body.questionId; 

    if (err) {
      if (err instanceof multer.MulterError) {
        req.flash("error", err.message || "Try with lower sized file");
        return questionId ? res.redirect(`/question/${questionId}`) : res.redirect("/question");
      }
      req.flash("error", "Something went wrong during upload.");
      return questionId ? res.redirect(`/question/${questionId}`) : res.redirect("/question");
    }

   
    const maxPdfSize = 5 * 1024 * 1024;  // 5MB
    const maxImgSize = 15 * 1024 * 1024; // 15MB

    if (req.files && req.files["fileUrl"] && req.files["fileUrl"][0]) {
      const pdfFile = req.files["fileUrl"][0];
      if (pdfFile.size > maxPdfSize) {
        req.flash("error", "PDF file cross 5MB limits.");
        return questionId ? res.redirect(`/question/${questionId}`) : res.redirect("/question");
      }
    }

    if (req.files && req.files["imageUrl"]) {
      for (let imgFile of req.files["imageUrl"]) {
        if (imgFile.size > maxImgSize) {
          req.flash("error", "Image cross 15MB limit.");
          return questionId ? res.redirect(`/question/${questionId}`) : res.redirect("/question");
        }
      }
    }
    next();
  });
};
