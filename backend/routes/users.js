const express = require("express");
const { getDB } = require("../config/db");
const { requireAuth } = require("../config/middleware");

const router = express.Router();

// GET /api/users/titles - distinct desired titles across jobseekers.
// Feeds the employer's posting-title datalist so their wording lines up with
// the titles seekers are actually searching under.
router.get("/titles", async (req, res) => {
  try {
    const db = getDB();
    const titles = await db
      .collection("users")
      .distinct("desiredTitle", { role: "seeker" });
    res.json(titles.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// PUT /api/users/me - update own profile (desiredTitle + skills, or companyName)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const update = {};

    if (req.user.role === "seeker") {
      if (typeof req.body.desiredTitle === "string") {
        update.desiredTitle = req.body.desiredTitle;
      }
      if (Array.isArray(req.body.skills)) {
        if (req.body.skills.length > 3) {
          return res.status(400).json({ error: "Max 3 skills" });
        }
        const clean = req.body.skills.map((s) => ({
          name: String(s.name || "").trim(),
          evidence: String(s.evidence || "").trim(),
        }));
        if (clean.some((s) => !s.name || !s.evidence)) {
          return res.status(400).json({ error: "Each skill needs a name and evidence" });
        }
        update.skills = clean;
      }
    } else {
      if (typeof req.body.companyName === "string") {
        const name = req.body.companyName.trim();
        // An employer cannot blank this out - it is what identifies them on
        // every posting and match a jobseeker sees.
        if (!name) return res.status(400).json({ error: "Company name is required" });
        update.companyName = name;
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    await db.collection("users").updateOne({ _id: req.user._id }, { $set: update });
    const fresh = await db.collection("users").findOne({ _id: req.user._id });
    const { password, ...safe } = fresh;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE /api/users/me - delete own account and everything that hangs off it.
// Cascades in dependency order: messages -> matches -> postings -> the user,
// so no thread or match is ever left pointing at somebody who no longer exists.
router.delete("/me", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const uid = req.user._id;

    const matches = await db
      .collection("matches")
      .find({ $or: [{ seekerId: uid }, { posterId: uid }] })
      .toArray();
    const matchIds = matches.map((m) => m._id);

    if (matchIds.length) {
      await db.collection("messages").deleteMany({ matchId: { $in: matchIds } });
      await db.collection("matches").deleteMany({ _id: { $in: matchIds } });
    }
    await db.collection("postings").deleteMany({ posterId: uid });
    await db.collection("users").deleteOne({ _id: uid });

    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ ok: true });
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
