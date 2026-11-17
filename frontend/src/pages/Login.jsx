import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!membershipId.trim()) { setError("Enter your membership ID."); return; }
    setBusy(true);
    try { await login(membershipId.trim()); navigate("/"); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="login-screen">
    <div className="login-art"><div className="login-art-content"><div className="brand-mark large">CL</div><span className="eyebrow light">A PLACE TO LEARN & GROW</span><h1>Every book opens<br/>a new possibility.</h1><p>Manage your community library, keep track of books and help knowledge travel further.</p><div className="book-stack"><span>READ</span><span>LEARN</span><span>GROW</span></div></div></div>
    <div className="login-panel"><div className="login-box"><span className="eyebrow">WELCOME BACK</span><h2>Sign in to your library</h2><p>Use your library membership ID to continue.</p>
      <form onSubmit={submit}><label>Membership ID<input autoFocus value={membershipId} onChange={e => setMembershipId(e.target.value)} placeholder="Enter membership ID" /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button wide" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <span>→</span></button></form>
      <div className="login-help"><strong>Demo accounts</strong><span>Admin: <code>admin</code></span><span>Member: <code>member001</code></span><small>These accounts are created when you run the database seed script.</small></div>
    </div></div>
  </div>;
}
