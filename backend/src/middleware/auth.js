const jwt = require("jsonwebtoken");
const pool = require("../db");

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "development_secret_change_me");
    const [rows] = await pool.execute(
      "SELECT id, name, membership_id AS membershipId, role, created_at AS createdAt FROM users WHERE id = ?",
      [payload.id]
    );
    if (!rows.length) return res.status(401).json({ message: "Your account could not be found." });
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session is invalid or has expired." });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "Admin") return res.status(403).json({ message: "Administrator access is required." });
  next();
}

module.exports = { authenticate, adminOnly };
