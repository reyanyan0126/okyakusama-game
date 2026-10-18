"""v2 manga: 3 whole-portrait panels, frame animation, reduced motion, mobile layout and save purity."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
visuals=root/'test-artifacts'
visuals.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)
try:
 with sync_playwright() as p:
  for browser_name in ('chromium','webkit'):
   browser=getattr(p,browser_name).launch(headless=True)
   for width in (320,375,390,430):
    for motion in ('no-preference','reduce'):
     context=browser.new_context(viewport={'width':width,'height':844},reduced_motion=motion)
     page=context.new_page()
     errors=[]
     page.on('pageerror',lambda e:errors.append(str(e)))
     page.goto(url,wait_until='networkidle')
     external=page.evaluate("""async()=>{
      const response=await fetch('./assets/manga-cast-v200.svg');
      const svg=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
      return {status:response.status,errors:svg.querySelectorAll('parsererror').length,
       symbols:svg.querySelectorAll('symbol').length};
     }""")
     assert external=={'status':200,'errors':0,'symbols':15},(browser_name,width,external)
     page.locator('#titleStart').click()
     page.locator('#acceptMarket').click()
     page.locator('#prologueSkip').click()
     page.locator('#firstWeekStart').click()
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#officeView').screenshot(path=str(visuals/'office-390.png'))
     page.locator('#openProposals').click()
     page.locator('#advanceButton').click()
     before=page.evaluate("""()=>{
       const s=JSON.parse(localStorage.getItem('okyakusama.save.v1'));
       return {week:s.week,history:s.history,rng:s.rng,store:s.cash,personal:s.personalCash};
     }""")
     assert before['week']==2
     assert page.locator('#workingComic .manga-panel').count()==3
     assert page.locator('#workingComic .manga-picture use').count()==3
     assert page.locator('#workingComic .cast .arm').count()==0
     assert page.locator('#workingComic .portrait-hair').count()==0
     assert page.locator('#workingComic .manga-dialogue').count()==3
     assert page.evaluate("""()=>{
       const svg=document.querySelector('#workingComic .manga-picture use');
       return svg && getComputedStyle(svg).animationName==='none' &&
          getComputedStyle(svg).transform==='none';
     }"""),'person parts must not be CSS-animated'
     if motion=='reduce':
      assert page.locator('#workingComic .manga-panel.is-revealed').count()==3,'reduced motion shows all three panels immediately'
     else:
      assert page.locator('#workingComic .manga-panel.is-revealed').count()>=1
      assert page.evaluate("""()=>{
       const panel=document.querySelector('#workingComic .manga-panel.is-revealed');
       return getComputedStyle(panel).animationName==='manga-panel-enter';
      }"""),'whole-panel animation is required'
      page.wait_for_timeout(1250)
      assert page.locator('#workingComic .manga-panel.is-revealed').count()>=2
      page.wait_for_timeout(1250)
      assert page.locator('#workingComic .manga-panel.is-revealed').count()==3
      if browser_name=='chromium' and width==390:
       page.locator('#workingComic').screenshot(path=str(visuals/'manga-three-panels-390.png'))
     # Use the public click handler synchronously; automatic scene advance can race a Playwright locator click.
     page.evaluate("document.getElementById('workingSkip').click()")
     page.locator('#outcomeScene').wait_for(state='visible',timeout=6000)
     assert page.locator('#outcomeArt .manga-panel.is-revealed').count()==3
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#outcomeArt').screenshot(path=str(visuals/'manga-result-390.png'))
     assert page.locator('#outcomeArt .manga-picture use').count()==3
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     assert page.locator('#outcomeArt').bounding_box()['width']<=width+1
     after=page.evaluate("""()=>{
       const s=JSON.parse(localStorage.getItem('okyakusama.save.v1'));
       return {week:s.week,history:s.history,rng:s.rng,store:s.cash,personal:s.personalCash};
     }""")
     assert after==before,'manga animation and theater navigation must not change financial state'
     assert not errors,errors
     print('PASS 3-panel manga',browser_name,width,motion,flush=True)
     context.close()
   browser.close()
finally:
 server.shutdown()
