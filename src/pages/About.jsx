import { useProfiles } from '../lib/ProfilesContext.jsx'

export default function About() {
  const { hasRealProfiles } = useProfiles()

  return (
    <section className="page page-about">
      <h1>About this demonstration</h1>
      <p>
        This is a demonstration of a community knowledge infrastructure for ecosystem services
        (ES) research: searchable member profiles and a map, so that early-career expertise stays
        findable between conferences. It implements the profile specification proposed in the
        accompanying Perspective article.
      </p>
      <p>
        Read the paper [link placeholder until published] and the profile specification (
        <a href="https://doi.org/10.5281/zenodo.21357644" target="_blank" rel="noreferrer">
          DOI 10.5281/zenodo.21357644, placeholder until confirmed
        </a>
        ).
      </p>
      <p className="demo-note">
        Demonstration. Profiles are the paper&rsquo;s authors, shown with their consent.
      </p>
      {!hasRealProfiles && (
        <p className="note-card empty-state">
          The profiles file is currently empty. No member profiles have been published on this
          demonstration site yet.
        </p>
      )}
    </section>
  )
}
