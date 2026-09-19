import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Landing from './pages/Landing.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/Profile.jsx'
import MapPage from './pages/MapPage.jsx'
import CreateProfile from './pages/CreateProfile.jsx'
import Privacy from './pages/Privacy.jsx'
import Overview from './pages/Overview.jsx'

export default function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="app">
      <Header />
      <main className={isHome ? 'app-main app-main-home' : 'app-main'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/create" element={<CreateProfile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/overview" element={<Overview />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <a href="https://doi.org/10.5281/zenodo.22848663" target="_blank" rel="noreferrer">
          Profile specification (DOI)
        </a>
        <span className="app-footer-sep">&middot;</span>
        <Link to="/privacy">Privacy notice</Link>
      </footer>
    </div>
  )
}
