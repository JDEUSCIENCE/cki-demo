export default function BarList({ title, counts }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = entries.length > 0 ? entries[0][1] : 1

  return (
    <div className="bar-list card">
      <h3>{title}</h3>
      {entries.length === 0 && <p className="empty-state">No data yet.</p>}
      <ul>
        {entries.map(([label, count]) => (
          <li key={label}>
            <span className="bar-list-label">{label}</span>
            <span className="bar-list-row">
              <span className="bar-list-track">
                <span className="bar-list-fill" style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className="bar-list-count">{count}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
