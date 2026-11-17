import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import StatCard from "../components/StatCard";
import BookTable from "../components/BookTable";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/books"), api("/transactions"), api("/users")])
      .then(([b, t, u]) => { setBooks(b.books); setTransactions(t.transactions); setUsers(u.users); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const copies = books.reduce((sum, book) => sum + Number(book.quantity), 0);
  const lowStock = books.filter(book => book.quantity < 2);
  const recent = transactions.slice(0, 5);

  if (loading) return <div className="loading">Loading dashboard…</div>;
  return <>
    <div className="page-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Your library at a glance</h2><p>Here is what is happening in your library today.</p></div><Link className="primary-button link-button" to="/books">Manage books <span>→</span></Link></div>
    {error && <div className="alert error">{error}</div>}
    <div className="stats-grid">
      <StatCard label="BOOK TITLES" value={books.length} detail="Different titles in catalogue" icon="▤" tone="blue"/>
      <StatCard label="TOTAL COPIES" value={copies} detail="Copies currently in stock" icon="▣" tone="purple"/>
      <StatCard label="LOW STOCK" value={lowStock.length} detail="Titles with fewer than 2 copies" icon="!" tone="orange"/>
      <StatCard label="REGISTERED USERS" value={users.length} detail="Library members and admins" icon="♙" tone="green"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-heading"><div><h3>Book availability</h3><p>Current stock across your catalogue</p></div><Link to="/books" className="subtle-link">View all →</Link></div><BookTable books={books.slice(0, 6)}/></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>Latest stock movements</p></div><Link to="/transactions" className="subtle-link">View all →</Link></div>
        {recent.length ? <div className="activity-list">{recent.map(item => <div className="activity-item" key={item.id}><div className={`activity-icon ${item.type === "Borrow" ? "borrow" : "restock"}`}>{item.type === "Borrow" ? "↗" : "↙"}</div><div className="activity-copy"><strong>{item.type === "Borrow" ? "Book borrowed" : "Stock added"}</strong><span>{item.bookTitle} · {item.userName || "Library"}</span></div><b className={item.type === "Borrow" ? "negative" : "positive"}>{item.type === "Borrow" ? "−" : "+"}{item.quantity}</b></div>)}</div> : <div className="empty-small">No transactions have been recorded yet.</div>}
      </section>
    </div>
    {lowStock.length > 0 && <section className="notice-card"><div className="notice-symbol">!</div><div><strong>Stock needs attention</strong><p>{lowStock.length} title(s) have fewer than 2 copies available. Consider adding stock.</p></div><Link to="/transactions" className="subtle-link">Restock books →</Link></section>}
  </>;
}
