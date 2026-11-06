#!/usr/bin/env python3
"""Rebuild UI crops from untouched source PNGs. Pillow; no generative changes.
Full bodies use one source-pixel scale per source family, preserving body/pose
and relative height. Portraits are deliberate head crops, never squeezed bodies.
"""
from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/ui'; OUT.mkdir(exist_ok=True)
records=[]
def save(source, name, mode, head_height=None, head_box=None):
    im=Image.open(ROOT/source).convert('RGBA'); original=im.size
    if head_box: im=im.crop(head_box)
    elif head_height: im=im.crop((0,0,im.width,min(head_height,im.height)))
    # Exported cast sheets contain faint off-character pixels. Locate visible
    # components, discard only isolated specks (<20px), preserve hair/accessories
    # and expression marks, then retain a 2px antialias border around the crop.
    alpha=im.getchannel('A'); pixels=alpha.load(); seen=set(); keep=[]
    for yy in range(im.height):
        for xx in range(im.width):
            if (xx,yy) in seen or pixels[xx,yy]<=32: continue
            todo=[(xx,yy)];seen.add((xx,yy));component=[]
            while todo:
                x,y=todo.pop();component.append((x,y))
                for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                    if 0<=nx<im.width and 0<=ny<im.height and (nx,ny) not in seen and pixels[nx,ny]>32:
                        seen.add((nx,ny));todo.append((nx,ny))
            if len(component)>=20: keep+=component
    assert keep,source
    bounds=(max(0,min(x for x,y in keep)-2),max(0,min(y for x,y in keep)-2),min(im.width,max(x for x,y in keep)+3),min(im.height,max(y for x,y in keep)+3))
    crop=im.crop(bounds)
    if mode=='body':
        # Source cast family has a common 181px canvas; retain original stature.
        size=(256,224); placed=crop; x=(size[0]-crop.width)//2; y=size[1]-crop.height
    elif mode=='guest':
        size=(280,224); placed=crop; x=(size[0]-crop.width)//2; y=size[1]-crop.height
    else:
        side=max(crop.size)+8; size=(side,side);placed=crop
        x=(side-crop.width)//2;y=(side-crop.height)//2
    assert x>=0 and y>=0,(source,crop.size,size)
    result=Image.new('RGBA',size);result.alpha_composite(placed,(x,y))
    if mode=='face': result=result.resize((128,128),Image.Resampling.LANCZOS)
    result.save(OUT/name,optimize=True)
    records.append(dict(source=source,output='assets/ui/'+name,kind=mode,sourceSize=original,crop=list(bounds),size=list(result.size),alphaBounds=list(result.getbbox()),headHeight=head_height,headBox=head_box))
roles=['you','boss','manager','worker','customer','devil'];moods=['normal','happy','angry','confused','surprised','sad','anxious','smug']
for role in roles:
    for col,mood in enumerate(moods,1):
        save(f'assets/cast/{role}-{mood}.png',f'{role}-{mood}.png','body')
        row={'boss':1,'worker':2,'customer':3,'devil':4}.get(role)
        source=f'assets/work-import/portraits/portraits_{row:02}_{col:02}.png' if row else f'assets/cast/{role}-{mood}-face.png'
        # Remove lower bust from taller imported portraits, keep complete hair/head.
        im=Image.open(ROOT/source);save(source,f'{role}-{mood}-face.png','face',im.width if row else None)
for index in range(40):
    row,col=index//8+1,index%8+1
    save(f'assets/work-import/customers/customers_{row:02}_{col:02}.png',f'guest-{index+1}.png','guest')
# Head regions reviewed against each original. Hands/baskets remain in the
# original full-body artwork; face thumbnails intentionally show head/shoulders.
head_boxes={
 1:[(4,0,164,145),(18,0,180,145),(24,0,192,145),(15,0,185,145)],
 2:[(40,0,184,130),(26,0,178,130),(26,0,185,140),(28,0,195,140)],
 3:[(43,0,230,160),(38,0,224,160),(53,0,224,160),(40,0,219,160)],
 4:[(33,0,164,145),(43,0,178,145),(68,0,204,145),(58,0,199,145)]
}
for row,boxes in head_boxes.items():
    for col,box in enumerate(boxes,1):
        source=f'assets/work-import/special_customers/special_customers_{row:02}_{col:02}.png'
        # Wide/curly hairstyles must retain the entire horizontal source extent.
        save(source,f'regular-{row}-{col}-face.png','face',head_height=box[3] if row in (1,3) else None,head_box=None if row in (1,3) else box)
(OUT/'manifest.json').write_text(json.dumps({'version':1,'method':'alpha crop; common body scale; head-only portrait crop','assets':records},ensure_ascii=False,indent=2)+'\n')
print('Normalized',len(records),'images; source originals unchanged')
