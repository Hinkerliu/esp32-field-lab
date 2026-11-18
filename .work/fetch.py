import json, base64, urllib.request, os, sys, time
from concurrent.futures import ThreadPoolExecutor

WS = r"C:/Users/hinkerliu/WorkBuddy/2026-11-17-22-44-38/esp32-field-lab-zh"
tree = json.load(open(os.path.join(WS, ".work", "tree.json"), encoding="utf-8"))
blobs = [t for t in tree["tree"] if t["type"] == "blob"]

def fetch(t):
    path = t["path"]
    out = os.path.join(WS, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return ("skip", path)
    url = "https://api.github.com/repos/Hinkerliu/esp32-field-lab/git/blobs/" + t["sha"]
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WorkBuddy"})
            with urllib.request.urlopen(req, timeout=30) as r:
                j = json.load(r)
            with open(out, "wb") as f:
                f.write(base64.b64decode(j["content"]))
            return ("ok", path)
        except Exception as e:
            if attempt == 3:
                return ("FAIL:" + str(e), path)
            time.sleep(1.5)
    return ("FAIL", path)

with ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(fetch, blobs))

fails = [(s, p) for s, p in results if s.startswith("FAIL")]
print("ok:", sum(1 for s, _ in results if s in ("ok", "skip")), "fails:", len(fails))
for s, p in fails:
    print(s, p)
