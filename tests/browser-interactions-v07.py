from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path('/mnt/data/okyakusama-v0.7')
html=(folder/'index.html').read_text()
for source,token in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 tag='<style>'+ (folder/source).read_text()+'</style>' if source.endswith('.css') else '<script>'+ (folder/source).read_text()+'</script>'
 html=html.replace(token,tag)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(375,667),(390,844),(430,932)]:
  ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  # Reproducible incident in Week 1: seed 1, shrink, register equipment off.
  page.set_content(html.replace('(()=>{\'use strict\';\nconst G=window.GameEngine;', '(()=>{\'use strict\';\nconst G=window.GameEngine;'),wait_until='load')
  page.evaluate('Date.now=()=>1')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#openProposals').click()
  assert page.locator('[data-project="none"]').get_attribute('aria-checked')=='true'
  assert page.locator('[data-project="equipment"]').is_visible()
  assert page.locator('[data-project="fans"]').is_visible()
  assert page.locator('[data-project="equipment"]').inner_text().find('4.5万円')>=0
  page.locator('#advanceButton').click();page.wait_for_selector('#reportScene:visible',timeout=5000)
  assert page.locator('#reportVerdictTitle').inner_text()
  assert page.locator('.flow-item').count()==4
  assert page.locator('#accidentDecision').is_visible(), 'first week should have accident'
  assert page.locator('#reportContinue').is_disabled()
  page.screenshot(path=str(folder/f'incident-{width}.png'))
  page.locator('#accidentRepair').click()
  assert not page.locator('#accidentDecision').is_visible()
  assert page.locator('#reportContinue').is_enabled()
  assert page.locator('#reportCash').inner_text()
  page.locator('#reportContinue').click()
  assert page.locator('#officeView').is_visible()
  assert '2 / 12' in page.locator('#weekIndicator').inner_text()
  assert errors==[], (width,errors)
  ctx.close()
 # separate test: invest in project and verify report and later state
 ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 page=ctx.new_page();err=[];page.on('pageerror',lambda e:err.append(str(e)))
 page.set_content(html,wait_until='load');page.evaluate('Date.now=()=>12')
 page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#openProposals').click()
 page.locator('[data-project="people"]').click()
 assert page.locator('[data-project="people"]').get_attribute('aria-checked')=='true'
 page.locator('#advanceButton').click();page.wait_for_selector('#reportScene:visible',timeout=5000)
 assert page.locator('#investmentResult').is_visible()
 assert 'スタッフを育てる' in page.locator('#investmentResult').inner_text()
 if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
 page.locator('#reportContinue').click()
 page.locator('#openProposals').click()
 assert 'Lv1/2' in page.locator('[data-project="people"]').inner_text()
 assert err==[], err
 ctx.close();browser.close()
print('PASS v0.7 Chromium investment and responsive incident choices')