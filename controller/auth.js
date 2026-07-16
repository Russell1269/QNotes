const User = require("../models/user");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");
const { sendVerificationEmail } = require("../utils/sendEmail");

module.exports.signupUserForm = (req, res) => {
  res.render("UI_MAIN/signUp");
};

module.exports.signupUser = async (req, res, next) => {
  const { name, university, username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    req.flash("error", "Email already exists.");
    return res.redirect("/signup");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const user = new User({
    name,
    university,
    username,
    email,
    emailOTP: otp,
    otpExpires: otpExpiry,
  });
  const registeredUser = await User.register(user, password);

  await sendVerificationEmail(email, name, otp);

  req.session.verifyUserId = registeredUser._id;

  // req.logIn(registeredUser, (err) => {
  //   if (err) {
  //     req.flash("error", err.message);
  //     return next(err);
  //   }
  //   req.flash("success", "signup success");
  //   let redirectUrl = res.locals.redirectUrl || "/question";
  //   res.redirect(redirectUrl);
  // });
  req.flash(
    "success",
    "Registration successful! An OTP code has been sent to your email.",
  );
  res.redirect("/verify-email");
};

module.exports.getVerifyEmail = (req, res) => {
  if (!req.session.verifyUserId) {
    req.flash("error", "Invalid access slot.");
    return res.redirect("/register");
  }
  res.render("ADMIN/verifyEmail.ejs");
};

module.exports.postVerifyEmail = async (req, res) => {
  const { otpInput } = req.body;
  const userId = req.session.verifyUserId;

  const user = await User.findById(userId);

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/register");
  }

  // ওটিপি কোড এবং মেয়াদ চেক করা
  if (user.emailOTP === otpInput && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.emailOTP = undefined; // ওটিপি ক্লিয়ার করা
    user.otpExpires = undefined;
    await user.save();

    req.login(user, (err) => {
      if (err) return next(err);
      delete req.session.verifyUserId;
      req.flash("success", "Email verified successfully! Welcome to QNotes.");
      res.redirect("/question");
    });
  } else {
    req.flash("error", "Invalid or expired OTP code. Please try again.");
    res.redirect("/verify-email");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("UI_MAIN/login");
};

module.exports.postLogIn = (req, res) => {
  if (!req.user.isVerified) {
    const targetUserId = req.user._id;
    req.logout((err) => {
      if (err) return next(err);
      req.session.verifyUserId = targetUserId;
      req.flash(
        "error",
        "Your email is not verified yet. Please verify first.",
      );
      return res.redirect("/verify-email");
    });
  } else {
    const redirectUrl = res.locals.redirectUrl || "/question";
    res.redirect(redirectUrl);
  }
};

module.exports.logOutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "logout success");
    const redirectUrl = res.locals.redirectUrl || "/question";
    res.redirect(redirectUrl);
  });
};

module.exports.universityUsernameInputForm = (req, res) => {
  if (req.user.university && req.user.university !== "Not Provided Yet") {
    return res.redirect("/");
  }
  res.render("UI_MAIN/completeProfile");
};

module.exports.postUniUserForm = async (req, res) => {
  const { university, username } = req.body;

  const existingUser = await User.findOne({
    username: username.toLowerCase().trim(),
  });
  if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
    req.flash("error", "Username is already taken. Try another one.");
    return res.redirect("/complete-profile");
  }

  req.user.username = username.toLowerCase().trim();
  req.user.university = university.trim();
  await req.user.save();

  req.flash("success", "Profile completed successfully! Welcome to QNotes.");
  res.redirect("/question");
};

module.exports.postGoogleLogin = (req, res,next) => {
  req.logIn(req.user, (err) => {
    if (err) {
      console.error("Passport login error:", err);
      return next(err);
    }
    req.flash("success", "Welcome back! Logged in successfully with Google.");
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return next(err);
      }
      setTimeout(() => {
        res.redirect("/question");
      }, 1000);
    });
  });
};
