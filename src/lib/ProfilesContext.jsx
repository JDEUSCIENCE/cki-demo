import { createContext, useContext, useMemo, useState } from 'react'
import realProfiles from '../../data/profiles.json'

const ProfilesContext = createContext(null)

let previewCounter = 0

export function ProfilesProvider({ children }) {
  const [previewProfiles, setPreviewProfiles] = useState([])

  const addPreviewProfile = (profile) => {
    previewCounter += 1
    const id = `preview-${previewCounter}`
    setPreviewProfiles((prev) => [...prev, { ...profile, id, _preview: true }])
    return id
  }

  const allProfiles = useMemo(() => {
    const real = realProfiles.map((p, i) => ({ ...p, id: p.id || `real-${i}` }))
    return [...real, ...previewProfiles]
  }, [previewProfiles])

  const value = { allProfiles, addPreviewProfile, hasRealProfiles: realProfiles.length > 0 }

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext)
  if (!ctx) throw new Error('useProfiles must be used within ProfilesProvider')
  return ctx
}
