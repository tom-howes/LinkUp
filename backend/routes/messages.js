const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../config/middleware");

const router = express.Router();

// Owned by: Thomas Howes (Postings & Chat)
// Messages should only exist within an "unlocked" match between a seeker
// and a poster - check the requester is a participant before allowing access.

// Load a match and confirm the current user may use its chat.
// Returns { match } on success, or { status, error } to send back.
async function loadUnlockedMatch(db, matchId, user) {
  let match;
  try {
    match = await db.collection("matches").findOne({ _id: new ObjectId(matchId) });
  } catch (err) {
    return { status: 400, error: "Invalid id" };
  }
  if (!match) return { status: 404, error: "Match not found" };

  const isParticipant =
    match.seekerId.equals(user._id) || match.posterId.equals(user._id);
  if (!isParticipant) return { status: 403, error: "Forbidden" };

  if (match.status !== "unlocked") {
    return { status: 403, error: "Chat is locked for this match" };
  }
  return { match };
}

// GET /api/messages/:matchId - read the thread for an unlocked match
router.get("/:matchId", requireAuth, async (req, res) => {
  const db = getDB();
  const { match, status, error } = await loadUnlockedMatch(
    db,
    req.params.matchId,
    req.user
  );
  if (!match) return res.status(status).json({ error });

  const messages = await db
    .collection("messages")
    .find({ matchId: match._id })
    .sort({ timestamp: 1 })
    .toArray();
  res.json(messages);
});

// POST /api/messages/:matchId - send a message
router.post("/:matchId", requireAuth, async (req, res) => {
  const db = getDB();
  const { match, status, error } = await loadUnlockedMatch(
    db,
    req.params.matchId,
    req.user
  );
  if (!match) return res.status(status).json({ error });

  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Message text is required" });

  const doc = {
    matchId: match._id,
    senderId: req.user._id,
    text,
    timestamp: new Date(),
  };
  const result = await db.collection("messages").insertOne(doc);
  res.status(201).json({ ...doc, _id: result.insertedId });
});

// PUT /api/messages/message/:id - edit own message
router.put("/message/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const message = await db
      .collection("messages")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!message) return res.status(404).json({ error: "Not found" });
    if (!message.senderId.equals(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ error: "Message text is required" });

    await db
      .collection("messages")
      .updateOne({ _id: message._id }, { $set: { text, editedAt: new Date() } });
    const fresh = await db.collection("messages").findOne({ _id: message._id });
    res.json(fresh);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// DELETE /api/messages/message/:id - delete own message
router.delete("/message/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const message = await db
      .collection("messages")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!message) return res.status(404).json({ error: "Not found" });
    if (!message.senderId.equals(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await db.collection("messages").deleteOne({ _id: message._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

module.exports = router;
