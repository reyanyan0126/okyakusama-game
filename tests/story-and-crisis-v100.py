from pathlib import Path
from playwright.sync_api import sync_playwright
import re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 html=html.replace(tag,('<style>'+ (root/file).read_text()+'</style>') if file.endswith('css') else ('<script>'+(root/file).read_text()+'</script>'))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(375,667),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(html,wait_until='load')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click()
  for i in range(7):
   assert page.locator('#prologueArt').get_attribute('href')=='#story-scene-'+str(i+1)
   value=page.evaluate('''i=>{const s=document.querySelector('#story-scene-'+i);const u=document.querySelector('#prologueArt');return {exists:!!s,child:s?.children.length,bbox:u.getBoundingClientRect().toJSON(),b:{width:u.getBBox().width,height:u.getBBox().height}}}''',i+1)
   assert value['exists'] and value['child']>=4 and value['b']['width']>100,(i,value)
   if width==390:page.locator('#prologueIllustration').screenshot(path=str(root/f'story-visible-{i+1}.png'))
   if i<6:page.locator('#prologueNext').click()
  page.locator('#prologueNext').click()
  page.evaluate('''()=>{let s=window.GameEngine.initial(1234);s.lastResult={fireHit:true,memoryEvent:false,actionId:'shrink',actionName:'お手軽サイズに進化',title:'SNSが炎上した',week:s.week-1};s.fire=65;window.testBrief=window.GameEngine.weeklyBrief(s);window.testNext=window.GameEngine.play(s,'apology');}''')
  q=page.evaluate('''()=>({title:window.testBrief.title,quote:window.testBrief.quote,offers:window.GameEngine.weeklyOffers(window.GameEngine.initial(1234)).length,response:window.testNext.lastResult.crisisResponse})''')
  assert 'お手軽サイズ' in q['title'] and '評判' in q['response'] and '炎上度' in q['response'],q
  assert not errors,(width,errors)
  print('PASS',width,'seven visible illustrations and crisis response',flush=True)
  c.close()
 b.close()