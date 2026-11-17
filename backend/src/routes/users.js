const express = require("express");
const pool = require("../db");
const { authenticate, adminOnly } = require("../middleware/auth");
const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, membership_id AS membershipId, role, created_at AS createdAt FROM users ORDER BY name"
    );
    res.json({ users });
  } catch (error) { next(error); }
});

router.post("/", adminOnly, async (req, res, next) => {
  try {
    const { name, membershipId, role = "Member" } = req.body;
    if (!String(name || "").trim() || !String(membershipId || "").trim() || !["Admin", "Member"].includes(role)) {
      return res.status(400).json({ message: "Enter a name, membership ID and valid role." });
    }
    const [result] = await pool.execute(
      "INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?)",
      [name.trim(), membershipId.trim(), role]
    );
    res.status(201).json({ id: result.insertId, message: "User created successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That membership ID is already in use." });
    next(error);
  }
});

router.put("/:id", adminOnly, async (req, res, next) => {
  try {
    const { name, membershipId, role } = req.body;
    if (!String(name || "").trim() || !String(membershipId || "").trim() || !["Admin", "Member"].includes(role)) {
      return res.status(400).json({ message: "Enter a name, membership ID and valid role." });
    }
    const [result] = await pool.execute(
      "UPDATE users SET name=?, membership_id=?, role=? WHERE id=?",
      [name.trim(), membershipId.trim(), role, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That membership ID is already in use." });
    next(error);
  }
});

router.delete("/:id", adminOnly, async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: "You cannot delete your own account." });
    const [result] = await pool.execute("DELETE FROM users WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted successfully." });
  } catch (error) { next(error); }
});

module.exports = router;
