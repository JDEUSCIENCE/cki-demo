import { useEffect, useRef, useState } from 'react'

const MIN_CHARS = 3
const MAX_SUGGESTIONS = 8

// Suggests institutions from a bundled subset of the public ROR (Research Organization
// Registry) dataset (data/ror_institutions.json). Loaded lazily via a dynamic import --
// Vite code-splits it into its own chunk, fetched once on first use and cached in memory,
// no network call beyond the site's own static assets. Works fully offline once the site
// itself is loaded, the same way CityAutocomplete works for cities.
//
// Picking a suggestion attaches its ROR ID (and, via the build-time coordinate resolver,
// its coordinates) behind the scenes -- the field stays plain free text, and a user who
// never picks a suggestion never sees or types a ROR ID.
let institutionsPromise = null
function loadInstitutions() {
  if (!institutionsPromise) {
    institutionsPromise = import('../../data/ror_institutions.json').then((mod) => mod.default)
  }
  return institutionsPromise
}

export default function InstitutionAutocomplete({ value, onChange, onPick, help }) {
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
    loadInstitutions().then((institutions) => {
      if (cancelled) return
      const matches = institutions
        .filter((inst) => inst.name.toLowerCase().includes(query))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1
          const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1
          if (aStarts !== bStarts) return aStarts - bStarts
          return a.name.localeCompare(b.name)
        })
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

  const pick = (inst) => {
    onPick(inst)
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
          {suggestions.map((inst) => (
            <li key={inst.ror_id}>
              <button type="button" onMouseDown={() => pick(inst)}>
                {inst.name} <span className="field-autocomplete-meta">{inst.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
