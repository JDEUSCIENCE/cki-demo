#!/usr/bin/env python3
"""Validate profile JSON files against the CKI profile schemas.

Two layers of checking, on purpose:
  1. JSON Schema (schemas/profile-submission.schema.json or profile-public.schema.json)
     checks structure: required fields, types/formats, unknown keys, contact_visibility == "public".
  2. This script additionally checks every controlled-vocabulary field's values against
     data/vocabularies.json (the single source of truth for those lists, kept in sync with
     Table S1 by scripts/check_vocab.py), and recursively scans every string in the file for
     anything that looks like an email address.

Usage:
  python scripts/validate_profiles.py --schema submission profile1.json [profile2.json ...]
  python scripts/validate_profiles.py --schema public data/profiles.json
Exit code is non-zero if any file fails either layer.
"""
import argparse
import json
import re
import sys
from pathlib import Path

import jsonschema

ROOT = Path(__file__).resolve().parent.parent
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

VOCAB_FIELDS_SINGLE = {
    "career_stage": "career_stage",
    "affiliation_type": "affiliation_type",
    "country": "countries",
    "availability_status": "availability_status",
    "contact_visibility": "contact_visibility",
}
VOCAB_FIELDS_MULTI = {
    "languages": "languages",
    "methods": "methods",
    "ecosystem_focus": "ecosystem_focus",
    "sectors": "sectors",
    "open_to": "open_to",
}


def load_vocab():
    path = ROOT / "data" / "vocabularies.json"
    return json.loads(path.read_text(encoding="utf-8"))


def es_topic_names(vocab):
    return {g["group"] for g in vocab["es_topics"]}


def find_emails(node, path="$"):
    hits = []
    if isinstance(node, str):
        if EMAIL_RE.search(node):
            hits.append(path)
    elif isinstance(node, dict):
        for k, v in node.items():
            hits.extend(find_emails(v, f"{path}.{k}"))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            hits.extend(find_emails(v, f"{path}[{i}]"))
    return hits


def check_vocab_membership(profile, vocab):
    errors = []
    es_names = es_topic_names(vocab)

    for field, vocab_key in VOCAB_FIELDS_SINGLE.items():
        if field in profile and profile[field] not in vocab[vocab_key]:
            errors.append(f"'{field}' value {profile[field]!r} is not in the controlled list '{vocab_key}'")

    for field, vocab_key in VOCAB_FIELDS_MULTI.items():
        if field in profile:
            allowed = set(vocab[vocab_key])
            bad = [v for v in profile[field] if v not in allowed]
            if bad:
                errors.append(f"'{field}' contains values outside the controlled list '{vocab_key}': {bad}")

    if "es_topics" in profile:
        bad = [v for v in profile["es_topics"] if v not in es_names]
        if bad:
            errors.append(f"'es_topics' contains values outside the CICES v5.1 Group list: {bad}")

    if "methods" in profile and "other" not in profile["methods"] and "methods_other" in profile:
        errors.append("'methods_other' is set but 'methods' does not contain \"other\"")

    for i, sa in enumerate(profile.get("study_areas", [])):
        et = sa.get("ecosystem_type")
        if et is not None and et not in vocab["ecosystem_focus"]:
            errors.append(f"study_areas[{i}].ecosystem_type {et!r} is not in the controlled list 'ecosystem_focus'")

    return errors


def validate_file(path, schema, vocab):
    errors = []
    try:
        profile = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"invalid JSON: {e}"]

    validator = jsonschema.Draft202012Validator(schema)
    for err in sorted(validator.iter_errors(profile), key=str):
        errors.append(f"schema: {err.message} (at {list(err.absolute_path)})")

    errors.extend(f"vocabulary: {e}" for e in check_vocab_membership(profile, vocab))

    emails = find_emails(profile)
    if emails:
        errors.append(f"email address found in: {emails}")

    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", choices=["submission", "public"], required=True)
    parser.add_argument("files", nargs="+")
    args = parser.parse_args()

    schema_path = ROOT / "schemas" / f"profile-{args.schema}.schema.json"
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    vocab = load_vocab()

    ok = True
    for f in args.files:
        path = Path(f)
        errors = validate_file(path, schema, vocab)
        if errors:
            ok = False
            print(f"FAIL: {path}")
            for e in errors:
                print(f"  - {e}")
        else:
            print(f"OK: {path}")

    print()
    print("PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
