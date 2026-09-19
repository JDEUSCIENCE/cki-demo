const FREE_TEXT_FIELDS = ['name', 'institution', 'keywords', 'current_projects', 'offering_seeking']

function matchesMulti(profileValue, selected) {
  if (!selected || selected.length === 0) return true
  if (!profileValue) return false
  const values = Array.isArray(profileValue) ? profileValue : [profileValue]
  return selected.some((s) => values.includes(s))
}

function matchesFreeText(profile, query) {
  if (!query) return true
  const q = query.trim().toLowerCase()
  if (!q) return true
  return FREE_TEXT_FIELDS.some((field) => {
    const value = profile[field]
    if (!value) return false
    const text = Array.isArray(value) ? value.join(' ') : String(value)
    return text.toLowerCase().includes(q)
  })
}

// filters: { country: [], career_stage: [], es_topics: [], methods: [], ecosystem_focus: [], work_scale: [], sectors: [], open_to: [], availability_status: [] }
export function filterProfiles(profiles, filters, freeText) {
  return profiles.filter((p) => {
    if (!matchesMulti(p.country, filters.country)) return false
    if (!matchesMulti(p.career_stage, filters.career_stage)) return false
    if (!matchesMulti(p.es_topics, filters.es_topics)) return false
    if (!matchesMulti(p.methods, filters.methods)) return false
    if (!matchesMulti(p.ecosystem_focus, filters.ecosystem_focus)) return false
    if (!matchesMulti(p.work_scale, filters.work_scale)) return false
    if (!matchesMulti(p.sectors, filters.sectors)) return false
    if (!matchesMulti(p.open_to, filters.open_to)) return false
    if (!matchesMulti(p.availability_status, filters.availability_status)) return false
    if (!matchesFreeText(p, freeText)) return false
    return true
  })
}

export const emptyFilters = {
  country: [],
  career_stage: [],
  es_topics: [],
  methods: [],
  ecosystem_focus: [],
  work_scale: [],
  sectors: [],
  open_to: [],
  availability_status: [],
}
