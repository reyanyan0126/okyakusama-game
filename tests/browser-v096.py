"""Test state-driven office illustration, visual changes and compact mobile layout."""
from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path(__file__).resolve().parents[1]
html=(folder/'index.html').read_text()
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    source=(folder/file).read_text()
    if file=='app.js':source=source.replace('let game;', 'let game;window.__testSceneSet=changes=>{Object.assign(game,changes);paint()};',1)
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
  page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#prologueSkip').click()
  assert page.locator('#officeView').is_visible()
  hero=page.locator('#officeView .office-hero')
  assert hero.get_attribute('data-store-state') in ['normal','quiet','critical']
  assert page.locator('#officeSceneText').inner_text().startswith('現場：')
  screen=page.evaluate('''()=>{let c=document.querySelector('.decision-card').getBoundingClientRect(),n=document.querySelector('.game-nav').getBoundingClientRect();return {bottom:c.bottom,nav:n.top,overflow:document.documentElement.scrollWidth-innerWidth}}''')
  assert screen['overflow']<=1,(width,screen)
  if width<=850:assert screen['bottom']<=screen['nav']+3,(width,screen)
  page.screenshot(path=str(folder/f'office-v096-{width}.png'))
  # Pure presentation tests: mutate local game state, then repaint, and verify visual layers.
  evaluate='''(changes)=>{window.__testSceneSet(changes);return {data:document.querySelector('.office-hero').dataset.storeState,bills:document.querySelector('.office-hero').dataset.billLoad,devil:document.querySelector('.office-hero').dataset.devil,office:document.querySelector('.office-hero').dataset.officeState,caption:document.querySelector('#officeSceneText').textContent}}'''
  happy=page.evaluate(evaluate,{'cash':485000,'personalCash':155000,'storeRep':80,'sat':83,'frust':12,'fire':2})
  assert happy['data']=='busy' and happy['office']=='upgraded' and happy['bills']=='0',happy
  assert page.locator('.scene-extra-customers').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  page.screenshot(path=str(folder/f'office-v096-busy-{width}.png'))
  crisis=page.evaluate(evaluate,{'cash':49000,'personalCash':1000,'arrears':30000,'storeRep':22,'fire':5,'sat':33,'frust':76})
  assert crisis['data']=='critical' and crisis['bills']=='3',crisis
  assert page.locator('.office-invoice-three').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  page.screenshot(path=str(folder/f'office-v096-crisis-{width}.png'))
  scandal=page.evaluate(evaluate,{'fire':76})
  assert scandal['data']=='scandal',scandal
  assert page.locator('.scene-protesters').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  scene=page.evaluate(evaluate,{'bankrupt':True})
  assert scene['data']=='closed',scene
  assert page.locator('.scene-closed-shutter').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  page.evaluate(evaluate,{'bankrupt':False,'cash':200000,'storeRep':55,'fire':6,'personalCash':18000,'arrears':0,'sat':65,'frust':30,'pacts':[{'id':'shop','due':3,'price':120000}]})
  assert hero.get_attribute('data-devil')=='yes'
  assert page.locator('.office-devil-visitor').evaluate('(e)=>getComputedStyle(e).visibility')=='visible'
  # Existing financial popup and gameplay remain operable.
  page.locator('#officeStoreMoney').click();assert page.locator('#moneySheet').is_visible();page.locator('#moneyClose').click()
  page.locator('#openProposals').click();assert page.locator('#proposalSheet').is_visible();page.locator('#closeProposals').click()
  assert not errors,(width,errors)
  context.close();print('PASS',width,height,screen,flush=True)
 browser.close()