import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProfilesProvider } from './lib/ProfilesContext.jsx'
import { ThemeProvider } from './lib/ThemeContext.jsx'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <ProfilesProvider>
          <App />
        </ProfilesProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
