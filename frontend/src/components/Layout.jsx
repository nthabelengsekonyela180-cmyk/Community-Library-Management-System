import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["/", "Dashboard", "▦"],
  ["/books", "Books", "▤"],
  ["/transactions", "Transactions", "⇄"],
  ["/users", "Users", "♙"]
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">CL</div>
        <div><strong>Community</strong><span>Library system</span></div>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {links.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/"}>
          <span className="nav-icon">{icon}</span>{label}
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "L"}</div>
        <div className="user-mini"><strong>{user?.name || "Library user"}</strong><span>{user?.role || "Member"}</span></div>
        <button className="icon-button" title="Log out" onClick={handleLogout}>↪</button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div><span className="eyebrow">LIBRARY MANAGEMENT</span><h1>Good day, {user?.name?.split(" ")[0] || "there"}</h1></div>
        <div className="topbar-right"><span className="status-dot"></span> System online</div>
      </header>
      <section className="page-content"><Outlet /></section>
    </main>
  </div>;
}
