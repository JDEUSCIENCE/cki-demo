import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <section className="page page-landing">
      <h1>ES Community Knowledge Infrastructure</h1>
      <p className="landing-lead">
        A demonstration of the profile specification &mdash; nothing here is invented, every
        profile is one of the paper&rsquo;s own authors, shown with their consent. Built around
        two components: searchable profiles and a two-layer map.
      </p>
      <div className="landing-actions">
        <Link to="/search" className="btn-primary">
          Search
        </Link>
        <Link to="/map" className="btn-secondary">
          Map
        </Link>
      </div>
    </section>
  )
}
