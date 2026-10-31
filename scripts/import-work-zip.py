#!/usr/bin/env python3
"""Validate and extract the 132-cell Work export ZIP into the review gallery.
Usage: python scripts/import-work-zip.py /path/to/okyakusama_pixel_assets_split.zip
No third-party dependencies. Does not publish assets or claim transparency.
"""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile, BadZipFile

GROUPS={"customers":40,"scenes":12,"icons":32,"special_customers":16,"portraits":32}
MAX_IMAGE=2_000_000

def import_zip(archive:Path, output:Path):
    with ZipFile(archive) as z:
        manifest=json.loads(z.read("manifest.json"))
        if not isinstance(manifest,list) or len(manifest)!=132:
            raise ValueError("Expected exactly 132 manifest entries")
        expected=set()
        for group,count in GROUPS.items():
            cols,rows={"customers":(8,5),"scenes":(4,3),"icons":(8,4),"special_customers":(4,4),"portraits":(8,4)}[group]
            expected.update(f"{group}/{group}_{r:02d}_{c:02d}.png" for r in range(1,rows+1) for c in range(1,cols+1))
        actual={x.get("path") for x in manifest}
        if actual!=expected or len(actual)!=len(manifest):
            raise ValueError("Unexpected, duplicate, or missing asset paths")
        for entry in manifest:
            name=entry["path"]
            item=z.getinfo(name)
            if item.file_size>MAX_IMAGE: raise ValueError(f"Oversized asset: {name}")
            payload=z.read(item)
            if not payload.startswith(b"\\x89PNG\\r\\n\\x1a\\n"):
                raise ValueError(f"Invalid PNG: {name}")
            dest=output/name
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_bytes(payload)
        metadata={"schema":1,"reviewed":False,"transparent":False,"assetCount":132,
                  "assets":[{"id":x["id"],"path":x["path"],"reviewed":False} for x in manifest]}
        (output/"manifest.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("Extracted 132 PNG files; pending visual review:",output)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("zip",type=Path)
    parser.add_argument("--output",type=Path,default=Path("assets/work-import"))
    args=parser.parse_args()
    try: import_zip(args.zip,args.output)
    except (ValueError,KeyError,FileNotFoundError,BadZipFile) as error: parser.exit(1,str(error)+"\n")
