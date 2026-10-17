from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path('/mnt/data/okyakusama-v0.7')
html=(folder/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+ (folder/'styles.css').read_text()+'</style>')
html=html.replace('<script defer src="engine.js"></script>','<script>'+ (folder/'engine.js').read_text()+'</script>')
html=html.replace('<script defer src="app.js"></script>','<script>'+ (folder/'app.js').read_text()+'</script>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(375,667),(390,844),(430,932),(1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.locator('#titleStart').click();page.locator('#acceptMarket').click()
  assert page.locator('#officeView').is_visible()
  assert page.locator('#cashCount').is_visible()
  assert not page.locator('#actions').is_visible(), 'proposals should start hidden'
  dims=page.evaluate('''() => {const ids=['#officeView','.game-nav','.client-hero','#openProposals','.play-stats']; const d={};for(let k of ids){let e=document.querySelector(k),r=e.getBoundingClientRect();d[k]={top:r.top,bottom:r.bottom,height:r.height,scroll:e.scrollHeight,client:e.clientHeight}}return d}''')
  print('SCREEN',w,h,dims,flush=True)
  page.screenshot(path=str(folder/f'office-{w}.png'))
  if w<500:
   assert dims['#officeView']['scroll']<=dims['#officeView']['client']+5, ('office overflow',w,dims)
   assert dims['#openProposals']['bottom']<=dims['.game-nav']['top']+2,('button hidden',w,dims)
  page.locator('#openProposals').click()
  assert page.locator('#proposalSheet').is_visible()
  assert page.locator('.proposal-panel .action-option').count()==4
  page.screenshot(path=str(folder/f'proposals-{w}.png'))
  page.locator('.proposal-panel .action-option').last.click()
  page.locator('#advanceButton').click()
  page.wait_for_selector('#reportScene:visible',timeout=5000)
  assert '店の残り資金' in page.locator('#reportScene').inner_text()
  page.screenshot(path=str(folder/f'result-{w}.png'))
  page.locator('#reportContinue').click()
  page.locator('[data-screen="voice"]').click();assert page.locator('#voiceView').is_visible()
  page.locator('[data-screen="office"]').click();assert page.locator('#officeView').is_visible()
  assert '2 / 12' in page.locator('#weekIndicator').inner_text()
  assert not errors,(w,errors)
  c.close()
 b.close()

print('PASS: actual Chromium 375/390/430/1280, title, store, drawer, action, report, nav')