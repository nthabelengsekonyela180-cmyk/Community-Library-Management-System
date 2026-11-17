export default function StatCard({ label, value, detail, icon, tone = "blue" }) {
  return <article className="stat-card">
    <div className={`stat-icon ${tone}`}>{icon}</div>
    <div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>
  </article>;
}
