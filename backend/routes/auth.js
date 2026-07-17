const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");

const router = express.Router();

// POST /api/auth/register - create account (hash password, create user doc)
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, desiredTitle, companyName } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password, role required" });
    }
    if (!["seeker", "employer"].includes(role)) {
      return res.status(400).json({ error: "role must be seeker or employer" });
    }
    const db = getDB();
    const existing = await db.collection("users").findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const doc = {
      email,
      password: hash,
      role,
      createdAt: new Date(),
    };
    if (role === "seeker") {
      doc.desiredTitle = desiredTitle || "";
      doc.skills = [];
    } else {
      doc.companyName = companyName || "";
    }

    const result = await db.collection("users").insertOne(doc);
    req.login({ ...doc, _id: result.insertedId }, (err) => {
      if (err) return res.status(500).json({ error: "Login after register failed" });
      const { password, ...safe } = doc;
      return res.status(201).json({ ...safe, _id: result.insertedId });
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login - Passport local strategy, establish session
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ error: info?.message || "Invalid credentials" });
    req.login(user, (err) => {
      if (err) return next(err);
      const { password, ...safe } = user;
      return res.json(safe);
    });
  })(req, res, next);
});

// POST /api/auth/logout - destroy session
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

// GET /api/auth/session - return current user or 401
router.get("/session", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { password, ...safe } = req.user;
  res.json(safe);
});

module.exports = router;
