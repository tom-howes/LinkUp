require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");

const { connectDB } = require("./config/db");
const { configurePassport } = require("./config/passport");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postingRoutes = require("./routes/postings");
const matchRoutes = require("./routes/matches");
const messageRoutes = require("./routes/messages");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// TODO: manual CORS headers here if frontend runs on a different port
// (remember: the `cors` npm package is not allowed).

// TODO: app.use(session({ ... })) using process.env.SESSION_SECRET

// TODO: app.use(passport.initialize()) and app.use(passport.session())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/postings", postingRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  // TODO: await connectDB(), call configurePassport(), then app.listen(PORT)
}

start();
