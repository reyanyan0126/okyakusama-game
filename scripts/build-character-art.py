"""Six distinct silhouettes, six expressions; deterministic pixel SVG source."""
from pathlib import Path
P=Path(__file__).resolve().parents[1]/'assets/pixel'
COL={'ink':'#253238','skin':'#efbd91','shade':'#ce8d69','white':'#fff5dc','red':'#be443a','gold':'#e7b94c','blue':'#456f94','green':'#356b55','purple':'#825a88','hair':'#382d2d','silver':'#d8d5cd'}
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{COL.get(c,c)}"/>'
ROLES=['you','boss','manager','worker','customer','devil'];MOODS=['normal','happy','angry','confused','surprised','sad']
for role in ROLES:
 for mood in MOODS:
  parts=[]
  def r(*a):parts.append(rect(*a))
  skin='red' if role=='devil' else 'skin'; coat={'you':'blue','boss':'#584035','manager':'green','worker':'gold','customer':'purple','devil':'#553550'}[role]
  # Bodies differ in width, costume and equipment; not only palette swaps.
  width={'boss':30,'customer':24,'devil':18}.get(role,22);left=24-width//2
  if role=='devil':
   for x in [2,36]:r(x,37,10,16,'ink');r(x+2,39,6,12,'red')
   r(38,49,3,11,'red');r(34,58,7,3,'red')
  r(left-1,36,width+2,22,'ink');r(left,38,width,18,coat)
  if role=='customer':r(13,53,23,7,'purple')
  for x in [16,27]:r(x,57,6,5,'ink');r(x-1,61,8,3,'ink')
  ay=31 if mood in ['angry','surprised'] else 40
  for x in [left-5,left+width+1]:r(x,ay,4,15,'ink');r(x+1,ay+1,3,10,coat);r(x,ay+12,4,4,skin)
  if role=='you':
   r(20,38,8,5,'white');r(23,40,3,13,'red');r(7,45,10,13,'ink');r(8,46,8,10,'white');r(10,48,4,2,'blue')
  elif role=='boss':
   r(16,38,16,7,'white');r(22,39,5,15,'gold');r(12,49,24,3,'ink');r(22,49,5,3,'gold')
  elif role=='manager':
   r(17,38,3,18,'white');r(28,38,3,18,'white');r(18,45,12,11,'white');r(20,46,8,3,'green');r(28,40,5,3,'gold')
  elif role=='worker':
   r(17,38,3,18,'green');r(28,38,3,18,'green');r(18,45,12,11,'green');r(20,47,8,4,'white')
  elif role=='customer':
   r(21,38,6,13,'white');r(33,47,10,12,'ink');r(34,49,8,9,'gold');r(35,44,6,5,'gold');r(37,44,2,3,'white')
  else:r(20,38,8,9,'white');r(23,39,3,13,'gold')
  # Head outline and hairstyle create immediately different silhouettes.
  if role=='boss':
   r(9,10,30,24,'ink');r(12,6,24,29,'ink');r(12,11,24,22,skin);r(15,7,18,8,skin);r(10,16,3,12,'hair');r(35,16,3,12,'hair');r(15,8,5,2,'white')
  elif role=='customer':
   r(11,6,25,30,'ink');r(16,2,14,8,'ink');r(18,3,10,6,'silver');r(12,8,23,27,'silver');r(15,15,19,20,skin);r(12,11,21,8,'silver');r(12,17,5,7,'silver');r(31,11,5,14,'silver')
  elif role=='manager':
   r(8,8,32,31,'ink');r(11,5,25,33,'ink');r(10,10,28,27,'hair');r(14,15,20,20,skin);r(12,7,23,11,'hair');r(12,15,8,5,'hair');r(33,15,5,22,'hair');r(10,16,4,21,'hair');r(32,15,6,3,'gold')
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
   for x in [17,27]:r(x,24,5,3,'ink')
   r(16,20,4,2,'ink');r(20,21,4,2,'ink');r(26,21,4,2,'ink');r(30,20,4,2,'ink');r(20,30,11,4,'ink');r(21,31,9,1,'white')
   r(37,7,2,8,'red');r(34,10,8,2,'red')
  elif mood=='surprised':
   for x in [17,27]:r(x,21,6,7,'white');r(x+2,23,2,4,'ink')
   r(22,29,6,6,'ink');r(23,30,4,3,'red');r(40,3,2,7,'gold');r(40,12,2,2,'gold')
  elif mood=='sad':
   for x in [17,27]:r(x,25,6,2,'ink');r(x+1,27,2,5,'blue')
   r(21,32,8,2,'ink');r(23,30,4,2,'ink');r(17,21,4,1,'ink');r(29,21,4,1,'ink')
  elif mood=='confused':
   r(17,22,6,2,'ink');r(28,20,5,2,'ink');r(18,25,3,3,'ink');r(28,25,3,3,'ink');r(22,31,4,2,'ink');r(26,30,4,2,'ink');r(36,20,3,6,'blue');r(37,18,2,3,'blue')
  else:
   for x in [18,28]:r(x,23,3,4,'ink')
   r(21,31,8,2,'ink')
  if role=='you':
   for x in [15,26]:r(x,21,9,1,'ink');r(x,28,9,1,'ink');r(x,22,1,6,'ink');r(x+8,22,1,6,'ink')
   r(24,24,2,1,'ink')
  if role=='boss':r(20,28,12,2,'hair');r(23,27,5,1,'hair')
  if role=='devil' and mood in ['happy','angry']:r(21,30,2,3,'white');r(28,30,2,3,'white')
  art=''.join(parts)
  for face in [False,True]:
   box='8 4 32 32' if face else '0 0 48 64';w,h=(32,32) if face else (48,64)
   (P/f'{role}-{mood}{"-face" if face else ""}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{box}" shape-rendering="crispEdges">{art}</svg>')
