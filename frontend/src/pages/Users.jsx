import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const empty = { name: "", membershipId: "", role: "Member" };

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() { const data = await api("/users"); setUsers(data.users); }
  useEffect(() => { load().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);

  function edit(item) { setEditing(item); setForm({ name: item.name, membershipId: item.membershipId, role: item.role }); }
  function reset() { setEditing(null); setForm(empty); }

  async function submit(e) {
    e.preventDefault(); setMessage(""); setError("");
    if (!form.name.trim() || !form.membershipId.trim()) { setError("Name and membership ID are required."); return; }
    try {
      if (editing) {
        await api(`/users/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        setMessage("User updated successfully.");
      } else {
        await api("/users", { method: "POST", body: JSON.stringify(form) });
        setMessage("New user added. Their membership ID is their login credential.");
      }
      reset(); await load();
    } catch (err) { setError(err.message); }
  }

  async function remove(item) {
    if (item.id === user.id) { setError("You cannot delete the account you are currently using."); return; }
    if (!window.confirm(`Delete user "${item.name}"?`)) return;
    try { await api(`/users/${item.id}`, { method: "DELETE" }); setMessage("User deleted."); await load(); }
    catch (err) { setError(err.message); }
  }

  if (loading) return <div className="loading">Loading users…</div>;
  return <>
    <div className="page-heading"><div><span className="eyebrow">MEMBERSHIP</span><h2>User management</h2><p>Manage library members and administrator accounts.</p></div><div className="count-chip">{users.length} users</div></div>
    {message && <div className="alert success">{message}</div>}{error && <div className="alert error">{error}</div>}
    {user.role === "Admin" ? <>
      <section className="panel form-panel"><div className="panel-heading"><div><h3>{editing ? "Update user" : "Add a user"}</h3><p>Create a member or administrator account.</p></div></div>
        <form className="form-grid" onSubmit={submit}>
          <label>Full name<input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name"/></label>
          <label>Membership ID<input value={form.membershipId} onChange={e => setForm({...form, membershipId: e.target.value})} placeholder="Unique membership ID"/></label>
          <label>Role<select value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option>Member</option><option>Admin</option></select></label>
          <div className="form-actions align-end"><button className="primary-button">{editing ? "Save changes" : "Add user"}</button>{editing && <button type="button" className="secondary-button" onClick={reset}>Cancel</button>}</div>
        </form>
      </section>
    </> : <div className="alert info">You are signed in as a member. Only administrators can add, edit or delete user accounts.</div>}
    <section className="panel"><div className="panel-heading"><div><h3>Registered users</h3><p>Library account directory</p></div></div>
      {users.length ? <div className="table-wrap"><table><thead><tr><th>NAME</th><th>MEMBERSHIP ID</th><th>ROLE</th><th>JOINED</th>{user.role === "Admin" && <th>ACTIONS</th>}</tr></thead><tbody>{users.map(item => <tr key={item.id}><td><div className="person-cell"><span className="avatar small">{item.name.slice(0,1).toUpperCase()}</span><strong>{item.name}</strong></div></td><td>{item.membershipId}</td><td><span className={`role-pill ${item.role === "Admin" ? "admin" : ""}`}>{item.role}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td>{user.role === "Admin" && <td><div className="action-group"><button className="text-button" onClick={() => edit(item)}>Edit</button><button className="text-button danger-text" onClick={() => remove(item)}>Delete</button></div></td>}</tr>)}</tbody></table></div> : <div className="empty-state">No users registered.</div>}
    </section>
  </>;
}
