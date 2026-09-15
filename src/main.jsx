import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProfilesProvider } from './lib/ProfilesContext.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ProfilesProvider>
        <App />
      </ProfilesProvider>
    </HashRouter>
  </React.StrictMode>,
)
