from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path('/mnt/data/okyakusama-v0.9')
html=(folder/'index.html').read_text()
for src,token in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 tag='<style>'+ (folder/src).read_text()+'</style>' if src.endswith('.css') else '<script>'+ (folder/src).read_text()+'</script>'
 html=html.replace(token,tag)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(375,667),(390,844),(430,932),(1280,800)]:
  ctx=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
  page=ctx.new_page();errs=[]
  page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(html,wait_until='load');page.evaluate('Date.now=()=>123')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click()
  assert '2.8万円' in page.locator('#personalBalance').inner_text()
  assert page.locator('#macroName').inner_text()
  sizes=page.evaluate('''() => {let e=document.querySelector('#officeView'), b=document.querySelector('#openProposals'), n=document.querySelector('.game-nav');return {panelOverflow:e.scrollHeight-e.clientHeight,buttonBottom:b.getBoundingClientRect().bottom,navTop:n.getBoundingClientRect().top}}''')
  print('OFFICE',w,sizes)
  if w<500:
   assert sizes['panelOverflow']<6, (w,'office overflow',sizes)
   assert sizes['buttonBottom']<=sizes['navTop']+3, (w,'button behind navbar',sizes)
  page.locator('#openProposals').click()
  assert page.locator('.action-option').count()==3, 'Three compact boardroom decisions'
  assert page.locator('.boss-pick').count()==1, 'President incentive appears on exactly one choice'
  page.locator('.action-option:has(.boss-pick)').click()
  assert page.locator('#devilSection').is_visible()
  assert page.locator('#devilChoices [data-devil="personal"]').count()==1
  page.locator('#devilSection summary').click()
  page.locator('[data-devil="personal"]').click()
  assert page.locator('[data-devil="personal"]').get_attribute('aria-checked')=='true'
  page.locator('#advanceButton').click();page.wait_for_selector('#reportScene:visible',timeout=6000)
  assert '万円' in page.locator('#reportExpenses').inner_text()
  assert page.locator('#economyHeadline').inner_text()
  if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
  page.locator('#reportContinue').click()
  assert '2 / 12' in page.locator('#weekIndicator').inner_text()
  assert errs==[],(w,errs)
  ctx.close()
 browser.close()
print('PASS v0.9 Chromium: layouts, title, news, devil pact, report, accident resolution, next week')