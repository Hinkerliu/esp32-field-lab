import re, os, sys

WS = r"C:/Users/hinkerliu/WorkBuddy/2026-11-17-22-44-38/esp32-field-lab-zh"
FILES = ["dist/index.html","dist/app.js","dist/lessons.js","dist/guides.js","dist/diagrams.js",
         "dist/scene.js","dist/build.js","dist/build-circuit.js","dist/build-projects.js",
         "dist/build-walkthroughs.js","dist/build-project-picker.js"]

# Common English prose words that indicate untranslated user-facing text.
# Excludes technical identifiers which legitimately stay English.
BAD = re.compile(r"\b(the|and|with|this|that|your|you|are|will|can|from|into|when|what|how|use|using|"
                 r"click|press|connect|select|open|close|choose|check|make|sure|should|need|"
                 r"before|after|between|below|above|here|there|they|them|its|for|not|but|all|"
                 r"first|next|last|step|steps|lesson|lessons|complete|completed|components|"
                 r"description|overview|settings|simulation|simulate|run|stop|reset|start|"
                 r"ready|loading|success|failed|error|warning|successful|correct|incorrect|"
                 r"example|examples|note|notes|tip|tips|help|about|learn|build|project|projects)\b", re.I)

# Skip strings that are clearly code/config: urls, ids, enums, technical terms only.
def looks_like_prose(s):
    if len(s) < 12: return False
    if s.startswith(("http", "./", "../", "#", "data:", "M0", "M ", "var(", "--", "/", "*", "!")): return False
    letters = re.findall(r"[A-Za-z]", s)
    if len(letters) < 8: return False
    # If it has CJK, it's translated
    if re.search(r"[\u4e00-\u9fff]", s): return False
    return bool(BAD.search(s))

for f in FILES:
    p = os.path.join(WS, f)
    if not os.path.exists(p): continue
    s = open(p, encoding="utf-8").read()
    # quoted strings
    pat = re.compile(r"(['\"`])((?:\\.|(?!\1)[^\\]){11,})\1", re.S)
    hits = []
    for m in pat.finditer(s):
        v = m.group(2)
        if looks_like_prose(v):
            hits.append(v.replace("\n", " ")[:110])
    uniq = sorted(set(hits))
    if uniq:
        print(f"\n### {f}  ({len(uniq)} suspicious)")
        for h in uniq[:40]:
            print("  -", h)
        if len(uniq) > 40: print(f"  ... and {len(uniq)-40} more")
