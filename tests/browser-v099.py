"""Mobile + desktop smoke test for 30-week UI, telephone and optional actions."""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text()
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 assert tag in html, tag
 html=html.replace(tag,('<style>'+ (r/file).read_text()+'</style>') if file.endswith('css') else ('<script>'+(r/file).read_text()+'</script>'))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(375,667),(390,844),(430,932),(1280,850)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click()
  for i in [1,2]:page.locator('#prologueNext').click()
  assert page.locator('#prologueHeading').inner_text()=='プルルル……'
  assert page.locator('#prologueNext').inner_text().startswith('電話に出る')
  assert page.locator('#prologueIllustration.phone-ringing').count()==1
  page.locator('#prologueNext').click()
  assert '相談だけでも' in page.locator('#prologueHeading').inner_text()
  assert page.locator('#prologueIllustration.phone-ringing').count()==0
  for i in range(3):page.locator('#prologueNext').click()
  assert page.locator('#prologueHeading').inner_text().startswith('……どうするか')
  page.locator('#prologueNext').click()
  assert '1 / 30' in page.locator('#weekIndicator').inner_text()
  assert page.locator('#officeView').is_visible()
  page.locator('#openProposals').click()
  assert page.locator('.action-option').count()==3
  assert '使わなくてもOK' in page.locator('#optionalActions > summary').inner_text()
  page.locator('#optionalActions > summary').click()
  assert page.locator('#projectChoices').is_visible()
  assert '0円' in page.locator('#projectNote').inner_text()
  page.locator('#optionalActions > summary').click()
  page.locator('#advanceButton').click()
  page.locator('#reportScene').wait_for(state='visible',timeout=10000)
  assert page.locator('#weekSceneClose').is_visible()
  assert ' / 30' in page.locator('#reportWeek').inner_text()
  assert not errors,(width,errors)
  if page.locator('#reportContinue').is_enabled():page.locator('#reportContinue').click()
  else:page.locator('#accidentIgnore').click();page.locator('#reportContinue').click()
  assert page.locator('#weekIndicator').inner_text()=='2 / 30'
  dims=page.evaluate('''()=>({over:document.documentElement.scrollWidth-innerWidth, footer:document.querySelector('.game-nav').getBoundingClientRect().bottom})''')
  assert dims['over']<3,(width,dims)
  page.screenshot(path=str(r/f'office-v099-{width}.png'))
  c.close();print('PASS browser',width,flush=True)
 b.close()