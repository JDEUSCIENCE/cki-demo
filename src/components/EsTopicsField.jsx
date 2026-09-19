import { useState } from 'react'
import { ES_TOPIC_SECTION_ORDER, esTopicValue, esTopicsBySection } from '../lib/vocab.js'

// Searchable, grouped multi-select for "ES topics / services". Shows the JO-authorised
// plain-language label; the value ticked into `onChange` is the official CICES
// "<code> <class>" string (see esTopicValue in vocab.js), never the label. Used
// identically in the Create-a-profile form and the Search filter, both reading the
// same 63-class subset from data/vocabularies.json via vocab.js.
export default function EsTopicsField({ value, onChange, help }) {
  const [query, setQuery] = useState('')
  const [openSections, setOpenSections] = useState(() => new Set())

  const sections = esTopicsBySection()
  const q = query.trim().toLowerCase()

  const toggleClass = (val) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val])
  }

  const toggleSection = (name) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="es-topics-field">
      <input
        type="search"
        className="es-topics-search"
        placeholder="Search ES topics / services..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search ES topics / services"
      />
      {help && <span className="form-field-help">{help}</span>}
      {ES_TOPIC_SECTION_ORDER.map((section) => {
        const entries = sections.get(section) || []
        const visible = q ? entries.filter((entry) => entry.label.toLowerCase().includes(q)) : entries
        if (q && visible.length === 0) return null
        const isOpen = q ? true : openSections.has(section)
        return (
          <div className="es-topics-section" key={section}>
            <button
              type="button"
              className="es-topics-section-header"
              onClick={() => toggleSection(section)}
              aria-expanded={isOpen}
            >
              <span className="es-topics-section-toggle">{isOpen ? '▾' : '▸'}</span>
              <span>{section}</span>
            </button>
            {isOpen && (
              <div className="filter-options">
                {visible.map((entry) => {
                  const val = esTopicValue(entry)
                  return (
                    <label key={entry.code} className="filter-option">
                      <input type="checkbox" checked={value.includes(val)} onChange={() => toggleClass(val)} />
                      {entry.label}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
