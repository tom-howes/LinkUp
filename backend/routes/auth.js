const express = require("express");
// const passport = require("passport");
// const bcrypt = require("bcryptjs");
// const { getDB } = require("../config/db");

const router = express.Router();

// POST /api/auth/register - create account (hash password, create user doc)
router.post("/register", async (req, res) => {
  // TODO
});

// POST /api/auth/login - Passport local strategy, establish session
router.post("/login", (req, res, next) => {
  // TODO
});

// POST /api/auth/logout - destroy session
router.post("/logout", (req, res, next) => {
  // TODO
});

// GET /api/auth/session - return current user or 401
router.get("/session", (req, res) => {
  // TODO
});

module.exports = router;
