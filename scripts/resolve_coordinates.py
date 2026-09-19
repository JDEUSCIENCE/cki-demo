#!/usr/bin/env python3
"""Resolve base_location for a profile, deterministically, at build time.

Order (per the build brief):
  1. city + country -> data/gazetteer_cities.json (GeoNames cities15000 cut).
  2. no city -> institution -> ROR coordinates, but ONLY when the profile supplies
     ror_id itself, or the institution string exactly matches an entry in the
     JO-approved data/ror_lookup.json. Never an automatic ROR name match.
  3. both fail -> data/country_centroids.json (a committed table keyed by country).

Step 2 is local/deterministic whenever ror_id is one of the ~330 institutions bundled
in data/ror_institutions.json (the same offline dataset the Create-a-profile page's
institution autocomplete suggests from -- see src/components/InstitutionAutocomplete.jsx).
Only a ror_id outside that bundled subset (typed by hand into an exported profile, since
the form itself never exposes a raw ror_id field) falls back to a live lookup against the
public ROR API (https://api.ror.org) -- still only at build time, never on the live site.

This module exposes resolve_base_location(profile, data_dir) -> dict | None so it
can be imported by scripts/build_profiles_index.py, and can also be run directly
on one profile file for debugging.
"""
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def _gazetteer_lookup(profile, data_dir):
    city = profile.get("city")
    country = profile.get("country")
    if not city or not country:
        return None
    gazetteer = _load_json(data_dir / "gazetteer_cities.json")
    matches = [
        g for g in gazetteer
        if g["city"].strip().lower() == city.strip().lower()
        and g["country"] == country
    ]
    if not matches:
        return None
    best = max(matches, key=lambda g: g.get("population", 0))
    return {"lat": best["lat"], "lon": best["lon"], "source": "gazetteer"}


def _ror_api_lookup(ror_id):
    ror_id = ror_id.rstrip("/")
    org_id = ror_id.rsplit("/", 1)[-1]
    url = f"https://api.ror.org/organizations/{org_id}"
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.load(resp)
    except Exception as e:  # noqa: BLE001 - build-time network call, fail closed
        print(f"WARNING: ROR API lookup failed for {ror_id}: {e}", file=sys.stderr)
        return None
    for addr in data.get("addresses", []):
        lat, lon = addr.get("lat"), addr.get("lng")
        if lat is not None and lon is not None:
            return {"lat": round(lat, 4), "lon": round(lon, 4), "source": "ror"}
    return None


def _bundled_ror_lookup(ror_id, data_dir):
    ror_id = ror_id.rstrip("/")
    bundled = _load_json(data_dir / "ror_institutions.json")
    for entry in bundled:
        if entry["ror_id"].rstrip("/") == ror_id:
            return {"lat": entry["lat"], "lon": entry["lon"], "source": "ror"}
    return None


def _ror_lookup(profile, data_dir):
    ror_id = profile.get("ror_id")
    if ror_id:
        result = _bundled_ror_lookup(ror_id, data_dir) or _ror_api_lookup(ror_id)
        if result:
            return result

    institution = profile.get("institution")
    if not institution:
        return None
    approved = _load_json(data_dir / "ror_lookup.json")  # JO-approved institution -> {lat, lon}
    entry = approved.get(institution)
    if entry:
        return {"lat": entry["lat"], "lon": entry["lon"], "source": "ror"}
    return None


def _country_centroid_lookup(profile, data_dir):
    country = profile.get("country")
    if not country:
        return None
    centroids = _load_json(data_dir / "country_centroids.json")
    entry = centroids.get(country)
    if not entry:
        return None
    return {"lat": entry["lat"], "lon": entry["lon"], "source": "country_centroid"}


def resolve_base_location(profile, data_dir=None):
    data_dir = Path(data_dir) if data_dir else ROOT / "data"
    for fn in (_gazetteer_lookup, _ror_lookup, _country_centroid_lookup):
        result = fn(profile, data_dir)
        if result:
            return result
    return None


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/resolve_coordinates.py profile.json")
        sys.exit(2)
    p = Path(sys.argv[1])
    profile = _load_json(p)
    loc = resolve_base_location(profile)
    if loc is None:
        print(f"FAIL: could not resolve base_location for {p} (no gazetteer, ROR or country-centroid match)")
        sys.exit(1)
    print(json.dumps(loc, indent=2))
