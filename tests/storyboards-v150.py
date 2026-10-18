"""v1.5.0: verify external illustrated SVG asset rendering and real storyboard steps."""
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
import os
r=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(r)))
Thread(target=srv.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{srv.server_port}'
with sync_playwright() as p:
 for name in os.environ.get('STORYBOARD_BROWSERS','chromium,webkit').split(','):
  browser=getattr(p,name).launch(headless=True)
  for width in [375,390,430]:
   c=browser.new_context(viewport={'width':width,'height':844},reduced_motion='no-preference')
   page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='networkidle')
   # XML must parse; SVG symbols must load as actual artwork, not empty references.
   svgtest=page.evaluate("""async()=>{
    const res=await fetch('./assets/storyboards-v150.svg');
    const content=await res.text();
    const svg=new DOMParser().parseFromString(content,'image/svg+xml');
    return {status:res.status,parseErrors:svg.querySelectorAll('parsererror').length,symbols:svg.querySelectorAll('symbol').length};
   }""")
   assert svgtest=={'status':200,'parseErrors':0,'symbols':48},svgtest
   page.locator('#titleStart').click()
   page.locator('#acceptMarket').click()
   page.locator('#prologueSkip').click()
   page.locator('#firstWeekStart').click()
   # Deterministic first week, then register episode in week 2.
   page.evaluate("""()=>{
    const G=GameEngine;const s=G.play(G.initial(447),'quality');
    localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
   }""")
   page.reload();page.locator('#titleResume').click()
   page.locator('#openProposals').click()
   card=page.locator('.action-option[data-id="arc_register_boss"]')
   assert card.count()==1
   assert '#cinema-arc_register_boss-work-1' in card.locator('svg use').get_attribute('href')
   card.click();page.locator('#advanceButton').click()
   def artref():
    use=page.locator('#workingComic .storyboard-panel use')
    return use.get_attribute('href') if use.count() else ''
   assert artref().endswith('#cinema-arc_register_boss-work-0'),artref()
   page.wait_for_timeout(1280)
   assert artref().endswith('#cinema-arc_register_boss-work-1'),artref()
   page.wait_for_timeout(1220)
   assert artref().endswith('#cinema-arc_register_boss-work-2'),artref()
   bbox=page.evaluate("""()=>{const n=document.querySelector('#workingComic .storyboard-panel use');try {return n.getBBox().width} catch(e){return -1}}""")
   assert bbox>0,(name,width,'external SVG use did not render',bbox)
   page.locator('#workingSkip').click()
   page.locator('#outcomeScene').wait_for(state='visible',timeout=5000)
   state=page.evaluate("JSON.parse(localStorage.getItem('okyakusama.save.v1'))")
   tier=state['lastResult']['performanceTier']
   assert page.locator('#outcomeArt .storyboard-panel use').get_attribute('href').endswith('#cinema-arc_register_boss-'+tier)
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),(name,width)
   assert not errors,errors
   print('PASS v1.5.0 storyboards',name,width,tier,flush=True)
   c.close()
  browser.close()
srv.shutdown()
