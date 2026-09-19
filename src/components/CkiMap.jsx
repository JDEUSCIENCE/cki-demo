import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { useProfiles } from '../lib/ProfilesContext.jsx'
import { vocab } from '../lib/vocab.js'
import 'leaflet/dist/leaflet.css'

const BASE_COLOR = '#0072B2'
const STUDY_COLOR = '#E69F00'

// The one map component for the whole site (Map view and the Home page
// preview both render this, nothing else). Always a live, fully interactive
// Leaflet map -- drag, scroll/button zoom, marker click -> popup with a
// profile link. showControls toggles only the layer/filter panel above it;
// the map itself, its markers and its popups are identical either way.
export default function CkiMap({ showControls = true, compact = false }) {
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
    <>
      {showControls && (
        <div className="card">
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
                  {regionOptions.length === 0 && (
                    <span className="empty-state">No study areas with coordinates yet.</span>
                  )}
                </div>
              </fieldset>
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={[20, 10]}
        zoom={2}
        className={compact ? 'leaflet-map leaflet-map-compact' : 'leaflet-map'}
        scrollWheelZoom={true}
      >
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

        <div className="map-legend">
          <div className="map-legend-item">
            <span className="map-legend-dot" style={{ backgroundColor: BASE_COLOR }} />
            Where members are based
          </div>
          <div className="map-legend-item">
            <span className="map-legend-dot" style={{ backgroundColor: STUDY_COLOR }} />
            Study areas
          </div>
        </div>
      </MapContainer>
    </>
  )
}
