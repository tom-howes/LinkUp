const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../config/middleware");

const router = express.Router();

// GET /api/users/me - read own profile
router.get("/me", requireAuth, async (req, res) => {
  const { password, ...safe } = req.user;
  res.json(safe);
});

// GET /api/users/:id - read a single profile (public fields only)
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: "Not found" });
    const { password, email, ...pub } = user;
    res.json(pub);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
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
          return res
            .status(400)
            .json({ error: "Each skill needs a name and evidence" });
        }
        update.skills = clean;
      }
    } else {
      if (typeof req.body.companyName === "string") {
        update.companyName = req.body.companyName;
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    await db
      .collection("users")
      .updateOne({ _id: req.user._id }, { $set: update });
    const fresh = await db.collection("users").findOne({ _id: req.user._id });
    const { password, ...safe } = fresh;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE /api/users/me - delete own account
router.delete("/me", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const uid = req.user._id;
    await db.collection("users").deleteOne({ _id: uid });
    await db.collection("matches").deleteMany({ seekerId: uid });
    await db.collection("postings").deleteMany({ posterId: uid });
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
