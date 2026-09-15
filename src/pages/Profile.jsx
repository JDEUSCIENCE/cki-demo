import { useParams, Link } from 'react-router-dom'
import { useProfiles } from '../lib/ProfilesContext.jsx'

function Field({ label, value }) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null
  }
  return (
    <div className="profile-field">
      <dt>{label}</dt>
      <dd>{Array.isArray(value) ? value.join(', ') : value}</dd>
    </div>
  )
}

function LinkField({ label, href, children }) {
  if (!href) return null
  return (
    <div className="profile-field">
      <dt>{label}</dt>
      <dd>
        <a href={href} target="_blank" rel="noreferrer">
          {children || href}
        </a>
      </dd>
    </div>
  )
}

export default function Profile() {
  const { id } = useParams()
  const { allProfiles } = useProfiles()
  const profile = allProfiles.find((p) => p.id === id)

  if (!profile) {
    return (
      <section className="page page-profile">
        <h1>Profile not found</h1>
        <p>
          <Link to="/search">Back to search</Link>
        </p>
      </section>
    )
  }

  const visibility = profile.contact_visibility
  let contactBlock = null
  if (visibility === 'public') {
    contactBlock = <Field label="Preferred contact" value={profile.preferred_contact} />
  } else if (visibility === 'members only') {
    contactBlock = (
      <div className="profile-field">
        <dt>Preferred contact</dt>
        <dd>visible to members</dd>
      </div>
    )
  }
  // 'hidden' shows nothing at all, intentionally no contactBlock

  return (
    <section className="page page-profile">
      {profile._preview && <p className="preview-badge">Preview &mdash; this session only, not saved anywhere.</p>}
      <h1>{profile.name}</h1>

      <dl className="profile-group card">
        <h2>Person</h2>
        <Field label="Career stage" value={profile.career_stage} />
        <Field label="Affiliation type" value={profile.affiliation_type} />
        <Field label="Languages" value={profile.languages} />
      </dl>

      <dl className="profile-group card">
        <h2>Location</h2>
        <Field label="Institution" value={profile.institution} />
        <Field label="City" value={profile.city} />
        <Field label="Country" value={profile.country} />
      </dl>

      <dl className="profile-group card">
        <h2>Links and identifiers</h2>
        <LinkField label="ORCID iD" href={profile.orcid ? `https://orcid.org/${profile.orcid}` : null}>
          {profile.orcid}
        </LinkField>
        <LinkField label="ResearchGate" href={profile.researchgate_url} />
        <Field label="Scopus Author ID" value={profile.scopus_id} />
        <LinkField label="LinkedIn" href={profile.linkedin_url} />
        <LinkField label="Website" href={profile.website_url} />
      </dl>

      <dl className="profile-group card">
        <h2>Expertise</h2>
        <Field label="ES topics / services" value={profile.es_topics} />
        <Field
          label="Methods / approaches"
          value={
            profile.methods_other && profile.methods?.includes('other')
              ? [...profile.methods.filter((m) => m !== 'other'), `other: ${profile.methods_other}`]
              : profile.methods
          }
        />
        <Field label="Ecosystem / realm focus" value={profile.ecosystem_focus} />
        <Field label="Sectors / application domains" value={profile.sectors} />
        <Field label="Keywords" value={profile.keywords} />
      </dl>

      <dl className="profile-group card">
        <h2>Work</h2>
        <Field label="Current projects and ideas" value={profile.current_projects} />
        {profile.study_areas?.length > 0 && (
          <div className="profile-field">
            <dt>Study areas</dt>
            <dd>
              <ul>
                {profile.study_areas.map((sa, i) => (
                  <li key={i}>
                    {sa.region} ({sa.ecosystem_type})
                    {sa.lat == null && ' — no coordinates supplied'}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>

      <dl className="profile-group card">
        <h2>Collaboration</h2>
        <Field label="Open to" value={profile.open_to} />
        <Field label="Availability status" value={profile.availability_status} />
        <Field label="Offering / seeking" value={profile.offering_seeking} />
      </dl>

      <dl className="profile-group card">
        <h2>Contact and visibility</h2>
        {contactBlock}
      </dl>
    </section>
  )
}
