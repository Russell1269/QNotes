const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const Questions = require("../models/questionSchema");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {
  validateQuestion,
  isLoggedIn,
  isOwner,
  handleUploadAndSizeCheck,
  // handleUpload,
  // validateUploadSize,
} = require("../utils/middleware");
const {
  index,
  postQuestion,
  formForPostQuestion,
  detailQuestion,
  deleteQuestionItsAssociates,
  editQuestionsForm,
  postUpdatedQuestion,
} = require("../controller/question");

router
  .route("/")
  .get(wrapAsync(index))
  .post(
    isLoggedIn,
    handleUploadAndSizeCheck,
    validateQuestion,
    wrapAsync(postQuestion),
  );

router.route("/new").get(isLoggedIn, formForPostQuestion);

router
  .route("/:id")
  .get(wrapAsync(detailQuestion))
  .delete(isLoggedIn, isOwner, wrapAsync(deleteQuestionItsAssociates));

router
  .route("/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(editQuestionsForm));

router
  .route("/:id/update")
  .put(
    isLoggedIn,
    isOwner,
    handleUploadAndSizeCheck,
    validateQuestion,
    wrapAsync(postUpdatedQuestion),
  );

module.exports = router;
