const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { getDB } = require("./db");

function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const db = getDB();
          const user = await db.collection("users").findOne({ email });
          if (!user) return done(null, false, { message: "Invalid credentials" });
          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return done(null, false, { message: "Invalid credentials" });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDB();
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = { configurePassport };
