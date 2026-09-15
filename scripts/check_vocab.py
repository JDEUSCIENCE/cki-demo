#!/usr/bin/env python3
"""Compare data/vocabularies.json against Table S1 (Appendix A of the build brief), word for word.

Usage: python scripts/check_vocab.py [path/to/vocabularies.json]
Exits non-zero and prints the diff if any controlled list does not match exactly (order-independent).
"""
import json
import sys
from pathlib import Path

# Canonical lists, copied word for word from Table S1 / Appendix A.
CANONICAL = {
    "career_stage": [
        "master's student",
        "doctoral candidate",
        "postdoctoral researcher",
        "recent PhD graduate",
        "early-career researcher or professional",
        "mid-career researcher or professional",
        "senior or established researcher or professional",
        "other",
    ],
    "affiliation_type": [
        "university",
        "research institute",
        "NGO",
        "government",
        "private sector",
        "independent",
        "other",
    ],
    "methods": [
        "biophysical assessment",
        "mapping / GIS / remote sensing",
        "economic valuation",
        "participatory / social methods",
        "scenario / modelling",
        "policy analysis",
        "field measurement",
        "other",
    ],
    "ecosystem_focus": [
        "urban",
        "forest",
        "freshwater",
        "marine / coastal",
        "agricultural",
        "grassland",
        "mountain",
        "drylands",
        "wetlands",
        "other",
    ],
    "sectors": [
        "urban planning",
        "agriculture",
        "water",
        "conservation",
        "climate adaptation",
        "disaster risk",
        "other",
    ],
    "open_to": [
        "collaboration",
        "exchanging ideas",
        "peer support",
        "mentoring (offering)",
        "mentoring (seeking)",
        "co-authoring / proposal writing",
        "reviewing",
        "data or method sharing",
        "hosting visits / secondments",
        "teaching / training",
    ],
    "availability_status": ["open to new work", "limited", "not currently"],
    "contact_visibility": ["public", "members only", "hidden"],
}


def main():
    vocab_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "data" / "vocabularies.json"
    if not vocab_path.exists():
        print(f"FAIL: {vocab_path} not found")
        return 1

    vocab = json.loads(vocab_path.read_text(encoding="utf-8"))

    ok = True
    for key, expected in CANONICAL.items():
        actual = vocab.get(key)
        if actual is None:
            print(f"FAIL: '{key}' is missing from {vocab_path}")
            ok = False
            continue
        if list(actual) != expected:
            ok = False
            missing = [v for v in expected if v not in actual]
            extra = [v for v in actual if v not in expected]
            out_of_order = list(actual) != expected and set(actual) == set(expected)
            print(f"FAIL: '{key}' does not match Table S1 word for word.")
            if missing:
                print(f"  missing: {missing}")
            if extra:
                print(f"  unexpected: {extra}")
            if out_of_order and not missing and not extra:
                print(f"  values match but order differs from Table S1")
        else:
            print(f"OK: '{key}' ({len(actual)} values) matches Table S1")

    for key in ("countries", "languages", "es_topics"):
        if key not in vocab or not vocab[key]:
            print(f"FAIL: '{key}' is missing or empty")
            ok = False
        else:
            print(f"OK: '{key}' present ({len(vocab[key])} values)")

    if "es_topics" in vocab:
        for i, g in enumerate(vocab["es_topics"]):
            for field in ("section", "division", "group"):
                if field not in g:
                    print(f"FAIL: es_topics[{i}] missing '{field}'")
                    ok = False

    print()
    print("PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
