import vocabularies from '../../data/vocabularies.json'

export const vocab = vocabularies

export const esTopicGroups = vocabularies.es_topics // [{section, division, group}]

export function esTopicSections() {
  const sections = new Map()
  for (const g of esTopicGroups) {
    if (!sections.has(g.section)) sections.set(g.section, new Map())
    const divisions = sections.get(g.section)
    if (!divisions.has(g.division)) divisions.set(g.division, [])
    divisions.get(g.division).push(g.group)
  }
  return sections
}
