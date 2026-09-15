import { useMemo, useState } from 'react'
import { useProfiles } from '../lib/ProfilesContext.jsx'
import { filterProfiles, emptyFilters } from '../lib/filterProfiles.js'
import { vocab, esTopicGroups } from '../lib/vocab.js'
import MultiSelectFilter from '../components/MultiSelectFilter.jsx'
import ProfileCard from '../components/ProfileCard.jsx'

export default function Search() {
  const { allProfiles } = useProfiles()
  const [filters, setFilters] = useState(emptyFilters)
  const [freeText, setFreeText] = useState('')

  const results = useMemo(() => filterProfiles(allProfiles, filters, freeText), [allProfiles, filters, freeText])

  const setFilter = (key) => (values) => setFilters((f) => ({ ...f, [key]: values }))

  const esTopicNames = esTopicGroups.map((g) => g.group)
  const countriesInUse = useMemo(
    () => Array.from(new Set(allProfiles.map((p) => p.country).filter(Boolean))).sort(),
    [allProfiles],
  )

  return (
    <section className="page page-search">
      <h1>Search</h1>
      <input
        type="search"
        className="free-text-search"
        placeholder="Search name, institution, keywords, projects, offering / seeking..."
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        aria-label="Free-text search"
      />
      <div className="search-layout">
        <aside className="search-filters card">
          <MultiSelectFilter
            label="Country"
            options={countriesInUse.length > 0 ? countriesInUse : vocab.countries}
            selected={filters.country}
            onChange={setFilter('country')}
          />
          <MultiSelectFilter
            label="Career stage"
            options={vocab.career_stage}
            selected={filters.career_stage}
            onChange={setFilter('career_stage')}
          />
          <MultiSelectFilter
            label="ES topics"
            options={esTopicNames}
            selected={filters.es_topics}
            onChange={setFilter('es_topics')}
          />
          <MultiSelectFilter
            label="Methods"
            options={vocab.methods}
            selected={filters.methods}
            onChange={setFilter('methods')}
          />
          <MultiSelectFilter
            label="Ecosystem focus"
            options={vocab.ecosystem_focus}
            selected={filters.ecosystem_focus}
            onChange={setFilter('ecosystem_focus')}
          />
          <MultiSelectFilter
            label="Open to"
            options={vocab.open_to}
            selected={filters.open_to}
            onChange={setFilter('open_to')}
          />
          <MultiSelectFilter
            label="Availability status"
            options={vocab.availability_status}
            selected={filters.availability_status}
            onChange={setFilter('availability_status')}
          />
        </aside>
        <div className="search-results">
          <p className="result-count">{results.length} profile(s) found</p>
          {results.length === 0 && allProfiles.length === 0 && (
            <p className="note-card empty-state">No profiles are published on this demonstration yet.</p>
          )}
          <div className="profile-card-grid">
            {results.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
