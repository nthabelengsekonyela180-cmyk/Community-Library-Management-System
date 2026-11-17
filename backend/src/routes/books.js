const express = require("express");
const pool = require("../db");
const { authenticate, adminOnly } = require("../middleware/auth");
const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const [books] = await pool.execute(
      "SELECT id, title, author, genre, isbn, quantity, created_at AS createdAt, updated_at AS updatedAt FROM books ORDER BY title"
    );
    res.json({ books });
  } catch (error) { next(error); }
});

router.post("/", adminOnly, async (req, res, next) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (![title, author, genre, isbn].every(value => String(value || "").trim()) ||
        !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ message: "Enter title, author, genre, ISBN and a valid quantity." });
    }
    const [result] = await pool.execute(
      "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    const [rows] = await pool.execute("SELECT id, title, author, genre, isbn, quantity FROM books WHERE id = ?", [result.insertId]);
    res.status(201).json({ book: rows[0] });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "A book with this ISBN already exists." });
    next(error);
  }
});

router.put("/:id", adminOnly, async (req, res, next) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (![title, author, genre, isbn].every(value => String(value || "").trim()) ||
        !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ message: "Enter all book details and a valid quantity." });
    }
    const [result] = await pool.execute(
      "UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?",
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found." });
    res.json({ message: "Book updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "A book with this ISBN already exists." });
    next(error);
  }
});

router.delete("/:id", adminOnly, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM books WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found." });
    res.json({ message: "Book deleted successfully." });
  } catch (error) { next(error); }
});

module.exports = router;
