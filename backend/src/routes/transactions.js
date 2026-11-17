const express = require("express");
const pool = require("../db");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const [transactions] = await pool.execute(`
      SELECT t.id, t.book_id AS bookId, b.title AS bookTitle, t.user_id AS userId,
             u.name AS userName, t.type, t.quantity, t.notes, t.created_at AS createdAt
      FROM transactions t
      LEFT JOIN books b ON b.id=t.book_id
      LEFT JOIN users u ON u.id=t.user_id
      ORDER BY t.created_at DESC, t.id DESC
    `);
    res.json({ transactions });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  const { bookId, type, quantity, notes = "" } = req.body;
  if (!Number.isInteger(Number(bookId)) || !["Borrow", "Restock"].includes(type) ||
      !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).json({ message: "Choose a book, a valid transaction type and a whole quantity of at least 1." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [books] = await connection.execute("SELECT id, quantity FROM books WHERE id=? FOR UPDATE", [bookId]);
    if (!books.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Book not found." });
    }
    const current = Number(books[0].quantity);
    const amount = Number(quantity);
    if (type === "Borrow" && current < amount) {
      await connection.rollback();
      return res.status(400).json({ message: `Not enough copies. Only ${current} available.` });
    }
    const updated = type === "Borrow" ? current - amount : current + amount;
    await connection.execute("UPDATE books SET quantity=? WHERE id=?", [updated, bookId]);
    await connection.execute(
      "INSERT INTO transactions (book_id, user_id, type, quantity, notes) VALUES (?, ?, ?, ?, ?)",
      [bookId, req.user.id, type, amount, String(notes).trim()]
    );
    await connection.commit();
    res.status(201).json({ message: "Transaction recorded.", quantity: updated });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally { connection.release(); }
});

module.exports = router;
