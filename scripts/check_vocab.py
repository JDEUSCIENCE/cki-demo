#!/usr/bin/env python3
"""Compare data/vocabularies.json against Table S1 (Appendix A of the build brief), word for word,
except career_stage, sectors and open_to, which JO deliberately revised away from Table S1 (see
CAREER_STAGE_CANONICAL, SECTORS_CANONICAL and OPEN_TO_CANONICAL) and are each checked separately
against their revision instead. ecosystem_focus, es_topics, work_scale and project_stage are
current Table S1 controlled lists, each checked against its own canonical list in this script
(ECOSYSTEM_FOCUS_CANONICAL, ES_TOPICS_CANONICAL, WORK_SCALE_CANONICAL, PROJECT_STAGE_CANONICAL).

Usage: python scripts/check_vocab.py [path/to/vocabularies.json]
Exits non-zero and prints the diff if any controlled list does not match exactly (order-independent).
"""
import json
import sys
from pathlib import Path

# Revised by JO on 2026-09: dropped "mid-career researcher or professional", added
# "practitioner or professional (non-academic)", and "other" became "other (please
# specify)" with a free-text career_stage_other field. No longer Table S1 verbatim.
CAREER_STAGE_CANONICAL = [
    "master's student",
    "doctoral candidate",
    "postdoctoral researcher",
    "recent PhD graduate",
    "early-career researcher or professional",
    "senior or established researcher or professional",
    "practitioner or professional (non-academic)",
    "other (please specify)",
]

# The current controlled list for ecosystem_focus: a 16-value biome list. Single source
# for the Create-a-profile field, the Search filter and the Map study-area ecosystem-type
# filter.
ECOSYSTEM_FOCUS_CANONICAL = [
    "Urban and built-up",
    "Agricultural and croplands",
    "Forests (tropical and subtropical)",
    "Forests (temperate and boreal)",
    "Grasslands and savannas",
    "Shrublands and heathlands",
    "Deserts and semi-deserts",
    "Polar and alpine",
    "Rivers and streams",
    "Lakes and reservoirs",
    "Wetlands (marshes and swamps)",
    "Coastal and shorelines",
    "Estuaries and mangroves",
    "Marine shelf and reefs",
    "Open ocean and deep sea",
    "other",
]

# The current controlled list for work_scale, an optional Expertise field -- the spatial
# scale a member works at.
WORK_SCALE_CANONICAL = [
    "local or neighbourhood",
    "city or municipal",
    "regional",
    "national",
    "continental",
    "global",
]

# The current controlled list for project_stage, an optional single-select Work field --
# the stage of a member's current work, so others know if a project is open to join.
PROJECT_STAGE_CANONICAL = [
    "idea or early planning",
    "ongoing",
    "seeking collaborators",
    "completed",
]

# Revised by JO on 2026-09: "hosting visits / secondments" became "hosting visits" (the word
# "secondments" dropped); nothing else in the list changed. No longer Table S1 verbatim.
OPEN_TO_CANONICAL = [
    "collaboration",
    "exchanging ideas",
    "peer support",
    "mentoring (offering)",
    "mentoring (seeking)",
    "co-authoring / proposal writing",
    "reviewing",
    "data or method sharing",
    "hosting visits",
    "teaching / training",
]

# Revised by JO on 2026-09: a thematic_focus field (cross-cutting research themes) was
# added alongside work_scale and then merged into sectors instead of kept separate. sectors
# is now the original seven Table S1 sectors plus thematic_focus's ten themes, with
# overlapping wordings collapsed ("climate adaptation"/"climate change adaptation" ->
# "climate change adaptation"; "disaster risk"/"disaster risk reduction" -> "disaster risk
# reduction"). No longer Table S1 verbatim; thematic_focus no longer exists as a field.
SECTORS_CANONICAL = [
    "urban planning",
    "agriculture",
    "water management",
    "conservation",
    "climate change adaptation",
    "climate change mitigation",
    "disaster risk reduction",
    "biodiversity",
    "nature-based solutions",
    "land-use and land-cover change",
    "green and blue infrastructure",
    "restoration",
    "sustainability and wellbeing",
    "other",
]

