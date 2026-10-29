"""Six preserved identities, eight expressions, authored detail and restrained motion; deterministic pixel SVG source."""
from pathlib import Path
P=Path(__file__).resolve().parents[1]/'assets/pixel'
COL={'ink':'#253238','skin':'#efbd91','shade':'#ce8d69','white':'#fff5dc','red':'#be443a','gold':'#e7b94c','blue':'#456f94','green':'#356b55','purple':'#825a88','hair':'#382d2d','silver':'#d8d5cd'}
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{COL.get(c,c)}"/>'
ROLES=['you','boss','manager','worker','customer','devil'];MOODS=['normal','happy','angry','confused','surprised','sad','anxious','smug']
for role in ROLES:
 for mood in MOODS:
  parts=[]
  def r(x,y,w,h,c):parts.append(rect(x*2,y*2,w*2,h*2,c))
  def detail(*a):parts.append(rect(*a))
  skin='red' if role=='devil' else 'skin'; coat={'you':'blue','boss':'#584035','manager':'green','worker':'gold','customer':'purple','devil':'#553550'}[role]
  # Identity is carried by the outline and props, not just a palette swap.
  width={'you':18,'boss':34,'manager':22,'worker':20,'customer':26,'devil':18}[role];left=24-width//2
  if role=='devil':
   for x in [1,37]:
    r(x,35,10,20,'ink');r(x+2,38,6,13,'red');r(x+3,34,4,6,'red')
   r(40,48,3,23,'red');r(36,68,7,3,'red');r(35,64,5,5,'red')
  r(left-1,36,width+2,24,'ink');r(left,38,width,20,coat)
  # Different lower-body shapes: suit, broad trousers, apron, shorts, skirt, cape.
  for x in [15,28]:
   if role=='worker':
    r(x,56,7,9,'ink');r(x+1,57,5,6,'green');r(x+1,65,5,10,skin)
    r(x-2,74,11,5,'ink');r(x-1,75,9,3,'white')
   elif role in ['manager','customer']:
    r(x+1,65,5,10,'shade');r(x-1,74,9,5,'ink')
   elif role=='devil':
    r(x+1,65,5,10,'red');r(x-2,74,10,5,'ink');r(x-2,76,3,3,'gold')
   else:
    w=9 if role=='boss' else 6
    r(x,56,w,19,'ink');r(x+1,58,w-2,12,'#584035' if role=='boss' else '#456f94');r(x-2,74,w+4,5,'ink')
   r(x-2,78,10,2,'white')
  ay=31 if mood in ['angry','surprised'] else 40
  for x in [left-5,left+width+1]:
   if mood in ['happy','anxious'] or (mood=='confused' and x>24):continue
   r(x,ay,4,15,'ink');r(x+1,ay+1,3,10,coat)
   if mood!='smug':r(x,ay+12,4,4,skin)
  if role=='you':
   r(20,38,8,5,'white');r(23,40,3,17,'red');r(17,39,3,14,'#79a5bb')
   r(3,48,12,18,'ink');r(4,50,10,14,'#835a37');r(6,46,6,4,'ink');r(7,47,4,2,'gold');r(8,55,3,3,'gold')
  elif role=='boss':
   r(5,46,38,14,'ink');r(7,46,34,11,coat);r(15,38,18,8,'white');r(22,39,6,17,'gold')
   r(8,57,32,4,'ink');r(21,57,8,4,'gold');r(3,51,5,4,'gold');r(4,51,3,3,'white')
  elif role=='manager':
   r(11,55,27,13,'ink');r(13,55,23,11,'green');r(17,38,3,18,'white');r(28,38,3,18,'white');r(16,45,17,19,'white');r(19,52,11,6,'green')
   r(18,37,13,4,'red');r(26,40,4,6,'red');r(35,48,7,14,'ink');r(36,49,5,12,'white');r(37,51,3,2,'green')
  elif role=='worker':
   r(16,38,16,19,'white')
   for y in [41,47,53]:r(16,y,16,3,'red')
   r(13,38,4,20,'gold');r(32,38,4,20,'gold');r(32,49,13,11,'ink');r(33,50,11,9,'#bd8958');r(37,50,3,9,'gold')
  elif role=='customer':
   r(9,55,30,16,'ink');r(11,55,26,14,'purple');r(13,38,22,5,'gold');r(17,41,5,13,'gold');r(23,43,2,11,'white')
   r(35,49,10,14,'ink');r(36,51,8,10,'gold');r(37,47,6,4,'gold');r(3,54,3,23,'hair');r(3,53,8,3,'hair')
  else:
   r(9,52,31,16,'ink');r(11,52,27,13,'#553550');r(13,65,6,6,'ink');r(29,65,7,6,'ink');r(22,65,5,5,'ink')
   r(18,38,14,5,'white');r(22,40,6,18,'gold');r(23,44,4,11,'red')
  # Authored pose changes retain each role's silhouette and identifying props.
  if mood=='happy':
   for x in [left-5,left+width+1]:
    r(x,30,4,12,'ink');r(x+1,31,2,9,coat);r(x,27,4,4,skin)
  elif mood=='smug':
   r(left+2,45,width-4,5,'ink');r(left+3,46,width-6,3,coat)
   r(19,45,7,3,skin);r(23,49,7,3,skin)
  elif mood=='confused':
   r(left+width,36,4,12,'ink');r(left+width+1,37,2,10,coat)
   r(29,34,7,4,skin);r(30,32,4,3,skin)
  elif mood=='anxious':
   for x in [left-5,left+width+1]:
    r(x,24,4,20,'ink');r(x+1,26,2,16,coat);r(x,22,5,5,skin)
  # Head outline and hairstyle create immediately different silhouettes.
  if role=='boss':
   r(9,10,30,24,'ink');r(12,6,24,29,'ink');r(12,11,24,22,skin);r(15,7,18,8,skin);r(10,16,3,12,'hair');r(35,16,3,12,'hair');r(15,8,5,2,'white')
  elif role=='customer':
   r(11,6,25,30,'ink');r(16,2,14,8,'ink');r(18,3,10,6,'silver');r(12,8,23,27,'silver');r(15,15,19,20,skin);r(12,11,21,8,'silver');r(12,17,5,7,'silver');r(31,11,5,14,'silver')
  elif role=='manager':
   # High side ponytail and red bow, with an exposed jaw instead of a bob.
   r(4,7,10,24,'ink');r(5,9,7,18,'hair');r(7,26,6,8,'hair')
   r(11,7,25,28,'ink');r(14,14,20,21,skin);r(12,6,24,11,'hair');r(13,14,8,6,'hair');r(32,15,4,12,'hair')
   r(8,8,5,7,'red');r(13,10,4,3,'gold');r(15,8,4,7,'red')
  elif role=='worker':
   r(12,12,24,24,'ink');r(14,15,20,20,skin);r(13,18,4,8,'hair');r(32,18,3,8,'hair');r(11,7,25,10,'ink');r(13,8,21,7,'gold');r(8,15,31,4,'ink');r(9,15,29,2,'gold');r(21,9,7,4,'white')
  elif role=='you':
   r(12,8,24,28,'ink');r(14,14,20,21,skin);r(11,9,26,10,'ink');r(15,5,9,9,'ink');r(22,7,13,9,'ink');r(12,17,5,9,'ink');r(28,15,7,5,'ink');r(16,8,7,2,'blue')
  else:
   r(12,12,24,24,'ink');r(14,15,20,20,skin);r(12,9,24,9,'silver');r(13,6,6,9,'silver');r(30,6,5,9,'silver');r(8,4,5,16,'ink');r(35,4,5,16,'ink');r(9,5,3,12,'gold');r(36,5,3,12,'gold');r(12,18,4,5,'silver')
  r(30,24,3,9,'#a32e32' if role=='devil' else 'shade')
  # Large brows/eyes/mouth plus readable pose markers, shared across face/full views.
  if mood=='happy':
   for x in [17,27]:r(x,24,6,2,'ink');r(x+1,22,4,2,'ink')
   r(20,29,11,5,'ink');r(21,29,9,2,'white');r(23,32,5,2,'red')
  elif mood=='angry':
   for x in [17,27]:r(x,23,6,5,'white');r(x+2,24,3,4,'ink')
   r(16,20,4,2,'ink');r(20,21,4,2,'ink');r(26,21,4,2,'ink');r(30,20,4,2,'ink');r(20,30,11,4,'ink');r(21,31,9,1,'white')
   r(37,7,2,8,'red');r(34,10,8,2,'red')
  elif mood=='surprised':
   for x in [17,27]:r(x,21,6,7,'white');r(x+2,23,2,4,'ink')
   r(22,29,6,6,'ink');r(23,30,4,3,'red');r(40,3,2,7,'gold');r(40,12,2,2,'gold')
  elif mood=='sad':
   for x in [17,27]:r(x,25,6,2,'ink');r(x+1,27,3,7,'#338cd1')
   r(21,32,8,2,'ink');r(23,30,4,2,'ink');r(17,21,4,1,'ink');r(29,21,4,1,'ink')
  elif mood in ['confused','anxious']:
   r(17,22,6,2,'ink');r(28,20,5,2,'ink');r(18,25,3,3,'ink');r(28,25,3,3,'ink');r(22,31,4,2,'ink');r(26,30,4,2,'ink');r(35,19,5,9,'ink');r(36,19,3,7,'#338cd1');r(37,17,2,3,'#338cd1')
  elif mood=='smug':
   r(17,22,6,2,'ink');r(27,21,6,2,'ink');r(19,25,3,2,'ink');r(29,24,3,2,'ink')
   r(20,31,8,2,'ink');r(28,29,3,3,'ink');r(21,31,7,1,'white')
  else:
   for x in [17,27]:r(x,21,6,7,'white');r(x+2,22,3,5,'ink')
   r(21,31,8,2,'ink')
  if role=='you':
   for x in [15,26]:r(x,21,9,1,'ink');r(x,28,9,1,'ink');r(x,22,1,6,'ink');r(x+8,22,1,6,'ink')
   r(24,24,2,1,'ink')
  if role=='boss':
   r(17,28,17,2,'hair');r(20,27,11,1,'hair');r(13,30,3,3,'shade');r(34,29,2,3,'shade')
  if role=='customer':
   for x in [15,26]:
    r(x+2,20,5,1,'hair');r(x,22,1,5,'hair');r(x+8,22,1,5,'hair');r(x+2,28,5,1,'hair');r(x+1,21,1,1,'hair');r(x+7,21,1,1,'hair');r(x+1,27,1,1,'hair');r(x+7,27,1,1,'hair')
   r(24,24,2,1,'hair');r(14,30,4,1,'shade');r(32,30,3,1,'shade')
  if role=='worker':
   for x in [15,32]:r(x,29,2,2,'#a65a3d')
  if role=='devil' and mood in ['happy','angry']:r(21,30,2,3,'white');r(28,30,2,3,'white')
  # Fine-grid highlights, seams, hair strands and hands are new 1px work,
  # not interpolation of the old 48x80 image. Palette is shared by all roles.
  for x,y,w,h,c in [(29,39,2,9,'shade'),(57,39,2,7,'shade'),
                    (48,51,2,5,'shade'),(46,51,2,3,'white'),
                    (34,59,3,1,'shade'),(56,59,3,1,'shade'),
                    (left*2+2,80,1,14,'white'),((left+width)*2-3,84,1,21,'ink'),
                    (31,146,7,1,'silver'),(57,146,7,1,'silver')]:
   detail(x,y,w,h,c)
  if role in ['you','manager']:
   for x,y in [(29,19),(35,15),(45,18),(55,20),(63,26)]:
    detail(x,y,1,5,'#66504a');detail(x+1,y,3,1,'#66504a')
  elif role=='boss':
   detail(33,17,12,1,'white');detail(29,63,4,1,'shade');detail(66,61,3,1,'shade')
  elif role in ['customer','devil']:
   for x in [27,33,39,57,63]:detail(x,20,1,8,'#a8afb0')
  elif role=='worker':
   detail(26,18,40,1,'#fff0aa');detail(43,19,1,7,'gold');detail(28,27,34,1,'#bd8958')
  if role in ['you','boss']:
   for x,y,w,h in [(35,80,2,6),(37,86,2,5),(39,91,2,5),(59,80,2,6),(57,86,2,5),(55,91,2,5)]:detail(x,y,w,h,'ink')
   detail(47,111,2,2,'gold');detail(33,109,7,1,'ink')
  elif role=='manager':
   detail(35,91,2,33,'#d8d5cd');detail(62,91,2,33,'#d8d5cd')
   detail(39,105,20,1,'ink');detail(39,106,1,8,'ink');detail(59,106,1,8,'ink')
   detail(40,86,9,5,'gold');detail(42,87,5,1,'ink')
  elif role=='worker':
   detail(28,78,1,34,'#bd8958');detail(65,78,1,18,'#bd8958');detail(69,103,16,1,'gold')
  elif role=='customer':
   for x in [28,40,54,65]:detail(x,116,1,19,'#584035')
   detail(39,86,1,16,'#fff0aa');detail(73,105,12,1,'white')
  else:
   for x in [26,68]:detail(x,108,1,19,'purple')
   detail(47,91,2,15,'white');detail(18,12,1,15,'white')
  if mood=='anxious':
   detail(72,35,3,10,'#338cd1');detail(73,32,1,3,'#338cd1')
   detail(42,62,16,2,'ink');detail(44,61,2,1,'ink');detail(54,61,2,1,'ink')
  art=''.join(parts)
  blink=''
  if mood not in ['happy','sad']:
   blink='<g class="blink">'+''.join(rect(x,44,10,10,skin)+rect(x,50,10,2,'ink') for x in [34,54])+'</g>'
  motion='<style>.blink{opacity:0;animation:blink 5.7s steps(1,end) infinite}@keyframes blink{0%,93%,100%{opacity:0}95%,98%{opacity:1}}.talk{opacity:0;animation:talk .6s steps(1,end) 6}@keyframes talk{0%,100%{opacity:0}50%{opacity:1}}@media(prefers-reduced-motion:reduce){.blink,.talk{animation:none;opacity:0}}</style>'
  for face in [False,True]:
   box='16 8 64 64' if face else '0 0 96 160';w,h=(64,64) if face else (96,160)
   base=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{box}" shape-rendering="crispEdges">{motion}{art}{blink}'
   (P/f'{role}-{mood}{"-face" if face else ""}.svg').write_text(base+'</svg>')
   if face:
    talk='<g class="talk">'+rect(42,60,16,8,skin)+rect(45,61,10,6,'ink')+rect(47,64,6,2,'red')+'</g>'
    (P/f'{role}-{mood}-speaking.svg').write_text(base+talk+'</svg>')
