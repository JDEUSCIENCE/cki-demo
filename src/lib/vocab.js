import vocabularies from '../../data/vocabularies.json'

export const vocab = vocabularies

// CICES v5.1 classes (curated 63-class subset), each {code, class, section, label}.
// The stored/exported value for a selection is `${code} ${class}` (see esTopicValue) --
// the official CICES code and class name, never the plain-language label.
export const esTopicClasses = vocabularies.es_topics

export const ES_TOPIC_SECTION_ORDER = ['Provisioning', 'Regulation and maintenance', 'Cultural']

export function esTopicValue(entry) {
  return `${entry.code} ${entry.class}`
}

export function esTopicsBySection() {
  const sections = new Map()
  for (const entry of esTopicClasses) {
    if (!sections.has(entry.section)) sections.set(entry.section, [])
    sections.get(entry.section).push(entry)
  }
  return sections
}

// Maps a stored `${code} ${class}` value back to its plain-language label, for display.
export function esTopicLabel(value) {
  const entry = esTopicClasses.find((e) => esTopicValue(e) === value)
  return entry ? entry.label : value
}
