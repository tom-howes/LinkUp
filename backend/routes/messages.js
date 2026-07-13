const express = require("express");
// const { ObjectId } = require("mongodb");
// const { getDB } = require("../config/db");
// const { requireAuth } = require("../config/middleware");

const router = express.Router();

// Owned by: Thomas Howes (Postings & Chat)
// Messages should only exist within an "unlocked" match between a seeker
// and a poster - check the requester is a participant before allowing access.

// GET /api/messages/:matchId - read the thread for an unlocked match
router.get("/:matchId", async (req, res) => {
  // TODO
});

// POST /api/messages/:matchId - send a message
router.post("/:matchId", async (req, res) => {
  // TODO
});

// PUT /api/messages/message/:id - edit own message
router.put("/message/:id", async (req, res) => {
  // TODO
});

// DELETE /api/messages/message/:id - delete own message
router.delete("/message/:id", async (req, res) => {
  // TODO
});

module.exports = router;
