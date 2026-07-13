const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDB } = require("../config/db");
// const { requireAuth } = require("../config/middleware");

const router = express.Router();

// Owned by: Thomas Howes (Postings & Chat)

// GET /api/postings?search=&title= - browse/search open postings
router.get("/", async (req, res) => {
  // TODO
});

// GET /api/postings/mine - employer's own postings
router.get("/mine", async (req, res) => {
  // TODO
});

// GET /api/postings/:id - single posting detail
router.get("/:id", async (req, res) => {
  // TODO
});

// POST /api/postings - create a posting (employer only, max 2 required skills)
router.post("/", async (req, res) => {
  // TODO
});

// PUT /api/postings/:id - edit a posting (author only)
router.put("/:id", async (req, res) => {
  // TODO
});

// DELETE /api/postings/:id - delete a posting (author only)
router.delete("/:id", async (req, res) => {
  // TODO
});

module.exports = router;
