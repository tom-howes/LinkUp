const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../config/middleware");

const router = express.Router();

// Owned by: Thomas Howes (Postings & Chat)

// Attach the poster's company name to a list of postings (single lookup).
const withPoster = [
  {
    $lookup: {
      from: "users",
      localField: "posterId",
      foreignField: "_id",
      as: "poster",
    },
  },
  { $unwind: { path: "$poster", preserveNullAndEmptyArrays: true } },
  { $project: { "poster.password": 0, "poster.email": 0 } },
];

// Validate + clean 1-2 required skills. Returns { skills } or { error }.
function cleanRequiredSkills(input) {
  if (!Array.isArray(input)) return { error: "requiredSkills must be an array" };
  const skills = input.map((s) => String(s || "").trim()).filter((s) => s.length > 0);
  if (skills.length < 1 || skills.length > 2) {
    return { error: "A posting needs 1 or 2 required skills" };
  }
  return { skills };
}

// GET /api/postings?search=&title= - browse/search open postings
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const filter = { status: { $ne: "closed" } };

    if (req.query.title) {
      // exact title match (case-insensitive), anchored
      filter.title = new RegExp(`^${escapeRegex(req.query.title.trim())}$`, "i");
    }

    if (req.query.search) {
      const rx = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [
        { title: rx },
        { description: rx },
        { location: rx },
        { requiredSkills: rx },
      ];
    }

    const postings = await db
      .collection("postings")
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
        ...withPoster,
      ])
      .toArray();

    res.json(postings);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// GET /api/postings/mine - employer's own postings
router.get("/mine", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Employers only" });
    }
    const db = getDB();
    const postings = await db
      .collection("postings")
      .find({ posterId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(postings);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// GET /api/postings/:id - single posting detail
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const results = await db
      .collection("postings")
      .aggregate([{ $match: { _id: new ObjectId(req.params.id) } }, ...withPoster])
      .toArray();
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// POST /api/postings - create a posting (employer only, max 2 required skills)
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Employers only" });
    }
    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ error: "Title is required" });

    const { skills, error } = cleanRequiredSkills(req.body.requiredSkills);
    if (error) return res.status(400).json({ error });

    const db = getDB();
    const doc = {
      title,
      requiredSkills: skills,
      description: String(req.body.description || "").trim(),
      location: String(req.body.location || "").trim(),
      posterId: req.user._id,
      status: "open",
      createdAt: new Date(),
    };
    const result = await db.collection("postings").insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Create failed" });
  }
});

// PUT /api/postings/:id - edit a posting (author only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const posting = await db
      .collection("postings")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!posting) return res.status(404).json({ error: "Not found" });
    if (!posting.posterId.equals(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const update = {};
    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();
      if (!title) return res.status(400).json({ error: "Title is required" });
      update.title = title;
    }
    if (req.body.requiredSkills !== undefined) {
      const { skills, error } = cleanRequiredSkills(req.body.requiredSkills);
      if (error) return res.status(400).json({ error });
      update.requiredSkills = skills;
    }
    if (typeof req.body.description === "string") {
      update.description = req.body.description.trim();
    }
    if (typeof req.body.location === "string") {
      update.location = req.body.location.trim();
    }
    if (req.body.status !== undefined) {
      if (!["open", "closed"].includes(req.body.status)) {
        return res.status(400).json({ error: "status must be open or closed" });
      }
      update.status = req.body.status;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    await db.collection("postings").updateOne({ _id: posting._id }, { $set: update });
    const fresh = await db.collection("postings").findOne({ _id: posting._id });
    res.json(fresh);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// DELETE /api/postings/:id - delete a posting (author only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const posting = await db
      .collection("postings")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!posting) return res.status(404).json({ error: "Not found" });
    if (!posting.posterId.equals(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Cascade: remove matches for this posting and their messages.
    const matches = await db
      .collection("matches")
      .find({ postingId: posting._id })
      .toArray();
    const matchIds = matches.map((m) => m._id);
    if (matchIds.length) {
      await db.collection("messages").deleteMany({ matchId: { $in: matchIds } });
      await db.collection("matches").deleteMany({ postingId: posting._id });
    }
    await db.collection("postings").deleteOne({ _id: posting._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// Escape user input before using it inside a RegExp.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;
