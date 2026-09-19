import { useParams, Link } from 'react-router-dom'
import { useProfiles } from '../lib/ProfilesContext.jsx'
import { esTopicLabel } from '../lib/vocab.js'

function hasValue(value) {
  return !(value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))
}

function Field({ label, value }) {
  if (!hasValue(value)) {
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

  const esTopicsValue = profile.es_topics?.map(esTopicLabel)

  const methodsValue =
    profile.methods_other && profile.methods?.includes('other')
      ? [...profile.methods.filter((m) => m !== 'other'), `other: ${profile.methods_other}`]
      : profile.methods

  const careerStageValue =
    profile.career_stage === 'other (please specify)' && profile.career_stage_other
      ? `other (please specify): ${profile.career_stage_other}`
      : profile.career_stage

  // A group with no filled fields renders no rows -- hide the whole card rather than
  // show a heading over empty space. 'Contact and visibility' counts as having content
  // only when something actually appears under it (public + a contact, or members only).
  const hasPerson = [profile.career_stage, profile.affiliation_type, profile.languages].some(hasValue)
  const hasLocation = [profile.institution, profile.city, profile.country].some(hasValue)
  const hasLinks = [profile.orcid, profile.researchgate_url, profile.scopus_id, profile.linkedin_url, profile.website_url].some(
    hasValue,
  )
  const hasExpertise = [
    esTopicsValue,
    methodsValue,
    profile.ecosystem_focus,
    profile.work_scale,
    profile.sectors,
    profile.keywords,
  ].some(hasValue)
  const hasWork =
    hasValue(profile.current_projects) || hasValue(profile.project_stage) || profile.study_areas?.length > 0
  const hasCollaboration = [profile.open_to, profile.availability_status, profile.offering_seeking].some(hasValue)
  const hasContact = (visibility === 'public' && hasValue(profile.preferred_contact)) || visibility === 'members only'

  return (
    <section className="page page-profile">
      {profile._preview && <p className="preview-badge">Preview &mdash; this session only, not saved anywhere.</p>}
      <h1>{profile.name}</h1>
      {hasValue(profile.updated) && <p className="profile-updated">Last updated: {profile.updated}</p>}

      {hasPerson && (
        <dl className="profile-group card">
          <h2>Person</h2>
          <Field label="Career stage" value={careerStageValue} />
          <Field label="Affiliation type" value={profile.affiliation_type} />
          <Field label="Languages" value={profile.languages} />
        </dl>
      )}

      {hasLocation && (
        <dl className="profile-group card">
          <h2>Location</h2>
          <Field label="Institution" value={profile.institution} />
          <Field label="City" value={profile.city} />
          <Field label="Country where based" value={profile.country} />
        </dl>
      )}

      {hasLinks && (
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
      )}

      {hasExpertise && (
        <dl className="profile-group card">
          <h2>Expertise</h2>
          <Field label="ES topics / services" value={esTopicsValue} />
          <Field label="Methods / approaches" value={methodsValue} />
          <Field label="Ecosystem focus" value={profile.ecosystem_focus} />
          <Field label="Work scale" value={profile.work_scale} />
          <Field label="Sectors / application domains" value={profile.sectors} />
          <Field label="Keywords" value={profile.keywords} />
        </dl>
      )}

      {hasWork && (
        <dl className="profile-group card">
          <h2>Work</h2>
          <Field label="Current projects and ideas" value={profile.current_projects} />
          <Field label="Project stage" value={profile.project_stage} />
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
      )}

      {hasCollaboration && (
        <dl className="profile-group card">
          <h2>Collaboration</h2>
          <Field label="Open to" value={profile.open_to} />
          <Field label="Availability status" value={profile.availability_status} />
          <Field label="Offering / seeking" value={profile.offering_seeking} />
        </dl>
      )}

      {hasContact && (
        <dl className="profile-group card">
          <h2>Contact and visibility</h2>
          {contactBlock}
        </dl>
      )}
    </section>
  )
}
