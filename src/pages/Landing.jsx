import { Link } from 'react-router-dom'
import CkiMap from '../components/CkiMap.jsx'

export default function Landing() {
  return (
    <section className="page page-landing">
      <div className="landing-hero-grid">
        <div className="landing-hero-text">
          <h1>Find ecosystem services researchers, and be found</h1>
          <p className="landing-lead">
            A shared place where early-career ecosystem services researchers show what they work
            on, where, with which methods, and whether they are open to collaborate. Built so
            people and expertise stay findable across the globe.
          </p>
          <div className="landing-actions">
            <Link to="/create" className="btn-primary">
              Create your profile
            </Link>
            <Link to="/search" className="btn-secondary">
              Browse the community
            </Link>
          </div>
        </div>
        <div className="landing-map-col">
          <CkiMap showControls={false} compact />
          <Link to="/map" className="landing-tertiary-link">
            Open full map
          </Link>
        </div>
      </div>

      <div className="landing-about">
        <h2>About this demonstration</h2>
        <p>
          This is a demonstration of a community knowledge infrastructure for ecosystem services
          research: searchable member profiles and a map, so that early-career expertise stays
          findable between conferences.
        </p>
        <p>
          Read the paper DOI (available on publication) and the profile specification (
          <a href="https://doi.org/10.5281/zenodo.21357644" target="_blank" rel="noreferrer">
            DOI 10.5281/zenodo.21357644, placeholder until confirmed
          </a>
          ).
        </p>
      </div>
    </section>
  )
}
