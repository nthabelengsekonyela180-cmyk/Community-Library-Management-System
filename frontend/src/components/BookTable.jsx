export default function BookTable({ books, onEdit, onDelete, showActions = false }) {
  if (!books.length) return <div className="empty-state"><div className="empty-icon">▤</div><strong>No books found</strong><span>Add a book to start building your catalogue.</span></div>;
  return <div className="table-wrap"><table>
    <thead><tr><th>BOOK TITLE</th><th>AUTHOR</th><th>GENRE</th><th>ISBN</th><th>IN STOCK</th>{showActions && <th>ACTIONS</th>}</tr></thead>
    <tbody>{books.map(book => <tr key={book.id}>
      <td><strong>{book.title}</strong></td><td>{book.author}</td><td><span className="genre-tag">{book.genre}</span></td><td className="muted-cell">{book.isbn}</td>
      <td><span className={`stock-pill ${book.quantity < 2 ? "low" : "good"}`}>{book.quantity} {book.quantity === 1 ? "copy" : "copies"}</span></td>
      {showActions && <td><div className="action-group"><button className="text-button" onClick={() => onEdit(book)}>Edit</button><button className="text-button danger-text" onClick={() => onDelete(book)}>Delete</button></div></td>}
    </tr>)}</tbody>
  </table></div>;
}
