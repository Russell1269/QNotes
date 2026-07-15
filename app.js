if (process.env.NODE_ENV != "production") {
  //it's not run in production server
  require("dotenv").config();
}
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("@stz184/connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const passportLocalMongoose = require("passport-local-mongoose");
// User.plugin(passportLocalMongoose);
const app = express();
const mongoose = require("mongoose");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const engine = require("ejs-mate");
const cookieParser = require("cookie-parser");
//router
const question = require("./routers/question");
const answer = require("./routers/answer");
const auth = require("./routers/auth");
const report = require("./routers/report");
const adminRouter = require("./routers/admin");
const aiRouter = require("./routers/ai");

const questionJoiSchema = require("./schema");
const { request } = require("http");
const { error } = require("console");
//middleware
const port = 8080;
const dbUrl = process.env.ATLAS_DB_URL;
const localUrl = "mongodb://127.0.0.1:27017/qnotes";
const { isLoggedIn, saveRedirectUrl } = require("./utils/middleware");
app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
//session-middleware
app.use(cookieParser("bangladesh"));
const sessionOption = {
  secret: process.env.SESSION_SECRECT,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
  store: MongoStore.create({
    mongoUrl: dbUrl, // আপনার মঙ্গো অ্যাটলাসের ইউআরএল
    crypto: {
      secret: process.env.SESSION_SECRECT, // ডাটাবেজে সেশনের ভেতরের ডেটা এনক্রিপ্ট বা লক করে রাখার জন্য
    },
    ttl: 7 * 24 * 60 * 60, // ডাটাবেজ থেকে ৭ দিন পর অটোমেটিক ডিলিট হবে (Time to live)
  }),
};

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(session(sessionOption));
app.use(flash());

//passport-initiation
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//router
app.use("/", auth);
app.use("/ai", aiRouter);
app.use("/question", question);
app.use("/report", report);
app.use("/admin", adminRouter);
app.use("/question/:id/answer", answer);

app.get("/question/:id/answer", (req, res) => {
  let { id } = req.params;
  res.redirect(`/question/${id}`);
});

app.get("/admin", (req, res, next) => {
  return next(new ExpressError(403, "fuck you"));
});

app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

//global error handler
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("UI_MAIN/error", {
    status: status,
    message: message,
    err: err,
  });
});

app.listen(port, () => {
  console.log(`app is listening on: ${port}`);
});
