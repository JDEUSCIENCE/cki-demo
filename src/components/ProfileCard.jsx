import { Link } from 'react-router-dom'

export default function ProfileCard({ profile }) {
  return (
    <div className="profile-card">
      <Link to={`/profile/${profile.id}`} className="profile-card-name-link">
        <h3>{profile.name}</h3>
      </Link>
      <p className="profile-card-meta">
        {[profile.career_stage, profile.institution, profile.country].filter(Boolean).join(' · ')}
      </p>
      {profile.ecosystem_focus?.length > 0 && (
        <p className="profile-card-tags">{profile.ecosystem_focus.join(', ')}</p>
      )}
      {profile.open_to?.length > 0 && (
        <p className="profile-card-open-to">Open to: {profile.open_to.join(', ')}</p>
      )}
      {profile._preview && <span className="preview-badge">Preview (this session only)</span>}
    </div>
  )
}
