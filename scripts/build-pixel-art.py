"""Deterministic rect-only SVG sprites. Palette and grid are the design source."""
from pathlib import Path
P=Path(__file__).resolve().parents[1]/'assets/pixel';P.mkdir(exist_ok=True)
C={'ink':'#293a35','ivory':'#f5eedc','green':'#315c49','light':'#8eaa77','brown':'#886c53','skin':'#edbb91','shade':'#ce906d','hair':'#493b36','gold':'#d8ae58','red':'#b65a4c','blue':'#8eafb0','white':'#fff9e9'}
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{C.get(c,c)}"/>'
def svg(w,h,s):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" shape-rendering="crispEdges">{s}</svg>'
# Character source is shared with the dedicated portrait rebuild.
import runpy
runpy.run_path(str(Path(__file__).with_name('build-character-art.py')))
for state in ['normal','busy','shortstaff','fire','crisis','closed']:
 a=rect(0,0,144,80,'ivory')+rect(0,0,144,48,'blue')+rect(0,48,144,32,'light')
 for x in [8,116]:a+=rect(x,23,16,26,'green')+rect(x+5,44,5,22,'brown')+rect(x-3,31,22,13,'green')
 a+=rect(26,23,92,46,'ink')+rect(28,25,88,42,'ivory')+rect(24,21,96,5,'green')+rect(30,13,84,10,'ink')+rect(32,15,80,6,'green')
 for x in range(28,116,8):a+=rect(x,27,8,9,'red' if x%16 else 'ivory')
 a+=rect(35,41,24,18,'ink')+rect(37,43,20,14,'blue')+rect(86,41,24,18,'ink')+rect(88,43,20,14,'blue')+rect(64,39,18,28,'ink')+rect(66,41,14,24,'blue')+rect(72,41,2,24,'ink')+rect(66,66,14,2,'brown')
 for x in [38,46,89,97]:a+=rect(x,52,5,4,'gold')
 a+=rect(24,69,96,3,'brown')+rect(18,72,108,3,'ivory')
 if state=='fire':
  for x in [42,69,94]:a+=rect(x,17,8,6,'red')+rect(x+2,10,4,9,'gold')+rect(x+3,6,2,7,'red')
 if state in ['crisis','closed']:a+=rect(64,40,18,25,'brown')+rect(65,49,16,7,'ivory')+rect(68,52,10,1,'red')
 if state=='shortstaff':a+=rect(93,38,13,12,'gold')+rect(99,40,2,5,'ink')+rect(99,47,2,1,'ink')
 if state in ['normal','busy','shortstaff']:
  for i,x in enumerate([49,95] if state=='normal' else [39,51,93,106] if state=='busy' else [39,46,53,60]):
   a+=rect(x,60,4,4,'hair')+rect(x,64,4,6,'green' if i%2 else 'brown')+rect(x,70,1,3,'ink')+rect(x+3,70,1,3,'ink')
 (P/f'store-{state}.svg').write_text(svg(144,80,a))
icons={
 'coin':[(4,2,8,12,'gold'),(2,4,12,8,'gold'),(6,5,4,6,'brown'),(7,4,2,8,'brown')],
 'wallet':[(2,4,12,10,'brown'),(4,2,9,3,'gold'),(9,7,6,4,'gold'),(11,8,2,2,'ink')],
 'heart':[(2,3,5,5,'red'),(9,3,5,5,'red'),(3,6,10,4,'red'),(5,10,6,2,'red'),(7,12,2,2,'red')],
 'warning':[(7,1,2,3,'gold'),(5,4,6,3,'gold'),(3,7,10,3,'gold'),(1,10,14,4,'gold'),(7,5,2,5,'ink'),(7,11,2,2,'ink')],
 'document':[(3,1,10,14,'brown'),(4,2,8,12,'ivory'),(6,5,5,1,'green'),(6,8,5,1,'green'),(6,11,3,1,'red')],
 'store':[(2,6,12,8,'brown'),(1,3,14,4,'green'),(4,8,3,4,'blue'),(9,8,3,6,'ivory')],
 'people':[(6,1,4,4,'skin'),(4,5,8,7,'green'),(5,12,2,3,'ink'),(9,12,2,3,'ink')],
 'chart':[(2,11,3,3,'brown'),(6,7,3,7,'light'),(10,2,3,12,'green')],
 'star':[(6,1,4,12,'gold'),(1,5,14,4,'gold'),(3,9,3,4,'gold'),(10,9,3,4,'gold')],
 'tools':[(2,2,3,6,'blue'),(8,2,3,6,'blue'),(4,6,5,3,'blue'),(5,9,3,6,'brown')]
}
for k,rs in icons.items():(P/f'icon-{k}.svg').write_text(svg(16,16,''.join(rect(*r) for r in rs)))
print('Generated',len(list(P.glob('*.svg'))),'vector pixel assets')
# Shared 144x80 room grid: same 2x scale as the storefront.
for scene in ['office','meeting','contract','night']:
 a=rect(0,0,144,80,'ink' if scene=='night' else 'ivory')+rect(0,53,144,27,'brown')
 a+=rect(12,10,37,32,'green')+rect(14,12,33,28,'ink' if scene=='night' else 'blue')+rect(29,12,2,28,'ivory')+rect(14,25,33,2,'ivory')
 for x in range(0,144,24):a+=rect(x,58,1,22,'shade')
 a+=rect(58,44,65,6,'ink')+rect(60,42,61,4,'brown')+rect(62,50,4,22,'ink')+rect(115,50,4,22,'ink')
 if scene in ['office','night']:
  a+=rect(82,25,21,16,'ink')+rect(84,27,17,12,'blue')+rect(90,41,5,3,'ink')+rect(109,35,8,7,'ivory')+rect(69,37,9,5,'ivory')+rect(70,34,8,4,'ivory')
 if scene=='meeting':a+=rect(83,28,22,14,'green')+rect(86,31,16,2,'ivory')+rect(86,36,9,2,'gold')
 if scene=='contract':a+=rect(81,20,24,23,'ink')+rect(83,22,20,19,'ivory')+rect(86,25,14,2,'brown')+rect(86,29,12,1,'brown')+rect(94,34,5,5,'red')
 a+=rect(126,41,11,16,'green')+rect(128,55,7,11,'gold')
 (P/f'scene-{scene}.svg').write_text(svg(144,80,a))
