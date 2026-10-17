from pathlib import Path
import json
from playwright.sync_api import sync_playwright
folder=Path(__file__).resolve().parents[1]
html=(folder/'index.html').read_text()
for name,token in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
 tag='<style>'+(folder/name).read_text()+'</style>' if name.endswith('.css') else '<script>'+(folder/name).read_text()+'</script>'
 html=html.replace(token,tag)
mock='<script>Object.defineProperty(window,"localStorage",{configurable:true,value:{items:window.__testItems||{},getItem(k){return this.items[k]??null},setItem(k,v){this.items[k]=String(v)},removeItem(k){delete this.items[k]}}});</script>' 
html=html.replace('<body>', '<body>'+mock)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(375,667),(390,844),(430,932)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   page=context.new_page();errs=[]
   page.on('pageerror',lambda e:errs.append(str(e)))
   page.set_content(html,wait_until='load')
   page.locator('#titleStart').click();page.locator('#acceptMarket').click()
   page.locator('#openProposals').click()
   assert page.locator('.action-option').count()==3
   page.locator('#advanceButton').click()
   page.wait_for_selector('#reportScene:visible',timeout=8000)
   if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
   page.locator('#reportContinue').click()
   page.locator('.game-tab[data-screen="voice"]').click()
   loc=page.evaluate('''() => {
    const a=document.querySelector('#voiceView .voice-feed-heading').getBoundingClientRect();
    const b=document.querySelector('#publicFeed .social-post').getBoundingClientRect();
    return {headingBottom:a.bottom,cardTop:b.top,cardHeight:b.height,headingTop:a.top}
   }''')
   print('VOICE',width,loc)
   assert loc['cardTop']-loc['headingBottom']>=8, f'Section heading overlaps first card: {loc}'
   if width==390:page.screenshot(path=str(folder/'voice-390-v091.png'))
   # Test a full insolvency scenario, persisted through browser reload.
   status=page.evaluate('''() => {
     const G=window.GameEngine;const s=G.initial(1);s.cash=1000;
     const next=G.play(s,'pop');localStorage.setItem('okyakusama.save.v1',JSON.stringify(next));
     return {pending:next.rescuePending,cash:next.cash,week:next.week};
   }''')
   assert status['pending'],status
   saved=page.evaluate("() => localStorage.getItem('okyakusama.save.v1')")
   page.set_content(html,wait_until='load')
   page.evaluate('(s) => localStorage.setItem(\"okyakusama.save.v1\",s)',saved)
   # App setup runs synchronously during page.set_content, so render once with the saved payload loaded before scripts.
   state_script='<script>window.__testItems={\"okyakusama.save.v1\":'+json.dumps(saved)+'};</script>'
   page.set_content(html.replace(mock,state_script+mock),wait_until='load')
   page.locator('#titleResume').click()
   if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
   page.wait_for_selector('#rescueScene:visible',timeout=3000)
   assert '不足している' in page.locator('.rescue-deficit').inner_text()
   assert page.locator('.rescue-option').count()>=1
   if width==390:page.screenshot(path=str(folder/'rescue-390-v091.png'))
   page.locator('.rescue-option').first.click()
   page.wait_for_selector('#reportScene:visible',timeout=3000)
   assert '生還' in page.locator('#reportVerdictTitle').inner_text()
   page.locator('#reportContinue').click()
   assert page.locator('#weekIndicator').inner_text().startswith('2 / 12')
   assert errs==[],(width,errs)
   context.close()
  browser.close()
 print('PASS: Chromium iPhone widths, social feed spacing, insolvent recovery, persistence, and continued play')
finally:
 pass