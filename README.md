# cki-demo

A static demonstration of the ES Community Knowledge Infrastructure profile
specification (`Profile_Specification`, v1.1), built from the paper *Beyond
the conference room: A Knowledge Infrastructure for Ecosystem Services
Research Community*. It implements searchable member profiles and a map, as
described in that paper's "An early-career space for exchange" section.

This is a demonstration, not a production service: no accounts, no login, no
server, no data stored anywhere except in this repository and (for real
member profiles) the private `cki-demo-profiles` repository.

## Deployment gate

No real profile goes live until the data controller is confirmed, the
privacy notice is final, and written consent is on file for that member.
Until then, `data/profiles.json` is `[]` and the deployed site shows no
profiles.

## How this maps to Table S1

`Profile_Specification` Table S1 (24 fields, grouped as Person / Location /
Links and identifiers / Expertise / Work / Collaboration / Contact and
visibility) is the contract for every field name, status label (Required /
Recommended / Optional) and controlled vocabulary in this app:

- `data/vocabularies.json` holds every controlled list, copied word for word
  from Table S1, plus ISO 3166 countries, ISO 639-1 languages and the CICES
  v5.1 Group-level ES topics list (see below). `scripts/check_vocab.py`
  checks the eight Table-S1-sourced lists against the specification on every
  build.
- `src/pages/CreateProfile.jsx` renders all 24 fields in Table S1 order with
  their status label next to each field name.
- `src/pages/Profile.jsx` displays only populated fields, grouped the same
  way, with the contact-visibility rules from the brief (`public` shows
  preferred contact, `members only` shows "visible to members", `hidden`
  shows nothing).
- `schemas/profile-submission.schema.json` / `schemas/profile-public.schema.json`
  are the two schemas: submission is exactly what a member can export from
  the form (no `consent_date`, no `base_location`); public adds those two
  keys and is what a profile is checked against before it reaches the site.

### ES topics: CICES v5.1

The ES topics controlled list is the 40 Group-level categories of CICES
v5.1, extracted from the official spreadsheet
(`Finalised-V5.1_18032018.xlsx`, cices.eu -> Resources -> Archive ->
"Version 5.1 Spreadsheet"), never typed from memory. Nine group names recur
identically across the Biotic and Abiotic halves of the classification (five
"Other" groups, two "Mediation of nuisances of anthropogenic origin", two
"Regulation of baseline flows and extreme events"); those nine are suffixed
with their Section (e.g. `Other — Cultural (Abiotic)`) so every stored value
is unique. Section and Division are kept on each entry for grouping in the
filter UI. All other group names are verbatim.

### Languages

`languages` uses ISO 639-1 (two-letter) language names — the practical
working-languages list — rather than the full ISO 639 table (which also
carries ISO 639-2/3/5 codes for thousands of historical and minority
languages, via the `pycountry` package used to generate the vocabulary).

## Coordinates

`base_location` is resolved once, at build time, by
`scripts/resolve_coordinates.py`, in this order:

1. city + country against `data/gazetteer_cities.json` (a cut of GeoNames
   `cities15000`, population >= 15,000, © GeoNames, CC BY 4.0 — see
   https://www.geonames.org/).
2. institution against `data/ror_lookup.json` (empty until JO approves
   entries), or the public ROR API when the profile itself supplies a
   `ror_id`. Never an automatic name match.
3. `data/country_centroids.json`, a committed table built from each
   country's capital-city coordinates in the same GeoNames cut (used as a
   practical stand-in for a true polygon centroid, which would need a
   separate boundary dataset out of scope for this demo). It covers 243 of
   249 ISO 3166 countries; the six missing are uninhabited or near-uninhabited
   territories (Antarctica, Bouvet Island, British Indian Ocean Territory,
   Heard Island and McDonald Islands, Tokelau, United States Minor Outlying
   Islands) whose GeoNames capital entry falls below the `cities15000`
   population cutoff.

Study-area coordinates are never inferred: they come only from the member's
own form entry, or are omitted (and the study area is listed on the profile,
not mapped).

## Running it

```bash
npm install
npm run build       # -> dist/
npm run dev          # local dev server
python -m pip install -r requirements.txt
python scripts/check_vocab.py
python scripts/validate_profiles.py --schema submission path/to/export.json
python scripts/build_profiles_index.py path/to/cki-demo-profiles/checkout
```

> On at least one development machine, this project's OneDrive path contains
> an `&`, which breaks npm's generated `.cmd` shims on Windows (`npm run
> build` fails with a `MODULE_NOT_FOUND` error). If that happens, call the
> tool directly instead: `node node_modules/vite/bin/vite.js build`. This
> does not affect GitHub Actions, whose checkout path has no special
> characters.

## Where profiles live

Real member profiles are never in this repository. They live in a separate
private repository, `cki-demo-profiles`, holding one validated, consented
JSON file per member. This repository's `data/profiles.json` is always
either `[]` or the output of the build pipeline below — it is never edited
by hand.

Intake, in order:
1. A member exports a profile from **Create a profile** and sends the JSON
   file to JO.
2. JO validates the untouched export against
   `schemas/profile-submission.schema.json`
   (`scripts/validate_profiles.py --schema submission`). It must have no
   `consent_date` and no `base_location` at this point.
3. If it passes and written consent is on file, JO adds only `consent_date`
   and places the file in `cki-demo-profiles`.
4. The GitHub Action (`.github/workflows/deploy.yml`) checks out
   `cki-demo-profiles` with a read-only fine-grained token stored as the
   `PROFILES_TOKEN` repository secret, resolves `base_location`, validates
   the result against `schemas/profile-public.schema.json`
   (`scripts/build_profiles_index.py`), and writes `data/profiles.json` for
   the build. Any failure stops the deployment.

Profiles are **never archived**: the Zenodo deposit for this project covers
the code repository only.

Withdrawal: the profile is deleted from `cki-demo-profiles` and the site is
redeployed within a week. This never guarantees removal from third-party
copies (search engine caches, etc.) — see the privacy notice.

## Licences

- Code (this repository): MIT — see `LICENSE`.
- Site text and the profile specification: CC BY 4.0 [JO to confirm].
- `data/gazetteer_cities.json` and `data/country_centroids.json`: derived
  from GeoNames (https://www.geonames.org/), CC BY 4.0.
- Profile data: not licensed for reuse. All rights stay with each author,
  shown only with their consent.

## Not in this demonstration

No accounts, login or messaging; no exchange functions; no dashboards,
mentoring or funding modules; no data stored on a server; no YESS or ESP
branding. The interface says "community knowledge infrastructure" or
"directory", never "platform".
