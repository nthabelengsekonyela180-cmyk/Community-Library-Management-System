import { useEffect, useState } from "react";

const blank = { title: "", author: "", genre: "", isbn: "", quantity: "1" };

export default function BookForm({ initialBook, onSubmit, onCancel }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initialBook ? { ...initialBook, quantity: String(initialBook.quantity) } : blank);
    setError("");
  }, [initialBook]);

  function change(e) { setForm(current => ({ ...current, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.genre.trim() || !form.isbn.trim()) {
      setError("Please complete all fields."); return;
    }
    if (!/^[0-9]{1,}$/.test(form.quantity) || Number(form.quantity) < 0) {
      setError("Quantity must be a whole number of 0 or more."); return;
    }
    try {
      await onSubmit({ ...form, quantity: Number(form.quantity) });
      setForm(blank);
    } catch (err) { setError(err.message); }
  }

  return <form className="form-grid" onSubmit={submit}>
    <label>Book title<input name="title" value={form.title} onChange={change} placeholder="e.g. Things Fall Apart" /></label>
    <label>Author<input name="author" value={form.author} onChange={change} placeholder="Author's full name" /></label>
    <label>Genre<input name="genre" value={form.genre} onChange={change} placeholder="e.g. Fiction" /></label>
    <label>ISBN<input name="isbn" value={form.isbn} onChange={change} placeholder="ISBN number" /></label>
    <label className="quantity-field">Initial quantity<input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={change} /></label>
    {error && <p className="form-error full-width">{error}</p>}
    <div className="form-actions full-width"><button className="primary-button" type="submit">{initialBook ? "Save changes" : "Add book"}</button>{initialBook && <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
