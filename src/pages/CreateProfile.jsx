import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfiles } from '../lib/ProfilesContext.jsx'
import { vocab, esTopicGroups } from '../lib/vocab.js'
import { buildSubmissionObject, validateForExport } from '../lib/exportValidation.js'

const initialForm = {
  name: '',
  career_stage: '',
  affiliation_type: '',
  languages: [],
  institution: '',
  ror_id: '',
  city: '',
  country: '',
  orcid: '',
  researchgate_url: '',
  scopus_id: '',
  linkedin_url: '',
  website_url: '',
  es_topics: [],
  methods: [],
  methods_other: '',
  ecosystem_focus: [],
  sectors: [],
  keywords: [],
  current_projects: '',
  study_areas: [],
  open_to: [],
  availability_status: '',
  offering_seeking: '',
  preferred_contact: '',
  contact_visibility: 'public',
}

function StatusLabel({ status }) {
  return <span className={`status-label status-${status.replace(/\s/g, '-').toLowerCase()}`}>{status}</span>
}

function TextField({ label, status, value, onChange, placeholder, help }) {
  return (
    <label className="form-field">
      <span className="form-field-label">
        {label} <StatusLabel status={status} />
      </span>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {help && <span className="form-field-help">{help}</span>}
    </label>
  )
}

function TextAreaField({ label, status, value, onChange, help }) {
  return (
    <label className="form-field">
      <span className="form-field-label">
        {label} <StatusLabel status={status} />
      </span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      {help && <span className="form-field-help">{help}</span>}
    </label>
  )
}

