"""Full mobile UI, portraits, personal-money ledger, and six-beat prologue regression."""
from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path(__file__).resolve().parents[1]
html=(folder/'index.html').read_text()
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 source=(folder/file).read_text()
 embedded='<style>'+source+'</style>' if file.endswith('.css') else '<script>'+source+'</script>'
 assert tag in html,tag
 html=html.replace(tag,embedded)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(375,667),(390,844),(430,932),(1280,850)]:
  context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  page=context.new_page();errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='load')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click()
  assert page.locator('#prologueCounter').inner_text()=='01 / 06'
  titles=[]
  for i in range(6):
   titles.append(page.locator('#prologueHeading').inner_text())
   assert page.locator('#prologueCounter').inner_text()==f'{i+1:02} / 06'
   if i<5:page.locator('#prologueNext').click()
  assert len(set(titles))==6,titles
  page.screenshot(path=str(folder/f'prologue-v098-{width}.png'))
  page.locator('#prologueNext').click()
  assert page.locator('#officeView').is_visible()
  assert page.locator('#personalBalance').inner_text()=='28,000円'
  assert page.locator('.face-art').count()==2
  for role in ['bossFace','buyerFace']:
   bbox=page.locator('#'+role).bounding_box()
   assert bbox and bbox['width']>=32 and bbox['height']>=40,(width,role,bbox)
   eyes=page.locator('#'+role+' .face-eyes').bounding_box()
   assert eyes and bbox['y']<=eyes['y']<=bbox['y']+bbox['height'],(width,role,eyes,bbox)
  layout=page.evaluate('''()=>{const d=document.querySelector('.decision-card').getBoundingClientRect(),n=document.querySelector('.game-nav').getBoundingClientRect();return{bottom:d.bottom,nav:n.top,overflow:document.documentElement.scrollWidth-innerWidth}}''')
  assert layout['overflow']<=1,(width,layout)
  if width<=850: assert layout['bottom']<=layout['nav']+4,(width,layout)
  page.screenshot(path=str(folder/f'office-v098-{width}.png'))
  page.locator('#openStatusSheet').click(); assert page.locator('#statusSheet').is_visible()
  assert page.locator('#statusClose').is_visible()
  assert '累計利益' in page.locator('#statusContent').inner_text()
  page.locator('#statusClose').click(); assert not page.locator('#statusSheet').is_visible()
  page.locator('#officePersonalMoney').click();assert page.locator('#moneySheet').is_visible()
  assert '7,000円' in page.locator('#moneyLines').inner_text()
  assert '36,000円' in page.locator('#moneyLines').inner_text()
  page.screenshot(path=str(folder/f'money-start-v098-{width}.png'))
  page.locator('#moneyClose').click()
  assert not page.locator('#moneySheet').is_visible()
  page.locator('#openProposals').click(); assert page.locator('#proposalSheet').is_visible()
  assert page.locator('#closeProposals').is_visible()
  page.locator('#advanceButton').click(); page.locator('#reportScene').wait_for(state='visible',timeout=10000)
  assert page.locator('#weekSceneClose').is_visible()
  page.locator('#reportPersonalChange').wait_for()
  assert '円' in page.locator('#reportPersonalChange').inner_text()
  page.locator('#reportLedgerButton').click()
  if page.locator('#moneySheet').is_visible():
   page.locator('#moneyPersonalTab').click()
   assert '店からの報酬' in page.locator('#moneyLines').inner_text()
   page.screenshot(path=str(folder/f'money-after-v098-{width}.png'))
   page.locator('#moneyClose').click()
  page.locator('#weekSceneClose').click()
  assert not page.locator('#weekScene').is_visible()
  page.locator('#openStatusSheet').click()
  assert page.locator('#statusReport').is_visible()
  page.locator('#statusReport').click()
  assert page.locator('#reportScene').is_visible()
  page.locator('#reportContinue').click()
  assert not page.locator('#weekScene').is_visible()
  assert not errors,(width,errors)
  context.close();print('PASS',width,height,layout,flush=True)
 browser.close()