# The current controlled list for es_topics: a 63-class subset of the 90 CICES v5.1 classes
# (Class level, one below Group), extracted from the official spreadsheet
# (Finalised-V5.1_18032018.xlsx, cices.eu). Keeps every Provisioning/Regulation &
# Maintenance/Cultural class from the Biotic half, plus only the four water-supply classes
# from Provisioning (Abiotic); drops all other abiotic classes. `label` is a JO-authorised
# plain-language phrase for display only -- the stored/exported value is "<code> <class>"
# (see esTopicValue in src/lib/vocab.js), never the label.
ES_TOPICS_CANONICAL = [
    {"code": "1.1.1.1", "class": "Cultivated terrestrial plants (including fungi, algae) grown for nutritional purposes", "section": "Provisioning", "label": "Food crops"},
    {"code": "1.1.1.2", "class": "Fibres and other materials from cultivated plants, fungi, algae and bacteria for direct use or processing  (excluding genetic materials)", "section": "Provisioning", "label": "Crop-based fibres and raw materials"},
    {"code": "1.1.1.3", "class": "Cultivated plants (including fungi, algae) grown as a source of  energy", "section": "Provisioning", "label": "Bioenergy crops"},
    {"code": "1.1.2.1", "class": "Plants cultivated by in- situ aquaculture  grown for nutritional purposes", "section": "Provisioning", "label": "Farmed aquatic plants for food"},
    {"code": "1.1.2.2", "class": "Fibres and other materials from in-situ aquaculture for direct use or processing  (excluding genetic materials)", "section": "Provisioning", "label": "Farmed aquatic plants for materials"},
    {"code": "1.1.2.3", "class": "Plants cultivated by in- situ aquaculture grown as an energy source", "section": "Provisioning", "label": "Farmed aquatic plants for energy"},
    {"code": "1.1.3.1", "class": "Animals reared  for nutritional purposes", "section": "Provisioning", "label": "Livestock for food"},
    {"code": "1.1.3.2", "class": "Fibres and other materials from reared animals for direct use or processing (excluding genetic materials)", "section": "Provisioning", "label": "Livestock-based materials (wool, hides, etc.)"},
    {"code": "1.1.3.3", "class": "Animals reared to provide energy (including mechanical)", "section": "Provisioning", "label": "Livestock for energy or draught power"},
    {"code": "1.1.4.1", "class": "Animals reared by in-situ aquaculture for nutritional purposes", "section": "Provisioning", "label": "Farmed fish and shellfish for food"},
    {"code": "1.1.4.2", "class": "Fibres and other materials from animals grown by in-situ aquaculture for direct use or processing  (excluding genetic materials)", "section": "Provisioning", "label": "Farmed fish and shellfish for materials"},
    {"code": "1.1.4.3", "class": "Animals reared by in-situ aquaculture as an energy source", "section": "Provisioning", "label": "Farmed aquatic animals for energy"},
    {"code": "1.1.5.1", "class": "Wild plants (terrestrial and aquatic, including fungi, algae) used for nutrition", "section": "Provisioning", "label": "Wild food plants (foraging)"},
    {"code": "1.1.5.2", "class": "Fibres and other materials from wild plants for direct use or processing  (excluding genetic materials)", "section": "Provisioning", "label": "Wild plant materials (foraging)"},
    {"code": "1.1.5.3", "class": "Wild plants (terrestrial and aquatic, including fungi, algae) used as a source of energy", "section": "Provisioning", "label": "Wild plants used as fuel"},
    {"code": "1.1.6.1", "class": "Wild animals (terrestrial and aquatic) used for nutritional purposes", "section": "Provisioning", "label": "Wild food and game"},
    {"code": "1.1.6.2", "class": "Fibres and other materials from wild animals for direct use or processing (excluding genetic materials)", "section": "Provisioning", "label": "Materials from wild animals"},
    {"code": "1.1.6.3", "class": "Wild animals (terrestrial and aquatic)  used as a source of energy", "section": "Provisioning", "label": "Wild-animal-based fuel"},
    {"code": "1.2.1.1", "class": "Seeds, spores and other plant materials collected for maintaining or establishing a population", "section": "Provisioning", "label": "Seed and spore collection"},
    {"code": "1.2.1.2", "class": "Higher and lower plants (whole organisms) used to breed new strains or varieties", "section": "Provisioning", "label": "Wild plant stock for breeding new varieties"},
    {"code": "1.2.1.3", "class": "Individual genes extracted from higher and lower plants for the design and construction of new biological entities", "section": "Provisioning", "label": "Plant genetic resources"},
    {"code": "1.2.2.1", "class": "Animal material collected for the purposes of maintaining or establishing a population", "section": "Provisioning", "label": "Wild animal stock for restocking populations"},
    {"code": "1.2.2.2", "class": "Wild animals  (whole organisms) used to breed  new strains or varieties", "section": "Provisioning", "label": "Wild animal stock for breeding new varieties"},
    {"code": "1.2.2.3", "class": "Individual genes extracted from organisms  for the design and construction of new biological entities", "section": "Provisioning", "label": "Animal genetic resources"},
    {"code": "1.3.X.X", "class": "Other", "section": "Provisioning", "label": "Other provisioning services (biotic, not elsewhere classified)"},
    {"code": "4.2.1.1", "class": "Surface water for drinking", "section": "Provisioning", "label": "Drinking water from rivers and lakes"},
    {"code": "4.2.1.2", "class": "Surface water used as a material (non-drinking purposes)", "section": "Provisioning", "label": "Surface water for irrigation and industry"},
    {"code": "4.2.2.1", "class": "Ground (and subsurface) water for drinking", "section": "Provisioning", "label": "Drinking water from groundwater"},
    {"code": "4.2.2.2", "class": "Ground water (and subsurface)  used as a material (non-drinking purposes)", "section": "Provisioning", "label": "Groundwater for irrigation and industry"},
    {"code": "2.1.1.1", "class": "Bio-remediation by micro-organisms, algae, plants, and animals", "section": "Regulation and maintenance", "label": "Natural breakdown of pollutants (bioremediation)"},
    {"code": "2.1.1.2", "class": "Filtration/sequestration/storage/accumulation by micro-organisms, algae, plants, and animals", "section": "Regulation and maintenance", "label": "Natural filtering and storage of pollutants"},
    {"code": "2.1.2.1", "class": "Smell reduction", "section": "Regulation and maintenance", "label": "Odour reduction"},
    {"code": "2.1.2.2", "class": "Noise attenuation", "section": "Regulation and maintenance", "label": "Noise reduction"},
    {"code": "2.1.2.3", "class": "Visual screening", "section": "Regulation and maintenance", "label": "Visual screening (blocking unsightly views)"},
    {"code": "2.2.1.1", "class": "Control of erosion rates", "section": "Regulation and maintenance", "label": "Erosion control"},
    {"code": "2.2.1.2", "class": "Buffering and attenuation of mass movement", "section": "Regulation and maintenance", "label": "Landslide and avalanche protection"},
    {"code": "2.2.1.3", "class": "Hydrological cycle and water flow regulation (Including flood control, and coastal protection)", "section": "Regulation and maintenance", "label": "Flood and water flow regulation"},
    {"code": "2.2.1.4", "class": "Wind protection", "section": "Regulation and maintenance", "label": "Wind protection"},
    {"code": "2.2.1.5", "class": "Fire protection", "section": "Regulation and maintenance", "label": "Fire protection"},
    {"code": "2.2.2.1", "class": "Pollination (or 'gamete' dispersal in a marine context)", "section": "Regulation and maintenance", "label": "Pollination"},
    {"code": "2.2.2.2", "class": "Seed dispersal", "section": "Regulation and maintenance", "label": "Seed dispersal"},
    {"code": "2.2.2.3", "class": "Maintaining nursery populations and habitats (Including gene pool protection)", "section": "Regulation and maintenance", "label": "Habitat and nursery protection"},
    {"code": "2.2.3.1", "class": "Pest control (including invasive species)", "section": "Regulation and maintenance", "label": "Pest and invasive species control"},
    {"code": "2.2.3.2", "class": "Disease control", "section": "Regulation and maintenance", "label": "Disease control"},
    {"code": "2.2.4.1", "class": "Weathering processes and their effect on soil quality", "section": "Regulation and maintenance", "label": "Soil formation"},
    {"code": "2.2.4.2", "class": "Decomposition and fixing processes and their effect on soil quality", "section": "Regulation and maintenance", "label": "Soil fertility maintenance"},
    {"code": "2.2.5.1", "class": "Regulation of the chemical condition of freshwaters by living processes", "section": "Regulation and maintenance", "label": "Freshwater quality regulation"},
    {"code": "2.2.5.2", "class": "Regulation of the chemical condition of salt waters by living processes", "section": "Regulation and maintenance", "label": "Marine water quality regulation"},
    {"code": "2.2.6.1", "class": "Regulation of chemical composition of atmosphere and oceans", "section": "Regulation and maintenance", "label": "Global climate regulation and carbon sequestration"},
    {"code": "2.2.6.2", "class": "Regulation of temperature and humidity, including ventilation and transpiration", "section": "Regulation and maintenance", "label": "Local climate regulation (cooling, shade, ventilation)"},
    {"code": "2.3.X.X", "class": "Other", "section": "Regulation and maintenance", "label": "Other regulating services (biotic, not elsewhere classified)"},
    {"code": "3.1.1.1", "class": "Characteristics of living systems that that enable activities promoting health, recuperation or enjoyment through active or immersive interactions", "section": "Cultural", "label": "Outdoor recreation and exercise in nature"},
    {"code": "3.1.1.2", "class": "Characteristics of living systems that enable activities promoting health, recuperation or enjoyment through passive or observational interactions", "section": "Cultural", "label": "Nature watching and relaxation"},
    {"code": "3.1.2.1", "class": "Characteristics of living systems that enable scientific investigation or the creation of traditional ecological knowledge", "section": "Cultural", "label": "Scientific research and traditional knowledge"},
    {"code": "3.1.2.2", "class": "Characteristics of living systems that enable education and training", "section": "Cultural", "label": "Environmental education"},
    {"code": "3.1.2.3", "class": "Characteristics of living systems that are resonant in terms of culture or heritage", "section": "Cultural", "label": "Cultural heritage and identity"},
    {"code": "3.1.2.4", "class": "Characteristics of living systems that enable aesthetic experiences", "section": "Cultural", "label": "Natural beauty and scenery"},
    {"code": "3.2.1.1", "class": "Elements of living systems that have symbolic meaning", "section": "Cultural", "label": "Symbolic and emblematic value of nature"},
    {"code": "3.2.1.2", "class": "Elements of living systems that have sacred or religious meaning", "section": "Cultural", "label": "Spiritual and religious value of nature"},
    {"code": "3.2.1.3", "class": "Elements of living systems used for entertainment or representation", "section": "Cultural", "label": "Nature in art, film and media"},
    {"code": "3.2.2.1", "class": "Characteristics or features of living systems that have an existence value", "section": "Cultural", "label": "Existence value (knowing nature exists)"},
    {"code": "3.2.2.2", "class": "Characteristics or features of living systems that have an option or bequest value", "section": "Cultural", "label": "Value of nature for future generations"},
    {"code": "3.3.X.X", "class": "Other", "section": "Cultural", "label": "Other cultural services (biotic, not elsewhere classified)"},
]

