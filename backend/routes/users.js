const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDB } = require("../config/db");
// const { requireAuth } = require("../config/middleware");

const router = express.Router();

// Owned by: Tony Zhang (Profiles & Matching)

// GET /api/users/me - read own profile
router.get("/me", async (req, res) => {
  // TODO
});

// GET /api/users/:id - read a single profile (public fields only)
router.get("/:id", async (req, res) => {
  // TODO
});

// PUT /api/users/me - update own profile (desiredTitle + skills, or companyName)
router.put("/me", async (req, res) => {
  // TODO - remember: seekers get at most 3 skills, each with a name + evidence
});

// DELETE /api/users/me - delete own account
router.delete("/me", async (req, res) => {
  // TODO
});

module.exports = router;
