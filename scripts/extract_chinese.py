import os
import re

VUE_DIR = "apps/web/src/views"
OUTPUT_FILE = "scripts/chinese_strings.txt"

chinese_pattern = re.compile(r'[\u4e00-\u9fa5]+')

all_strings = set()

for filename in os.listdir(VUE_DIR):
    if filename.endswith(".vue"):
        path = os.path.join(VUE_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            # Match any consecutive Chinese characters, possibly with spaces, punctuation, or numbers inside, 
            # but usually just text content or attribute values.
            # Let's find simple Chinese words/phrases.
            matches = re.findall(r'[\u4e00-\u9fa5]+[a-zA-Z0-9\s\u4e00-\u9fa5，。！？：]*[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+', content)
            for m in matches:
                m_clean = m.strip()
                if m_clean:
                    all_strings.add(m_clean)

# Sort by length descending so that we replace longer phrases first!
sorted_strings = sorted(list(all_strings), key=len, reverse=True)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    for s in sorted_strings:
        f.write(s + "\n")

print(f"Extracted {len(sorted_strings)} strings to {OUTPUT_FILE}")
