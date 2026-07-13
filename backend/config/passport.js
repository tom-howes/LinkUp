const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// const bcrypt = require("bcryptjs");
// const { ObjectId } = require("mongodb");
// const { getDB } = require("./db");

/**
 * TODO: Configure Passport's local strategy (email/password login)
 * and the serialize/deserialize hooks that keep a user's session alive.
 *
 * - LocalStrategy should look up the user by email, compare the hashed
 *   password with bcrypt, and call done(null, user) on success.
 * - serializeUser should store user._id in the session.
 * - deserializeUser should look the user back up by _id.
 */
function configurePassport() {
  // TODO
}

module.exports = { configurePassport };
