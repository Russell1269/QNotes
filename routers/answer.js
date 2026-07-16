const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const multer = require("multer");
//database
const Questions = require("../models/questionSchema");
const QuestionAnswer = require("../models/questionAnswer");
//middleware
const {
  validateQuestionAnswer,
  isLoggedIn,
  isAuthor,
  handleUploadAndSizeCheck,
  // handleUpload,
} = require("../utils/middleware");
const wrapAsync = require("../utils/wrapAsync");
const {
  postAnswer,
  editAnswer,
  deleteAnswer,
  vote,
  redirectAnswer,
} = require("../controller/answer");
const { storage } = require("../cloudconfig");
const upload = multer({ storage: storage });

router
  .route("/")
  .get(redirectAnswer)
  .post(
    isLoggedIn,
    handleUploadAndSizeCheck,
    validateQuestionAnswer,
    wrapAsync(postAnswer),
  );

router
  .route("/:answerId")
  .put(isLoggedIn, isAuthor, handleUploadAndSizeCheck, wrapAsync(editAnswer))
  .delete(isLoggedIn, isAuthor, wrapAsync(deleteAnswer));

router.route("/:answerId/vote").post(isLoggedIn, wrapAsync(vote));

module.exports = router;
