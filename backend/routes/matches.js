const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../config/middleware");

const router = express.Router();

// A match should be generated when a seeker's desiredTitle + at least one
// skill overlaps with a posting's title + requiredSkills.

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

// POST /api/matches/generate - recompute matches for the current seeker
router.post("/generate", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "seeker") {
      return res.status(403).json({ error: "Seekers only" });
    }
    const db = getDB();
    const seeker = req.user;
    const seekerTitle = norm(seeker.desiredTitle);
    const seekerSkills = new Set((seeker.skills || []).map((s) => norm(s.name)));

    if (!seekerTitle || seekerSkills.size === 0) {
      return res
        .status(400)
        .json({ error: "Set a desired title and at least one skill first" });
    }

    const postings = await db
      .collection("postings")
      .find({ status: { $ne: "closed" } })
      .toArray();

    let created = 0;
    for (const p of postings) {
      if (norm(p.title) !== seekerTitle) continue;
      const req_ = (p.requiredSkills || []).map(norm);
      const matched = req_.filter((r) => seekerSkills.has(r));
      if (matched.length === 0) continue;

      const existing = await db.collection("matches").findOne({
        seekerId: seeker._id,
        postingId: p._id,
      });
      if (existing) {
        await db
          .collection("matches")
          .updateOne({ _id: existing._id }, { $set: { matchedSkills: matched } });
      } else {
        await db.collection("matches").insertOne({
          seekerId: seeker._id,
          postingId: p._id,
          posterId: p.posterId,
          matchedSkills: matched,
          status: "pending",
          createdAt: new Date(),
        });
        created++;
      }
    }

    res.json({ created });
  } catch (err) {
    res.status(500).json({ error: "Generate failed" });
  }
});

// GET /api/matches/mine - list current user's matches (seeker or employer side)
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter =
      req.user.role === "seeker"
        ? { seekerId: req.user._id }
        : { posterId: req.user._id };

    const matches = await db
      .collection("matches")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "postings",
            localField: "postingId",
            foreignField: "_id",
            as: "posting",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "seekerId",
            foreignField: "_id",
            as: "seeker",
          },
        },
        { $unwind: { path: "$posting", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$seeker", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "seeker.password": 0,
            "seeker.email": 0,
          },
        },
      ])
      .toArray();

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// PUT /api/matches/:id - update match status (e.g. dismiss)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const match = await db
      .collection("matches")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!match) return res.status(404).json({ error: "Not found" });

    const isParticipant =
      match.seekerId.equals(req.user._id) || match.posterId.equals(req.user._id);
    if (!isParticipant) return res.status(403).json({ error: "Forbidden" });

    const allowed = ["pending", "unlocked", "dismissed"];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db
      .collection("matches")
      .updateOne({ _id: match._id }, { $set: { status: req.body.status } });
    const fresh = await db.collection("matches").findOne({ _id: match._id });
    res.json(fresh);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// DELETE /api/matches/:id - remove a match
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const match = await db
      .collection("matches")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!match) return res.status(404).json({ error: "Not found" });

    const isParticipant =
      match.seekerId.equals(req.user._id) || match.posterId.equals(req.user._id);
    if (!isParticipant) return res.status(403).json({ error: "Forbidden" });

    await db.collection("matches").deleteOne({ _id: match._id });
    await db.collection("messages").deleteMany({ matchId: match._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

module.exports = router;
