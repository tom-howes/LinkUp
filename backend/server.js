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

// manual CORS headers (cors package not allowed)
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CLIENT_ORIGIN || "http://localhost:3000"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/postings", postingRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  try {
    await connectDB();
    configurePassport();
    app.listen(PORT, () => console.log(`Server on ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();