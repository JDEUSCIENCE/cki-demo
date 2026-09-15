#!/usr/bin/env python3
"""Validate every profile in an already-assembled data/profiles.json array
against schemas/profile-public.schema.json (used as a CI double-check after
scripts/build_profiles_index.py, which validates the same way per-file
before aggregating).

Usage: python scripts/validate_public_file.py [data/profiles.json]
"""
import json
import subprocess
import sys
import tempfile
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "profiles.json"
    profiles = json.loads(path.read_text(encoding="utf-8"))

    if not profiles:
        print("No profiles to validate.")
        return 0

    ok = True
    for p in profiles:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(p, f)
            tmp_path = f.name
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "validate_profiles.py"), "--schema", "public", tmp_path]
        )
        os.unlink(tmp_path)
        if result.returncode != 0:
            ok = False

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
