import { useEffect, useRef, useState } from 'react'

const MIN_CHARS = 3
const MAX_SUGGESTIONS = 8

// Suggests cities from the same GeoNames cut already bundled for build-time
// coordinate resolution (data/gazetteer_cities.json). Loaded lazily via a
// dynamic import -- Vite code-splits it into its own chunk, fetched once on
// first use and cached in memory, no network call beyond the site's own
// static assets. Works fully offline once the site itself is loaded.
let gazetteerPromise = null
function loadGazetteer() {
  if (!gazetteerPromise) {
    gazetteerPromise = import('../../data/gazetteer_cities.json').then((mod) => mod.default)
  }
  return gazetteerPromise
}

export default function CityAutocomplete({ value, onChange, help }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const query = value.trim().toLowerCase()
    if (query.length < MIN_CHARS) {
      setSuggestions([])
      setOpen(false)
      return
    }
    let cancelled = false
    loadGazetteer().then((cities) => {
      if (cancelled) return
      const matches = cities
        .filter((c) => c.city.toLowerCase().includes(query))
        .sort((a, b) => b.population - a.population)
        .slice(0, MAX_SUGGESTIONS)
      setSuggestions(matches)
      setOpen(matches.length > 0)
    })
    return () => {
      cancelled = true
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pick = (city) => {
    onChange(city.city)
    setOpen(false)
  }

  return (
    <div className="field-autocomplete" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {help && <span className="form-field-help">{help}</span>}
      {open && (
        <ul className="field-autocomplete-list">
          {suggestions.map((c, i) => (
            <li key={`${c.city}-${c.country}-${i}`}>
              <button type="button" onMouseDown={() => pick(c)}>
                {c.city} <span className="field-autocomplete-meta">{c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
