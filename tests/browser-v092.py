from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path(__file__).resolve().parents[1]
html=(folder/'index.html').read_text()
for name,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 data='<style>'+(folder/name).read_text()+'</style>' if name.endswith('.css') else '<script>'+(folder/name).read_text()+'</script>'
 html=html.replace(tag,data)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(375,667),(390,844),(430,932),(1280,850)]:
  context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  page=context.new_page();errs=[]
  page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(html,wait_until='load')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click()
  assert page.locator('#prologueScreen').is_visible()
  assert page.locator('#prologueCounter').inner_text()=='01 / 03'
  page.screenshot(path=str(folder/f'prologue-{width}.png'))
  page.locator('#prologueNext').click();assert page.locator('#prologueCounter').inner_text()=='02 / 03'
  page.locator('#prologueNext').click();assert page.locator('#prologueCounter').inner_text()=='03 / 03'
  page.locator('#prologueNext').click()
  assert page.locator('#officeView').is_visible() and not page.locator('#prologueScreen').is_visible()
  assert page.locator('#personalBalance').inner_text()=='2.8万円'
  assert page.locator('#officeView .office-room-art').is_visible()
  print('DETAIL',page.locator('#advancedStats').count(),page.locator('#advancedStats').is_visible())
  box=page.evaluate('''()=>{let x=document.querySelector('#officeView');let d=x.querySelector('.decision-card');let nav=document.querySelector('.game-nav');let main=document.querySelector('main');return {window:innerHeight,scrollHeight:x.scrollHeight,clientHeight:x.clientHeight,decisionBottom:d.getBoundingClientRect().bottom,navTop:nav.getBoundingClientRect().top,mainScroll:main.scrollHeight-main.clientHeight,horizontal:document.documentElement.scrollWidth-innerWidth,detailClosed:!document.querySelector('.stats-stack').getBoundingClientRect().height}}''')
  print('OFFICE',width,height,box)
  page.screenshot(path=str(folder/f'office-{width}.png'))
  assert box['horizontal']<=0,box
  if width<850:assert box['decisionBottom']<=box['navTop']+2,box
  page.locator('#openProposals').click();assert page.locator('.action-option').count()==3
  page.locator('#advanceButton').click();page.wait_for_selector('#reportScene:visible',timeout=9000)
  if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
  if page.locator('#rescueScene').is_visible():page.locator('.rescue-option').first.click()
  page.locator('#reportContinue').click()
  assert page.locator('#weekIndicator').inner_text().startswith('2 / 12')
  page.locator('.game-tab[data-screen="voice"]').click()
  loc=page.evaluate('''()=>{let h=document.querySelector('#voiceView .voice-feed-heading').getBoundingClientRect();let a=document.querySelector('#publicFeed .social-post').getBoundingClientRect();return a.top-h.bottom}''')
  assert loc>=8,('social overlap',width,loc)
  page.locator('.game-tab[data-screen="records"]').click()
  assert page.locator('#recordsView').is_visible()
  page.locator('.game-tab[data-screen="office"]').click()
  assert page.locator('#officeView').is_visible()
  page.locator('#backTitle').click() if page.locator('#backTitle').is_visible() else None
  assert not errs,(width,errs)
  context.close()
  print('PASS',width,height)
 browser.close()
print('PASS v0.9.2 prologue, office, no overlap, gameplay, tabs')