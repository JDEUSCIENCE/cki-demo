import { NavLink, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
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
        <Link to="/" className="brand">
          ES Community Knowledge Infrastructure
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
        Demonstration. Profiles are the paper&rsquo;s authors, shown with their consent.
      </div>
    </header>
  )
}
