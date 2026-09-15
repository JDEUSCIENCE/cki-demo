import { useMemo } from 'react'
import { useProfiles } from '../lib/ProfilesContext.jsx'
import BarList from '../components/BarList.jsx'

function countBy(profiles, field, multi) {
  const counts = {}
  for (const p of profiles) {
    const value = p[field]
    if (!value) continue
    const values = multi ? value : [value]
    for (const v of values) {
      counts[v] = (counts[v] || 0) + 1
    }
  }
  return counts
}

export default function Overview() {
  const { allProfiles } = useProfiles()

  const byEcosystem = useMemo(() => countBy(allProfiles, 'ecosystem_focus', true), [allProfiles])
  const byMethod = useMemo(() => countBy(allProfiles, 'methods', true), [allProfiles])
  const byCountry = useMemo(() => countBy(allProfiles, 'country', false), [allProfiles])
  const byCareerStage = useMemo(() => countBy(allProfiles, 'career_stage', false), [allProfiles])

  return (
    <section className="page page-overview">
      <h1>Overview</h1>
      <p className="result-count">{allProfiles.length} profile(s) in this browser session</p>
      <div className="overview-grid">
        <BarList title="By ecosystem focus" counts={byEcosystem} />
        <BarList title="By method" counts={byMethod} />
        <BarList title="By country" counts={byCountry} />
        <BarList title="By career stage" counts={byCareerStage} />
      </div>
    </section>
  )
}
