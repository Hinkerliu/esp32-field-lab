import re, os, json
WS = r"C:/Users/hinkerliu/WorkBuddy/2026-11-17-22-44-38/esp32-field-lab-zh"
files = ["dist/index.html","dist/app.js","dist/lessons.js","dist/guides.js","dist/diagrams.js",
         "dist/scene.js","dist/build.js","dist/build-circuit.js","dist/build-projects.js",
         "dist/build-walkthroughs.js","dist/build-project-picker.js","README.md"]
# crude: quoted strings containing >=2 consecutive ascii letters, length>=10, exclude obvious code
pat = re.compile(r"(['\"`])((?:\\.|(?!\1)[^\\]){9,})\1", re.S)
for f in files:
    p = os.path.join(WS, f)
    s = open(p, encoding="utf-8").read()
    strs = []
    for m in pat.finditer(s):
        v = m.group(2)
        letters = len(re.findall(r"[A-Za-z]", v))
        if letters < 6: continue
        if v.startswith(("http","./","../","#","data:","M0","M ","rgba","var(","--")): continue
        strs.append(v.replace("\n"," ")[:80])
    uniq = sorted(set(strs))
    print(f"{f:40s} strings={len(strs):4d} uniq={len(uniq):4d}")
