# scripts/validate_and_fix_labels.py
import sys, os, shutil
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv)>1 else "./damaged-boxes-detection-3")

labels = list(root.rglob("labels/*.txt"))
print(f"Checking {len(labels)} label files...")

bad_files = []
for p in labels:
    txt = p.read_text().strip()
    if txt == "":
        bad_files.append((p, "empty"))
        continue
    lines = txt.splitlines()
    for i,l in enumerate(lines,1):
        parts = l.split()
        if len(parts)!=5:
            bad_files.append((p, f"bad_len_line_{i}", l))
            break
        try:
            cls, xc,yc,w,h = map(float, parts)
        except:
            bad_files.append((p, f"parse_error_line_{i}", l))
            break
        if w <= 0 or h <= 0 or not (0<=xc<=1 and 0<=yc<=1):
            bad_files.append((p, f"invalid_values_line_{i}", parts))
            break

if not bad_files:
    print("No invalid labels found.")
else:
    print(f"Found {len(bad_files)} problematic files. Backing up and emptying labels for manual check...")
    bad_dir = root / "bad_labels_backup"
    bad_dir.mkdir(exist_ok=True)
    for p,reason in bad_files:
        target = bad_dir / p.name
        shutil.copy(p, target)
        # clear the label so augmentation doesn't error (you can later repair)
        p.write_text("") 
        print(f"Backed up {p} -> {target} reason:{reason}")
    print("Done. Please inspect bad_labels_backup and re-annotate those images or remove the images.")
