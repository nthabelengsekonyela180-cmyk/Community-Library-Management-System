const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const membershipId = String(req.body.membershipId || "").trim();
    if (!membershipId) return res.status(400).json({ message: "Membership ID is required." });
    const [rows] = await pool.execute(
      "SELECT id, name, membership_id AS membershipId, role, created_at AS createdAt FROM users WHERE membership_id = ?",
      [membershipId]
    );
    if (!rows.length) return res.status(401).json({ message: "Membership ID not recognised. Ask an administrator to register you." });
    const user = rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "development_secret_change_me", { expiresIn: "12h" });
    res.json({ token, user });
  } catch (error) { next(error); }
});

router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
