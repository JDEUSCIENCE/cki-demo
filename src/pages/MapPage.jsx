import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { useProfiles } from '../lib/ProfilesContext.jsx'
import { vocab } from '../lib/vocab.js'
import 'leaflet/dist/leaflet.css'

const BASE_COLOR = '#0072B2'
const STUDY_COLOR = '#E69F00'

export default function MapPage() {
  const { allProfiles } = useProfiles()
  const [showBase, setShowBase] = useState(true)
  const [showStudyAreas, setShowStudyAreas] = useState(true)
  const [ecosystemFilter, setEcosystemFilter] = useState([])
  const [regionFilter, setRegionFilter] = useState([])

  const baseMarkers = useMemo(
    () => allProfiles.filter((p) => p.base_location && p.base_location.lat != null),
    [allProfiles],
  )

  const studyAreaMarkers = useMemo(() => {
    const rows = []
    for (const p of allProfiles) {
      for (const sa of p.study_areas || []) {
        if (sa.lat == null || sa.lon == null) continue
        rows.push({ profile: p, studyArea: sa })
      }
    }
    return rows
  }, [allProfiles])

  const regionOptions = useMemo(
    () => Array.from(new Set(studyAreaMarkers.map((r) => r.studyArea.region))).sort(),
    [studyAreaMarkers],
  )

  const filteredStudyAreas = studyAreaMarkers.filter((r) => {
    if (ecosystemFilter.length > 0 && !ecosystemFilter.includes(r.studyArea.ecosystem_type)) return false
    if (regionFilter.length > 0 && !regionFilter.includes(r.studyArea.region)) return false
    return true
  })

  const toggle = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  return (
    <section className="page page-map">
      <h1>Map</h1>
      <div className="map-controls">
        <label>
          <input type="checkbox" checked={showBase} onChange={() => setShowBase((v) => !v)} />
          Layer 1: where members are based
        </label>
        <label>
          <input type="checkbox" checked={showStudyAreas} onChange={() => setShowStudyAreas((v) => !v)} />
          Layer 2: study areas
        </label>
      </div>
      {showStudyAreas && (
        <div className="map-layer2-filters">
          <fieldset className="filter-group">
            <legend>Ecosystem type</legend>
            <div className="filter-options">
              {vocab.ecosystem_focus.map((opt) => (
                <label key={opt} className="filter-option">
                  <input
                    type="checkbox"
                    checked={ecosystemFilter.includes(opt)}
                    onChange={() => toggle(ecosystemFilter, setEcosystemFilter, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="filter-group">
            <legend>Region</legend>
            <div className="filter-options">
              {regionOptions.map((opt) => (
                <label key={opt} className="filter-option">
                  <input
                    type="checkbox"
                    checked={regionFilter.includes(opt)}
                    onChange={() => toggle(regionFilter, setRegionFilter, opt)}
                  />
                  {opt}
                </label>
              ))}
              {regionOptions.length === 0 && <span className="empty-state">No study areas with coordinates yet.</span>}
            </div>
          </fieldset>
        </div>
      )}

      <MapContainer center={[20, 10]} zoom={2} className="leaflet-map" scrollWheelZoom={true}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {showBase &&
          baseMarkers.map((p) => (
            <CircleMarker
              key={`base-${p.id}`}
              center={[p.base_location.lat, p.base_location.lon]}
              radius={7}
              pathOptions={{ color: BASE_COLOR, fillColor: BASE_COLOR, fillOpacity: 0.85 }}
            >
              <Popup>
                <strong>{p.name}</strong>
                <br />
                {p.institution || p.city || p.country}
                <br />
                <Link to={`/profile/${p.id}`}>View profile</Link>
              </Popup>
            </CircleMarker>
          ))}
        {showStudyAreas &&
          filteredStudyAreas.map(({ profile, studyArea }, i) => (
            <CircleMarker
              key={`study-${profile.id}-${i}`}
              center={[studyArea.lat, studyArea.lon]}
              radius={6}
              pathOptions={{ color: STUDY_COLOR, fillColor: STUDY_COLOR, fillOpacity: 0.85 }}
            >
              <Popup>
                <strong>{profile.name}</strong>
                <br />
                {studyArea.region} &middot; {studyArea.ecosystem_type}
                <br />
                <Link to={`/profile/${profile.id}`}>View profile</Link>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </section>
  )
}
