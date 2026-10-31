#!/usr/bin/env python3
"""Import approved Work sprite sheets without modifying game logic.
Requires Pillow. Run: python scripts/import-work-sprites.py INPUT_DIR
INPUT_DIR must contain customers.jpeg, scenes.jpeg, icons.jpeg,
special-customers.jpeg, expressions.jpeg.
"""
from pathlib import Path
from PIL import Image
import argparse, json, sys
SHEETS = {
 "customers": ("customers.jpeg",8,5),
 "scenes": ("scenes.jpeg",4,3),
 "icons": ("icons.jpeg",8,4),
 "special-customers": ("special-customers.jpeg",4,4),
 "expressions": ("expressions.jpeg",8,4),
}
def process(source, destination):
    destination.mkdir(parents=True,exist_ok=True)
    manifest={"schema":1,"status":"review-required","assets":[]}
    for group,(name,cols,rows) in SHEETS.items():
        path=source/name
        if not path.is_file(): raise FileNotFoundError(f"Missing source: {path}")
        with Image.open(path) as im:
            im=im.convert("RGB")
            w,h=im.size
            for row in range(rows):
                for col in range(cols):
                    # Exact integer cell boundaries prevent cumulative rounding drift.
                    bounds=(w*col//cols,h*row//rows,w*(col+1)//cols,h*(row+1)//rows)
                    out=destination/group/f"{group}-{row+1:02d}-{col+1:02d}.png"
                    out.parent.mkdir(parents=True,exist_ok=True)
                    im.crop(bounds).save(out,optimize=True)
                    manifest["assets"].append({"id":f"{group}-{row+1:02d}-{col+1:02d}","file":out.relative_to(destination).as_posix(),"source":name,"bounds":bounds,"reviewed":False})
    (destination/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Prepared {len(manifest['assets'])} review-required cells at {destination}")
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("input_dir",type=Path)
    parser.add_argument("--output",type=Path,default=Path("assets/work-import"))
    args=parser.parse_args()
    try: process(args.input_dir,args.output)
    except (FileNotFoundError,ValueError) as error: print(error,file=sys.stderr);sys.exit(1)
