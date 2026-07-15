const express = require("express");
const router = express.Router({ mergeParams: true });
const Report = require("../models/reports");
const { isLoggedIn, isAdmin } = require("../utils/middleware");
const wrapAsync = require("../utils/wrapAsync");
const { dashboard, deleteReport } = require("../controller/dashboard");

router.route("/dashboard").get(isLoggedIn, isAdmin, wrapAsync(dashboard));

router
  .route("/report/:id")
  .delete(isLoggedIn, isAdmin, wrapAsync(deleteReport));

module.exports = router;