# Canonical lists, copied word for word from Table S1 / Appendix A.
CANONICAL = {
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

    actual_career_stage = vocab.get("career_stage")
    if actual_career_stage is None:
        print("FAIL: 'career_stage' is missing from vocabularies.json")
        ok = False
    elif list(actual_career_stage) != CAREER_STAGE_CANONICAL:
        ok = False
        missing = [v for v in CAREER_STAGE_CANONICAL if v not in actual_career_stage]
        extra = [v for v in actual_career_stage if v not in CAREER_STAGE_CANONICAL]
        print("FAIL: 'career_stage' does not match the revised career stage list word for word.")
        if missing:
            print(f"  missing: {missing}")
        if extra:
            print(f"  unexpected: {extra}")
    else:
        print(f"OK: 'career_stage' ({len(actual_career_stage)} values) matches the revised list")

    actual_ecosystem_focus = vocab.get("ecosystem_focus")
    if actual_ecosystem_focus is None:
        print("FAIL: 'ecosystem_focus' is missing from vocabularies.json")
        ok = False
    elif list(actual_ecosystem_focus) != ECOSYSTEM_FOCUS_CANONICAL:
        ok = False
        missing = [v for v in ECOSYSTEM_FOCUS_CANONICAL if v not in actual_ecosystem_focus]
        extra = [v for v in actual_ecosystem_focus if v not in ECOSYSTEM_FOCUS_CANONICAL]
        print("FAIL: 'ecosystem_focus' does not match the canonical ecosystem focus list word for word.")
        if missing:
            print(f"  missing: {missing}")
        if extra:
            print(f"  unexpected: {extra}")
    else:
        print(f"OK: 'ecosystem_focus' ({len(actual_ecosystem_focus)} values) matches the canonical list")

    actual_work_scale = vocab.get("work_scale")
    if actual_work_scale is None:
        print("FAIL: 'work_scale' is missing from vocabularies.json")
        ok = False
    elif list(actual_work_scale) != WORK_SCALE_CANONICAL:
        ok = False
        missing = [v for v in WORK_SCALE_CANONICAL if v not in actual_work_scale]
        extra = [v for v in actual_work_scale if v not in WORK_SCALE_CANONICAL]
        print("FAIL: 'work_scale' does not match the canonical list word for word.")
        if missing:
            print(f"  missing: {missing}")
        if extra:
            print(f"  unexpected: {extra}")
    else:
        print(f"OK: 'work_scale' ({len(actual_work_scale)} values) matches the canonical list")

    actual_project_stage = vocab.get("project_stage")
    if actual_project_stage is None:
        print("FAIL: 'project_stage' is missing from vocabularies.json")
        ok = False
    elif list(actual_project_stage) != PROJECT_STAGE_CANONICAL:
        ok = False
        missing = [v for v in PROJECT_STAGE_CANONICAL if v not in actual_project_stage]
        extra = [v for v in actual_project_stage if v not in PROJECT_STAGE_CANONICAL]
        print("FAIL: 'project_stage' does not match the canonical list word for word.")
        if missing:
            print(f"  missing: {missing}")
        if extra:
            print(f"  unexpected: {extra}")
    else:
        print(f"OK: 'project_stage' ({len(actual_project_stage)} values) matches the canonical list")

    actual_sectors = vocab.get("sectors")
    if actual_sectors is None:
        print("FAIL: 'sectors' is missing from vocabularies.json")
        ok = False
    elif list(actual_sectors) != SECTORS_CANONICAL:
        ok = False
        missing = [v for v in SECTORS_CANONICAL if v not in actual_sectors]
        extra = [v for v in actual_sectors if v not in SECTORS_CANONICAL]
        print("FAIL: 'sectors' does not match the revised sectors list word for word.")
        if missing:
            print(f"  missing: {missing}")
        if extra:
            print(f"  unexpected: {extra}")
    else:
        print(f"OK: 'sectors' ({len(actual_sectors)} values) matches the revised list")

    actual_open_to = vocab.get("open_to")
    if actual_open_to is None:
        print("FAIL: 'open_to' is missing from vocabularies.json")
        ok = False
    elif list(actual_open_to) != OPEN_TO_CANONICAL:
        ok = False
        missing = [v for v in OPEN_TO_CANONICAL if v not in actual_open_to]
        extra = [v for v in actual_open_to if v not in OPEN_TO_CANONICAL]
        print("FAIL: 'open_to' does not match the revised list word for word.")
        if missing:
            print(f"  missing: {missing}")
        if extra:
            print(f"  unexpected: {extra}")
    else:
        print(f"OK: 'open_to' ({len(actual_open_to)} values) matches the revised list")

    actual_es_topics = vocab.get("es_topics")
    if actual_es_topics is None:
        print("FAIL: 'es_topics' is missing from vocabularies.json")
        ok = False
    elif actual_es_topics != ES_TOPICS_CANONICAL:
        ok = False
        actual_codes = [e.get("code") for e in actual_es_topics]
        expected_codes = [e["code"] for e in ES_TOPICS_CANONICAL]
        missing = [c for c in expected_codes if c not in actual_codes]
        extra = [c for c in actual_codes if c not in expected_codes]
        print("FAIL: 'es_topics' does not match the curated 63-class CICES v5.1 subset.")
        if missing:
            print(f"  missing codes: {missing}")
        if extra:
            print(f"  unexpected codes: {extra}")
        if not missing and not extra:
            print("  same 63 codes present, but a class/section/label field differs from the canonical entry")
    else:
        print(f"OK: 'es_topics' ({len(actual_es_topics)} values) matches the curated 63-class CICES v5.1 subset")

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

    for key in ("countries", "languages"):
        if key not in vocab or not vocab[key]:
            print(f"FAIL: '{key}' is missing or empty")
            ok = False
        else:
            print(f"OK: '{key}' present ({len(vocab[key])} values)")

    print()
    print("PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
