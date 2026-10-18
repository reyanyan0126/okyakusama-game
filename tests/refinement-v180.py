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
 assert page.locator('#reportNext').is_visible()
 assert not page.locator('#performanceReport').is_visible()
 assert not page.locator('#storyEvent').is_visible()
 layout(page)
with sync_playwright() as p:
 for name in os.environ.get('THEATER_BROWSERS','chromium,webkit').split(','):
  browser=getattr(p,name).launch(headless=True)
  for width in [320,375,390,430]:
   for motion in ['reduce','no-preference']:
    c=browser.new_context(viewport={'width':width,'height':844},reduced_motion=motion)
    page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#prologueSkip').click();page.locator('#firstWeekStart').click()
    page.locator('#openProposals').click()
    selected=page.locator('#actions [aria-checked="true"]');selected.focus()
    old=selected.get_attribute('data-id');selected.press('ArrowRight')
    assert page.locator('#actions [aria-checked="true"]').get_attribute('data-id')!=old
    assert page.evaluate('document.activeElement.getAttribute("aria-checked")')=='true'
    page.locator('#actions [aria-checked="true"]').press('Home')
    assert page.locator('#actions [tabindex="0"]').count()==1
    assert page.locator('#selectedTradeoff').is_visible()
    assert page.locator('#selectedTradeoff').inner_text()
    layout(page)
    page.screenshot(path=f'/tmp/v180-proposal-{name}-{width}-{motion}.png')
    page.locator('#advanceButton').click()
    before=state(page);assert len(before['history'])==1
    if motion=='no-preference':
     assert page.locator('#workingScene').is_visible();layout(page)
     page.locator('#workingSkip').evaluate('(b)=>{b.click();b.click();b.click()}')
    page.locator('#outcomeScene').wait_for(state='visible')
    assert not page.locator('#reportScene').is_visible();layout(page)
    page.screenshot(path=f'/tmp/v180-{name}-{width}-{motion}.png')
    after=state(page)
    for field in ['rng','cash','personalCash','history']:assert before[field]==after[field],field
    page.reload();page.locator('#titleResume').click();assert page.locator('#outcomeScene').is_visible()
    assert state(page)['history']==before['history']
    drain(page);assert '社会情勢' in page.locator('#resultFactors').inner_text();page.locator('#reportContinue').click();assert state(page)['presentation'] is None
    # Deterministic pending-accident save. Reload cannot bypass mandatory response.
    page.evaluate('''()=>{const G=GameEngine;for(let seed=1;seed<2000;seed++){let s=G.play(G.initial(seed),'quality');if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0){s.presentation={week:1,stage:'news',newsIndex:0};localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));return;}}throw Error('no accident fixture');}''')
    page.reload();page.locator('#titleResume').click();drain(page)
    assert state(page)['lastResult']['accidentResponse']=='ignore'
    assert not errors,errors
    print('PASS refinement',name,width,motion,flush=True);c.close()
  browser.close()
server.shutdown()
