import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import BookForm from "../components/BookForm";
import BookTable from "../components/BookTable";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() { const data = await api("/books"); setBooks(data.books); }
  useEffect(() => { load().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);

  async function saveBook(values) {
    setError(""); setMessage("");
    if (editing) {
      await api(`/books/${editing.id}`, { method: "PUT", body: JSON.stringify(values) });
      setMessage("Book details updated successfully."); setEditing(null);
    } else {
      await api("/books", { method: "POST", body: JSON.stringify(values) });
      setMessage("Book added to the catalogue.");
    }
    await load();
  }

  async function deleteBook(book) {
    if (!window.confirm(`Delete "${book.title}" from the catalogue?`)) return;
    try { await api(`/books/${book.id}`, { method: "DELETE" }); setMessage("Book deleted."); await load(); }
    catch (err) { setError(err.message); }
  }

  const filtered = useMemo(() => books.filter(book =>
    [book.title, book.author, book.genre, book.isbn].some(value => String(value).toLowerCase().includes(search.toLowerCase()))
  ), [books, search]);

  if (loading) return <div className="loading">Loading books…</div>;
  return <>
    <div className="page-heading"><div><span className="eyebrow">CATALOGUE</span><h2>Book management</h2><p>Add, update and maintain the books in your library.</p></div><div className="count-chip">{books.length} titles</div></div>
    {message && <div className="alert success">{message}</div>}{error && <div className="alert error">{error}</div>}
    <section className="panel form-panel"><div className="panel-heading"><div><h3>{editing ? "Update book details" : "Add a new book"}</h3><p>{editing ? "Make changes to the selected title." : "Enter the details of the book you want to add."}</p></div>{editing && <button className="text-button" onClick={() => setEditing(null)}>Clear edit</button>}</div><BookForm initialBook={editing} onSubmit={saveBook} onCancel={() => setEditing(null)}/></section>
    <section className="panel"><div className="panel-heading responsive-heading"><div><h3>All books</h3><p>Manage availability and book details</p></div><input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, author, genre…" /></div><BookTable books={filtered} showActions onEdit={setEditing} onDelete={deleteBook}/></section>
  </>;
}
