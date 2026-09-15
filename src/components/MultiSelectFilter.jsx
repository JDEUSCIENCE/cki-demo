export default function MultiSelectFilter({ label, options, selected, onChange }) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      <div className="filter-options">
        {options.map((opt) => (
          <label key={opt} className="filter-option">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
