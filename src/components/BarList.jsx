const OKABE_ITO = ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#000000']

export default function BarList({ title, counts }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = entries.length > 0 ? entries[0][1] : 1

  return (
    <div className="bar-list">
      <h3>{title}</h3>
      {entries.length === 0 && <p className="empty-state">No data yet.</p>}
      <ul>
        {entries.map(([label, count], i) => (
          <li key={label}>
            <span className="bar-list-label">{label}</span>
            <span className="bar-list-track">
              <span
                className="bar-list-fill"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: OKABE_ITO[i % OKABE_ITO.length] }}
              />
            </span>
            <span className="bar-list-count">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
