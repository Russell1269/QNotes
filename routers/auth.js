const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const User = require("../models/user");
const passport = require("passport");
const {
  validateQuestionAnswer,
  isLoggedIn,
  isAuthor,
  saveRedirectUrl,
} = require("../utils/middleware");
const wrapAsync = require("../utils/wrapAsync");
const {
  signupUserForm,
  signupUser,
  loginForm,
  postLogIn,
  logOutUser,
  getVerifyEmail,
  postVerifyEmail,
  universityUsernameInputForm,
  postUniUserForm,
  postGoogleLogin,
} = require("../controller/auth");

router.route("/signup").get(signupUserForm).post(wrapAsync(signupUser));

router
  .route("/login")
  .get(loginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true, // Tells Passport to show the error
    }),
    postLogIn,
  );

router.route("/logout").get(isLoggedIn, logOutUser);

// router.route("/verify-email").get(getVerifyEmail).post(postVerifyEmail);

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  postGoogleLogin,
);

router
  .route("/complete-profile")
  .get(isLoggedIn, universityUsernameInputForm)
  .post(isLoggedIn, wrapAsync(postUniUserForm));

module.exports = router;
