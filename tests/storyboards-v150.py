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
   assert card.locator('.policy-symbol use').get_attribute('href').startswith('./assets/policy-icons-v173.svg#icon-'), 'the old miniature story thumbnail must be replaced by a large symbol'
   card.click();page.locator('#advanceButton').click()
   # Existing episode assets remain as a legacy resource; visible choice cards use simple icons.
   # Active theater now uses three whole-portrait manga panels, not CSS-built limbs.
   panels=page.locator('#workingComic .manga-panel')
   assert panels.count()==3,(page.locator('#workingComic').inner_html()[:400])
   assert page.locator('#workingComic .manga-panel.is-revealed').count()>=1
   assert page.locator('#workingComic .manga-panel[aria-hidden="true"]').count()<=2
   assert page.evaluate("""async()=>{
    const nodes=[...document.querySelectorAll('#workingComic .manga-painted-character image')];
    if(nodes.length!==3)return false;
    return (await Promise.all(nodes.map(async node=>{
     const href=node.getAttribute('href');
     if(!href.includes('manga-painted-cast-v173.webp'))return false;
     const image=new Image();image.src=href;
     await image.decode();
     const box=node.getBoundingClientRect();
     return image.naturalWidth>0 && image.naturalHeight>0 && box.width>0 && box.height>0;
    }))).every(Boolean);
   }"""),(name,width,'painted portraits must decode and occupy visible space')
   page.wait_for_timeout(1260)
   assert page.locator('#workingComic .manga-panel.is-revealed').count()>=2
   page.wait_for_timeout(1240)
   assert page.locator('#workingComic .manga-panel.is-revealed').count()==3
   # Use the public click handler synchronously; automatic scene advance can race a Playwright locator click.
   page.evaluate("document.getElementById('workingSkip').click()")
   page.locator('#outcomeScene').wait_for(state='visible',timeout=5000)
   assert page.locator('#outcomeArt .manga-panel').count()==3
   assert page.locator('#outcomeArt .manga-panel.is-revealed').count()==3
   tier=page.evaluate("JSON.parse(localStorage.getItem('okyakusama.save.v1')).lastResult.performanceTier")
   assert tier in ['failure','success','great']
   assert page.locator('#outcomeArt .manga-verdict').is_visible()
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),(name,width)
   assert not errors,errors
   print('PASS v1.5.0 storyboards',name,width,tier,flush=True)
   c.close()
  browser.close()
srv.shutdown()
