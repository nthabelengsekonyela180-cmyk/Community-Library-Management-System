import { useEffect, useState } from "react";
import { api } from "../api";

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ bookId: "", type: "Borrow", quantity: "1", notes: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [b, t] = await Promise.all([api("/books"), api("/transactions")]);
    setBooks(b.books); setTransactions(t.transactions);
    if (!form.bookId && b.books.length) setForm(current => ({ ...current, bookId: String(b.books[0].id) }));
  }
  useEffect(() => { load().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    if (!form.bookId || Number(form.quantity) < 1 || !Number.isInteger(Number(form.quantity))) {
      setError("Choose a book and enter a whole quantity of at least 1."); return;
    }
    try {
      await api("/transactions", { method: "POST", body: JSON.stringify({ ...form, bookId: Number(form.bookId), quantity: Number(form.quantity) }) });
      setMessage(form.type === "Borrow" ? "Borrowing recorded and stock deducted." : "New stock recorded successfully.");
      setForm(current => ({ ...current, quantity: "1", notes: "" }));
      await load();
    } catch (err) { setError(err.message); }
  }

  if (loading) return <div className="loading">Loading transactions…</div>;
  return <>
    <div className="page-heading"><div><span className="eyebrow">STOCK CONTROL</span><h2>Transactions</h2><p>Record borrowed books and new stock arrivals.</p></div><div className="count-chip">{transactions.length} records</div></div>
    {message && <div className="alert success">{message}</div>}{error && <div className="alert error">{error}</div>}
    <div className="transaction-layout">
      <section className="panel"><div className="panel-heading"><div><h3>Record a transaction</h3><p>Stock changes are applied automatically.</p></div></div>
        <form className="stack-form" onSubmit={submit}>
          <label>Book<select value={form.bookId} onChange={e => setForm({...form, bookId: e.target.value})}><option value="">Select a book</option>{books.map(book => <option key={book.id} value={book.id}>{book.title} ({book.quantity} available)</option>)}</select></label>
          <label>Transaction type<select value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="Borrow">Borrow book (deduct stock)</option><option value="Restock">Add new stock</option></select></label>
          <label>Quantity<input type="number" min="1" step="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}/></label>
          <label>Notes <span className="optional">(optional)</span><textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Add a note about this transaction…"/></label>
          <button className="primary-button wide" disabled={!books.length}>Save transaction <span>→</span></button>
          <p className="helper-text">Borrowing is only allowed when enough copies are in stock.</p>
        </form>
      </section>
      <section className="panel"><div className="panel-heading"><div><h3>Stock summary</h3><p>Current available copies</p></div></div><div className="stock-summary">{books.slice(0, 8).map(book => <div key={book.id} className="stock-row"><div><strong>{book.title}</strong><span>{book.author}</span></div><b className={book.quantity < 2 ? "negative" : ""}>{book.quantity}</b></div>)}</div></section>
    </div>
    <section className="panel"><div className="panel-heading"><div><h3>Transaction history</h3><p>A record of all borrowing and restocking activity</p></div></div>
      {transactions.length ? <div className="table-wrap"><table><thead><tr><th>DATE</th><th>BOOK</th><th>TYPE</th><th>QUANTITY</th><th>RECORDED BY</th><th>NOTES</th></tr></thead><tbody>{transactions.map(item => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString()}</td><td><strong>{item.bookTitle}</strong></td><td><span className={`stock-pill ${item.type === "Borrow" ? "low" : "good"}`}>{item.type}</span></td><td>{item.quantity}</td><td>{item.userName}</td><td>{item.notes || "—"}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>No transactions yet</strong><span>Recorded borrowing and restocking will appear here.</span></div>}
    </section>
  </>;
}
