const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync");
const Report = require("../models/reports");
const {
  validateQuestionAnswer,
  isLoggedIn,
  isAuthor,
  saveRedirectUrl,
} = require("../utils/middleware");
const { postReport } = require("../controller/report");

router.route("/").post(isLoggedIn, wrapAsync(postReport));

module.exports = router;
