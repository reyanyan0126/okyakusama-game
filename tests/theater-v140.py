"""Browser coverage with real localStorage: separate phases, skip/reload/response and mobile layout."""
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
import os
r=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(r)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}'
def state(page): return page.evaluate("JSON.parse(localStorage.getItem('okyakusama.save.v1'))")
def layout(page):
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 for id in ['outcomeNext','newsNext','reportContinue','workingSkip']:
  el=page.locator('#'+id)
  if el.is_visible():
   el.scroll_into_view_if_needed();b=el.bounding_box()
   assert b['x']>=0 and b['x']+b['width']<=page.viewport_size['width']+1,(id,b)
def drain(page):
 if page.locator('#outcomeScene').is_visible():page.locator('#outcomeNext').click()
 for _ in range(12):
  if not page.locator('#newsScene').is_visible():break
  layout(page)
  if page.locator('#accidentDecision').is_visible():
   assert not page.locator('#newsNext').is_enabled()
   page.locator('#weekSceneClose').click()
   assert page.locator('#newsScene').is_visible()
   page.locator('#accidentIgnore').click()
  page.locator('#newsNext').click()
 if page.locator('#rescueScene').is_visible():page.locator('#rescueGiveUp').click()
 assert page.locator('#reportScene').is_visible()
 assert not page.locator('#performanceReport').is_visible()
 assert not page.locator('#storyEvent').is_visible()
 layout(page)
with sync_playwright() as p:
 for name in os.environ.get('THEATER_BROWSERS','chromium,webkit').split(','):
  browser=getattr(p,name).launch(headless=True)
  for width in [375,390,430]:
   for motion in ['reduce','no-preference']:
    c=browser.new_context(viewport={'width':width,'height':844},reduced_motion=motion)
    page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#prologueSkip').click();page.locator('#firstWeekStart').click()
    page.locator('#openProposals').click();page.locator('#advanceButton').click()
    before=state(page);assert len(before['history'])==1
    if motion=='no-preference':
     assert page.locator('#workingScene').is_visible();layout(page)
     page.locator('#workingSkip').evaluate('(b)=>{b.click();b.click();b.click()}')
    page.locator('#outcomeScene').wait_for(state='visible')
    assert not page.locator('#reportScene').is_visible();layout(page)
    page.screenshot(path=f'/tmp/v140-{name}-{width}-{motion}.png')
    after=state(page)
    for field in ['rng','cash','personalCash','history']:assert before[field]==after[field],field
    page.reload();page.locator('#titleResume').click();assert page.locator('#outcomeScene').is_visible()
    assert state(page)['history']==before['history']
    drain(page);page.locator('#reportContinue').click();assert state(page)['presentation'] is None
    # Deterministic pending-accident save. Reload cannot bypass mandatory response.
    page.evaluate('''()=>{const G=GameEngine;for(let seed=1;seed<2000;seed++){let s=G.play(G.initial(seed),'quality');if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0){s.presentation={week:1,stage:'news',newsIndex:0};localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));return;}}throw Error('no accident fixture');}''')
    page.reload();page.locator('#titleResume').click();drain(page)
    assert state(page)['lastResult']['accidentResponse']=='ignore'
    assert not errors,errors
    print('PASS theater',name,width,motion,flush=True);c.close()
  browser.close()
server.shutdown()
