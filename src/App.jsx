import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import About from './pages/About.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/Profile.jsx'
import MapPage from './pages/MapPage.jsx'
import CreateProfile from './pages/CreateProfile.jsx'
import Privacy from './pages/Privacy.jsx'
import Overview from './pages/Overview.jsx'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/create" element={<CreateProfile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/overview" element={<Overview />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <a href="https://doi.org/10.5281/zenodo.21357644" target="_blank" rel="noreferrer">
          Profile specification (DOI, placeholder pending confirmation)
        </a>
      </footer>
    </div>
  )
}
