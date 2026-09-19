const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

function findEmails(node, path = '$') {
  const hits = []
  if (typeof node === 'string') {
    if (EMAIL_RE.test(node)) hits.push(path)
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => hits.push(...findEmails(v, `${path}[${i}]`)))
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) hits.push(...findEmails(v, `${path}.${k}`))
  }
  return hits
}

// Drops empty strings/arrays so the exported JSON matches "empty optional fields are omitted".
export function buildSubmissionObject(form) {
  const out = {}
  for (const [key, value] of Object.entries(form)) {
    if (value === '' || value === null || value === undefined) continue
    if (Array.isArray(value)) {
      if (key === 'study_areas') {
        const cleaned = value
          .filter((sa) => sa.region || sa.ecosystem_type)
          .map((sa) => {
            const entry = { region: sa.region, ecosystem_type: sa.ecosystem_type }
            if (sa.lat !== '' && sa.lat !== null && sa.lat !== undefined && sa.lon !== '' && sa.lon !== null && sa.lon !== undefined) {
              entry.lat = Number(sa.lat)
              entry.lon = Number(sa.lon)
            }
            return entry
          })
        if (cleaned.length > 0) out[key] = cleaned
        continue
      }
      if (value.length > 0) out[key] = value
      continue
    }
    out[key] = value
  }
  return out
}

export function validateForExport(profile) {
  const errors = []
  if (!profile.name) errors.push('Name is required.')
  if (!profile.career_stage) errors.push('Career stage is required.')
  if (!profile.country) errors.push('Country where based is required.')
  if (!profile.es_topics || profile.es_topics.length === 0) errors.push('At least one "ES topics / services" entry is required.')
  // A recognised institution (picked from the autocomplete list, so ror_id is set and has
  // coordinates) is enough on its own. Without one -- no institution, or a free-text
  // institution that was never picked from the list -- a city is required so the profile
  // can still be placed on the map. Country alone is too coarse (only a country centroid).
  if (!profile.ror_id && !profile.city) {
    errors.push('Add a city so you can be shown on the map.')
  }
  if (profile.contact_visibility !== 'public') {
    errors.push('Only "public" contact visibility can be submitted in this demonstration.')
  }
  const emails = findEmails(profile)
  if (emails.length > 0) {
    errors.push(`No email addresses are allowed anywhere in the profile (found in: ${emails.join(', ')}).`)
  }
  return { valid: errors.length === 0, errors }
}
