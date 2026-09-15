import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'About', end: true },
  { to: '/search', label: 'Search' },
  { to: '/map', label: 'Map' },
  { to: '/overview', label: 'Overview' },
  { to: '/create', label: 'Create a profile' },
  { to: '/privacy', label: 'Privacy notice' },
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-top">
        <span className="brand">ES Community Knowledge Infrastructure</span>
        <nav className="site-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="demo-banner">
        Demonstration. Profiles are the paper&rsquo;s authors, shown with their consent.
      </div>
    </header>
  )
}
