const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../config/middleware");

const router = express.Router();

// A match exists when a seeker's desiredTitle equals a posting's title and at
// least one of the seeker's skills is on the posting's requiredSkills list.
//
// Matching has to be able to run from *either* side. Generating only when a
// seeker opened their Matches page meant an employer could publish a posting
// that hundreds of seekers qualified for and see nothing at all, until one of
// those seekers happened to log in - the employer's half of the product looked
// broken through no fault of theirs.

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

/** The skills a seeker and a posting share, normalised. Empty means no match. */
function overlap(seeker, posting) {
  if (norm(seeker.desiredTitle) !== norm(posting.title)) return [];
  const skills = new Set((seeker.skills || []).map((s) => norm(s.name)));
  return (posting.requiredSkills || []).map(norm).filter((r) => skills.has(r));
}

/**
 * Upsert matches for every (seeker, posting) pair given. Returns how many were
 * newly created; pairs that already exist just have their matchedSkills
 * refreshed, so re-running is safe and never duplicates.
 */
async function reconcile(db, seekers, postings) {
  const ops = [];
  let created = 0;

  for (const seeker of seekers) {
    for (const posting of postings) {
      const matched = overlap(seeker, posting);
      if (matched.length === 0) continue;

      const existing = await db
        .collection("matches")
        .findOne(
          { seekerId: seeker._id, postingId: posting._id },
          { projection: { _id: 1 } }
        );

      if (existing) {
        ops.push({
          updateOne: {
            filter: { _id: existing._id },
            update: { $set: { matchedSkills: matched } },
          },
        });
      } else {
        ops.push({
          insertOne: {
            document: {
              seekerId: seeker._id,
              postingId: posting._id,
              posterId: posting.posterId,
              matchedSkills: matched,
              status: "pending",
              createdAt: new Date(),
            },
          },
        });
        created++;
      }
    }
  }

  if (ops.length) await db.collection("matches").bulkWrite(ops, { ordered: false });
  return created;
}

/** Recompute matches for one seeker against every open posting. */
async function generateForSeeker(db, seeker) {
  if (!norm(seeker.desiredTitle) || (seeker.skills || []).length === 0) {
    return { error: "Set a desired title and at least one skill first" };
  }
  const postings = await db
    .collection("postings")
    .find({ status: { $ne: "closed" } })
    .toArray();
  return { created: await reconcile(db, [seeker], postings) };
}

/** Recompute matches for one employer's open postings against every seeker. */
async function generateForEmployer(db, employerId) {
  const postings = await db
    .collection("postings")
    .find({ posterId: employerId, status: { $ne: "closed" } })
    .toArray();
  if (postings.length === 0) return { created: 0 };

  // Only seekers who could possibly match: same title as one of the postings.
  const titles = [...new Set(postings.map((p) => norm(p.title)))];
  const seekers = await db
    .collection("users")
    .find({
      role: "seeker",
      desiredTitle: { $in: titles.map((t) => new RegExp(`^${escapeRegex(t)}$`, "i")) },
    })
    .toArray();

  return { created: await reconcile(db, seekers, postings) };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /api/matches/generate - recompute matches for whoever is signed in.
// Seekers match their profile against every open posting; employers match
// their own postings against every seeker.
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const result =
      req.user.role === "seeker"
        ? await generateForSeeker(db, req.user)
        : await generateForEmployer(db, req.user._id);

    if (result.error) return res.status(400).json({ error: result.error });
    res.json({ created: result.created });
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
        // The hiring company, so a seeker's match card can name who posted the
        // job rather than showing the title alone.
        {
          $lookup: {
            from: "users",
            localField: "posterId",
            foreignField: "_id",
            as: "poster",
          },
        },
        { $unwind: { path: "$posting", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$seeker", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$poster", preserveNullAndEmptyArrays: true } },
        // Carry the company onto the posting, so posting.poster.companyName
        // means the same thing here as it does on a browse result.
        { $set: { "posting.poster": { companyName: "$poster.companyName" } } },
        {
          $project: {
            poster: 0,
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
// Exposed so postings.js can reconcile matches the moment a posting is
// created or edited, rather than waiting for the employer to open Matches.
module.exports.generateForEmployer = generateForEmployer;
