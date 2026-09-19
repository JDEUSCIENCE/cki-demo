import { NavLink, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Search' },
  { to: '/map', label: 'Map view' },
  { to: '/overview', label: 'Members overview' },
  { to: '/create', label: 'Create a profile' },
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-top">
        <Link to="/" className="brand">
          Ecosystem Services Community Knowledge Infrastructure
        </Link>
        <nav className="site-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
      <div className="demo-banner">
        Demonstration. A demonstration of the profile specification.
      </div>
    </header>
  )
}
