const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDB } = require("../config/db");
// const { requireAuth } = require("../config/middleware");

const router = express.Router();

// Owned by: Tony Zhang (Profiles & Matching)
// A match should be generated when a seeker's desiredTitle + at least one
// skill overlaps with a posting's title + requiredSkills.

// POST /api/matches/generate - recompute matches for the current seeker
router.post("/generate", async (req, res) => {
  // TODO
});

// GET /api/matches/mine - list current user's matches (seeker or employer side)
router.get("/mine", async (req, res) => {
  // TODO
});

// PUT /api/matches/:id - update match status (e.g. dismiss)
router.put("/:id", async (req, res) => {
  // TODO
});

// DELETE /api/matches/:id - remove a match
router.delete("/:id", async (req, res) => {
  // TODO
});

module.exports = router;
