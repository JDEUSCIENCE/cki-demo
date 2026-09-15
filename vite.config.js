import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is the repository name so direct links work on GitHub Pages
// (https://<user>.github.io/cki-demo/#/profile/...). Routing is hash-based,
// so this base only affects asset URLs, not in-app navigation.
export default defineConfig({
  plugins: [react()],
  base: '/cki-demo/',
})
