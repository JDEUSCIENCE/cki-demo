#!/usr/bin/env python3
"""Assemble data/profiles.json for the site build from the private profiles repository.

For each *.json file in the source directory (a checkout of cki-demo-profiles):
  1. Require consent_date to be present (JO only adds this after written consent is on file).
  2. Require no base_location yet (it is derived here, never supplied by the member or JO).
  3. Resolve base_location deterministically (scripts/resolve_coordinates.py).
  4. Validate the resulting file against schemas/profile-public.schema.json plus the
     vocabulary/email checks in scripts/validate_profiles.py.

Any failure stops the build (exit non-zero) -- the deployed site must contain only
validated public profiles. On success, writes the combined array to data/profiles.json.

Usage: python scripts/build_profiles_index.py <source_dir> [--out data/profiles.json]
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from resolve_coordinates import resolve_base_location  # noqa: E402
from validate_profiles import validate_file, load_vocab  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir")
    parser.add_argument("--out", default=str(ROOT / "data" / "profiles.json"))
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    files = sorted(source_dir.glob("*.json"))

    if not files:
        Path(args.out).write_text("[]", encoding="utf-8")
        print("No profile files found; wrote an empty data/profiles.json")
        return 0

    schema = json.loads((ROOT / "schemas" / "profile-public.schema.json").read_text(encoding="utf-8"))
    vocab = load_vocab()

    ok = True
    output = []
    for path in files:
        profile = json.loads(path.read_text(encoding="utf-8"))

        if "consent_date" not in profile:
            print(f"FAIL: {path.name} has no consent_date (JO must add it before it reaches this step)")
            ok = False
            continue
        if "base_location" in profile:
            print(f"FAIL: {path.name} already has base_location (it must be derived here, never supplied upstream)")
            ok = False
            continue

        loc = resolve_base_location(profile)
        if loc is None:
            print(f"FAIL: {path.name} -- could not resolve base_location (no gazetteer, ROR or country-centroid match for city={profile.get('city')!r} country={profile.get('country')!r})")
            ok = False
            continue
        profile["base_location"] = loc

        errors = _validate_public(profile, schema, vocab)
        if errors:
            ok = False
            print(f"FAIL: {path.name}")
            for e in errors:
                print(f"  - {e}")
            continue

        print(f"OK: {path.name} -> base_location source={loc['source']}")
        output.append(profile)

    if not ok:
        print()
        print("Build stopped: one or more profiles failed validation. No file written.")
        return 1

    Path(args.out).write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print()
    print(f"Wrote {len(output)} profile(s) to {args.out}")
    return 0


def _validate_public(profile, schema, vocab):
    import jsonschema
    from validate_profiles import check_vocab_membership, find_emails

    errors = []
    validator = jsonschema.Draft202012Validator(schema)
    for err in sorted(validator.iter_errors(profile), key=str):
        errors.append(f"schema: {err.message} (at {list(err.absolute_path)})")
    errors.extend(f"vocabulary: {e}" for e in check_vocab_membership(profile, vocab))
    emails = find_emails(profile)
    if emails:
        errors.append(f"email address found in: {emails}")
    return errors


if __name__ == "__main__":
    sys.exit(main())
