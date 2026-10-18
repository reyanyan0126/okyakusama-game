from theater_helpers import finish_theater
"""v1.3.0 authored story mobile flow and current-save restoration."""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text(encoding='utf-8')
sources=[('styles.css','<link rel="stylesheet" href="styles.css">'),('stories.js','<script defer src="stories.js"></script>'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('manga-v200.js','<script defer src="manga-v200.js"></script>'),('policy-symbols-v173.js','<script defer src="policy-symbols-v173.js"></script>'),('app.js','<script defer src="app.js"></script>')]
for file,tag in sources:
 assert tag in html,file
 html=html.replace(tag,('<style>'+(r/file).read_text(encoding='utf-8')+'</style>') if file.endswith('.css') else ('<script>'+(r/file).read_text(encoding='utf-8')+'</script>'))
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(375,667),(390,844),(430,932)]:
  c=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  page=c.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  # A stable seed keeps this legacy narrative regression independent of
  # rare bankruptcy outcomes from a random new-game seed.
  page.evaluate("""()=>{const initial=GameEngine.initial;GameEngine.initial=()=>initial(447);}""")
  page.locator('#titleStart').click()
  page.locator('#acceptMarket').click()
  page.locator('#prologueSkip').click()
  page.locator('#firstWeekStart').click()
  page.locator('#openProposals').click()
  page.locator('#advanceButton').click()
  finish_theater(page)
  page.locator('#reportScene').wait_for(state='visible',timeout=15000)
  if not page.locator('#reportContinue').is_enabled():
   page.locator('#accidentIgnore').click()
  page.locator('#reportContinue').click()
  assert page.locator('#weekIndicator').inner_text()=='2 / 30'
  assert page.locator('#storyPulse').is_visible()
  page.locator('#openProposals').click()
  assert page.locator('.action-option').count()==4
  assert page.locator('.action-option[data-id^="arc_register_"]').count()==4
  page.locator('.action-option[data-id="arc_register_boss"]').click()
  page.locator('#advanceButton').click()
  assert page.locator('#workingArtUse').get_attribute('href')=='#policy-scene-story-register'
  finish_theater(page)
  page.locator('#reportScene').wait_for(state='visible',timeout=15000)
  page.locator('#financialDetail').evaluate('(el)=>el.open=true')
  assert page.locator('#storyEvent').is_visible()
  assert page.locator('#storyArtUse').get_attribute('href')=='#story-cut-register'
  assert page.locator('#storyTierUse').get_attribute('href') in ['#story-tier-failure','#story-tier-success','#story-tier-great']
  assert page.locator('#storyEpisodeText').inner_text().strip()
  assert page.locator('#storyEpisodeQuote').inner_text().strip()
  if not page.locator('#reportContinue').is_enabled():
   page.locator('#accidentIgnore').click()
  page.locator('#reportContinue').click()
  page.locator('#openStatusSheet').click()
  detail=page.locator('#statusContent').inner_text()
  assert '登場人物・因縁' in detail
  assert '未解決の事件' in detail
  page.locator('#statusDone').click()
  assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'),(width,'overflow')
  assert not errors,(width,errors)
  print('PASS v1.3.0 story mobile',width,height,flush=True)
  c.close()
 browser.close()