function SelectField({ label, status, value, onChange, options }) {
  return (
    <label className="form-field">
      <span className="form-field-label">
        {label} <StatusLabel status={status} />
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function MultiCheckField({ label, status, value, onChange, options, help }) {
  const toggle = (opt) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }
  return (
    <fieldset className="form-field">
      <legend className="form-field-label">
        {label} <StatusLabel status={status} />
      </legend>
      <div className="filter-options">
        {options.map((opt) => (
          <label key={opt} className="filter-option">
            <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
      {help && <span className="form-field-help">{help}</span>}
    </fieldset>
  )
}

export default function CreateProfile() {
  const [form, setForm] = useState(initialForm)
  const [previewId, setPreviewId] = useState(null)
  const [exportErrors, setExportErrors] = useState([])
  const { addPreviewProfile } = useProfiles()
  const navigate = useNavigate()

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const setStudyArea = (index, patch) => {
    setForm((f) => {
      const study_areas = f.study_areas.map((sa, i) => (i === index ? { ...sa, ...patch } : sa))
      return { ...f, study_areas }
    })
  }
  const addStudyArea = () =>
    setForm((f) => ({ ...f, study_areas: [...f.study_areas, { region: '', ecosystem_type: '', lat: '', lon: '' }] }))
  const removeStudyArea = (index) =>
    setForm((f) => ({ ...f, study_areas: f.study_areas.filter((_, i) => i !== index) }))

  const keywordsText = form.keywords.join(', ')
  const setKeywordsText = (text) =>
    setForm((f) => ({
      ...f,
      keywords: text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6),
    }))

  const esTopicNames = esTopicGroups.map((g) => g.group)

  const handlePreview = () => {
    const submission = buildSubmissionObject(form)
    const id = addPreviewProfile(submission)
    setPreviewId(id)
    navigate(`/profile/${id}`)
  }

  const handleExport = () => {
    const submission = buildSubmissionObject(form)
    const { valid, errors } = validateForExport(submission)
    if (!valid) {
      setExportErrors(errors)
      return
    }
    setExportErrors([])
    const blob = new Blob([JSON.stringify(submission, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safeName = (form.name || 'profile').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    a.href = url
    a.download = `${safeName}-cki-profile.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="page page-create">
      <h1>Create a profile</h1>
      <p className="form-intro">
        Nothing here is sent anywhere by the site. Use <strong>Preview</strong> to see the profile as it would
        appear, added to search and map for this browser session only &mdash; refreshing the page removes it. Use{' '}
        <strong>Export profile</strong> to download a validated JSON file to send to JO.
      </p>

      <h2>Person</h2>
      <TextField label="Name" status="Required" value={form.name} onChange={set('name')} />
      <SelectField
        label="Career stage"
        status="Required"
        value={form.career_stage}
        onChange={set('career_stage')}
        options={vocab.career_stage}
      />
      <SelectField
        label="Affiliation type"
        status="Optional"
        value={form.affiliation_type}
        onChange={set('affiliation_type')}
        options={vocab.affiliation_type}
      />
      <MultiCheckField
        label="Languages"
        status="Optional"
        value={form.languages}
        onChange={set('languages')}
        options={vocab.languages}
      />

      <h2>Location</h2>
      <TextField label="Institution" status="Recommended" value={form.institution} onChange={set('institution')} help="ROR identifier where available" />
      <TextField
        label="ROR identifier"
        status="Optional"
        value={form.ror_id}
        onChange={set('ror_id')}
        placeholder="https://ror.org/0abcdefg1"
        help="Part of the Institution field, used to resolve the map location."
      />
      <TextField label="City" status="Optional" value={form.city} onChange={set('city')} help="Base location for the map" />
      <SelectField label="Country" status="Required" value={form.country} onChange={set('country')} options={vocab.countries} />

      <h2>Links and identifiers</h2>
      <p className="form-field-help">All optional; ORCID recommended.</p>
      <TextField label="ORCID iD" status="Recommended" value={form.orcid} onChange={set('orcid')} placeholder="0000-0000-0000-0000" />
      <TextField label="ResearchGate" status="Optional" value={form.researchgate_url} onChange={set('researchgate_url')} placeholder="https://www.researchgate.net/profile/..." />
      <TextField label="Scopus Author ID" status="Optional" value={form.scopus_id} onChange={set('scopus_id')} />
      <TextField label="LinkedIn" status="Optional" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://www.linkedin.com/in/..." />
      <TextField label="Website" status="Optional" value={form.website_url} onChange={set('website_url')} placeholder="https://..." />

      <h2>Expertise</h2>
      <MultiCheckField
        label="ES topics / services"
        status="Required"
        value={form.es_topics}
        onChange={set('es_topics')}
        options={esTopicNames}
        help="CICES v5.1, Group level"
      />
      <MultiCheckField
        label="Methods / approaches"
        status="Recommended"
        value={form.methods}
        onChange={set('methods')}
        options={vocab.methods}
      />
      {form.methods.includes('other') && (
        <TextField label="Methods — other, free text" status="Optional" value={form.methods_other} onChange={set('methods_other')} />
      )}
      <MultiCheckField
        label="Ecosystem / realm focus"
        status="Recommended"
        value={form.ecosystem_focus}
        onChange={set('ecosystem_focus')}
        options={vocab.ecosystem_focus}
      />
      <MultiCheckField
        label="Sectors / application domains"
        status="Optional"
        value={form.sectors}
        onChange={set('sectors')}
        options={vocab.sectors}
      />
      <TextField
        label="Keywords"
        status="Recommended"
        value={keywordsText}
        onChange={setKeywordsText}
        help="Up to ~6, comma-separated"
      />

      <h2>Work</h2>
      <TextAreaField label="Current projects and ideas" status="Optional" value={form.current_projects} onChange={set('current_projects')} />
      <fieldset className="form-field">
        <legend className="form-field-label">
          Study areas <StatusLabel status="Optional" />
        </legend>
        {form.study_areas.map((sa, i) => (
          <div className="study-area-row" key={i}>
            <input
              type="text"
              placeholder="Region"
              value={sa.region}
              onChange={(e) => setStudyArea(i, { region: e.target.value })}
            />
            <select value={sa.ecosystem_type} onChange={(e) => setStudyArea(i, { ecosystem_type: e.target.value })}>
              <option value="">Ecosystem type...</option>
              {vocab.ecosystem_focus.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="any"
              placeholder="lat (optional)"
              value={sa.lat}
              onChange={(e) => setStudyArea(i, { lat: e.target.value })}
            />
            <input
              type="number"
              step="any"
              placeholder="lon (optional)"
              value={sa.lon}
              onChange={(e) => setStudyArea(i, { lon: e.target.value })}
            />
            <button type="button" onClick={() => removeStudyArea(i)} className="btn-remove">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addStudyArea} className="btn-add">
          Add a study area
        </button>
        <span className="form-field-help">
          Coordinates optional. A study area without coordinates is listed on the profile and not mapped.
        </span>
      </fieldset>

      <h2>Collaboration</h2>
      <MultiCheckField label="Open to" status="Optional" value={form.open_to} onChange={set('open_to')} options={vocab.open_to} />
      <SelectField
        label="Availability status"
        status="Optional"
        value={form.availability_status}
        onChange={set('availability_status')}
        options={vocab.availability_status}
      />
      <TextAreaField label="Offering / seeking" status="Optional" value={form.offering_seeking} onChange={set('offering_seeking')} />

      <h2>Contact and visibility</h2>
      <TextField
        label="Preferred contact"
        status="Optional"
        value={form.preferred_contact}
        onChange={set('preferred_contact')}
        help="ORCID or institutional page, never an email address."
      />
      <fieldset className="form-field">
        <legend className="form-field-label">
          Contact visibility <StatusLabel status="Optional" />
        </legend>
        <div className="filter-options">
          {vocab.contact_visibility.map((opt) => (
            <label key={opt} className="filter-option">
              <input
                type="radio"
                name="contact_visibility"
                checked={form.contact_visibility === opt}
                disabled={opt !== 'public'}
                onChange={() => set('contact_visibility')(opt)}
              />
              {opt}
              {opt !== 'public' && <span className="form-field-help"> — not available in this public demonstration</span>}
            </label>
          ))}
        </div>
        <span className="form-field-help">Only &quot;public&quot; can be exported from this demonstration.</span>
      </fieldset>

      {exportErrors.length > 0 && (
        <div className="export-errors">
          <strong>Cannot export:</strong>
          <ul>
            {exportErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={handlePreview} className="btn-primary">
          Preview
        </button>
        <button type="button" onClick={handleExport} className="btn-secondary">
          Export profile
        </button>
      </div>
      {previewId && (
        <p className="form-field-help">
          Preview added for this session. It disappears on refresh and is never sent anywhere.
        </p>
      )}
    </section>
  )
}
