"""Build vector pixel lettering from the OFL Noto glyphs and app icons from our rect-only store SVG."""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageFont, ImageDraw
from fontTools.ttLib import TTFont
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
text='お客様のために。';fonts={}
for p in (root/'node_modules/@fontsource/noto-sans-jp/files').glob('*-400-normal.woff'):
 f=TTFont(p); chars=f.getBestCmap()
 wanted=[c for c in text if ord(c) in chars and c not in fonts]
 if wanted:
  f.flavor=None;b=BytesIO();f.save(b)
  for c in wanted:fonts[c]=ImageFont.truetype(BytesIO(b.getvalue()),16)
 if len(fonts)==len(set(text)):break
if len(fonts)<len(set(text)):raise ValueError('Missing Japanese font glyphs')
im=Image.new('L',(len(text)*17,20));draw=ImageDraw.Draw(im)
for i,c in enumerate(text):draw.text((i*17,-4),c,font=fonts[c],fill=255,anchor='la')
rs=[]
for y in range(im.height):
 x=0
 while x<im.width:
  if im.getpixel((x,y))<85:x+=1;continue
  end=x+1
  while end<im.width and im.getpixel((end,y))>=85:end+=1
  rs.append(f'<rect x="{x}" y="{y}" width="{end-x}" height="1"/>');x=end
(root/'assets/pixel/logo.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="136" height="20" viewBox="0 0 136 20" fill="#293a35" shape-rendering="crispEdges">'+''.join(rs)+'</svg>')
# Native pixel store artwork -> exact nearest-neighbour install icons.
svg=ET.parse(root/'assets/pixel/store-normal.svg').getroot();base=Image.new('RGB',(144,144),'#f5eedc');d=ImageDraw.Draw(base)
for e in svg:
 if e.tag.endswith('rect'):
  x=int(e.attrib.get('x',0));y=int(e.attrib.get('y',0))+32;w=int(e.attrib['width']);h=int(e.attrib['height']);d.rectangle((x,y,x+w-1,y+h-1),fill=e.attrib['fill'])
for size in [180,192,512]:base.resize((size,size),Image.Resampling.NEAREST).save(root/f'icons/icon-{size}.png')
print('Built pixel logo and three install icons')
