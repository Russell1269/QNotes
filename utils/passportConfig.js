const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(new LocalStrategy(User.authenticate()));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production" 
        ? "https://qnotes-archive.onrender.com/google/callback"
        : "http://localhost:8080/google/callback",
      scope: ["profile", "email"],
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName;
        const googleId = profile.id;
        const profilePicture =
          profile.photos && profile.photos[0] ? profile.photos[0].value : "";

        if (!email) {
          return cb(new Error("Google account does not provide an email."));
        }

        let user = await User.findOne({ googleId: googleId });

        if (!user) {
          user = await User.findOne({ email: email });

          if (user) {
            user.googleId = googleId;
            user.provider = "google";
            user.isVerified = true;
            await user.save();
          } else {
            user = await User.create({
              username: "google_" + googleId,
              name: name,
              email: email,
              googleId: googleId,
              provider: "google",
              profilePicture: profilePicture,
              isVerified: true,
              university: "Not Provided Yet",
            });
          }
        }

        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    },
  ),
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
