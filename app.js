if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

//core packages
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("@stz184/connect-flash");
const User = require("./models/user");
const passportLocalMongoose = require("passport-local-mongoose");
// User.plugin(passportLocalMongoose);
const mongoose = require("mongoose");
const dns = require("node:dns");
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const cookieParser = require("cookie-parser");

//dns server configaration
dns.setServers(["8.8.8.8", "1.1.1.1"]);

//custom files
const ExpressError = require("./utils/ExpressError");
const passport = require("./utils/passportConfig");

//router
const question = require("./routers/question");
const answer = require("./routers/answer");
const auth = require("./routers/auth");
const report = require("./routers/report");
const adminRouter = require("./routers/admin");
const aiRouter = require("./routers/ai");

//app-configaration
const app = express();
const port = process.env.PORT || 8080;
const dbUrl = process.env.ATLAS_DB_URL;
const localUrl = "mongodb://127.0.0.1:27017/qnotes";

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const questionJoiSchema = require("./schema");
const { request } = require("http");
const { error } = require("console");

//middleware
const {
  isLoggedIn,
  saveRedirectUrl,
  isProfileComplete,
} = require("./utils/middleware");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(process.env.SESSION_SECRECT));

//session-middleware
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
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SESSION_SECRECT,
    },
    ttl: 7 * 24 * 60 * 60,
  }),
};

app.use(session(sessionOption));
app.use(flash());

//passport-initiation
app.use(passport.initialize());
app.use(passport.session());

//response and local variable
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//routes -handle
app.use("/", auth);
app.use("/ai", aiRouter);
app.use("/question", isProfileComplete, question);
app.use("/report", report);
app.use("/admin", adminRouter);
app.use("/question/:id/answer", answer);

app.get("/", (req, res, next) => {
  res.render("UI_MAIN/rootRoute");
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

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(port, () => {
      console.log(`App is listening on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

module.exports = app;
