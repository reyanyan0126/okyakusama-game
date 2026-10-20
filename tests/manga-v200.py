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
       symbols:svg.querySelectorAll('symbol[id^="manga-"]').length};
     }""")
     assert external=={'status':200,'errors':0,'symbols':15},(browser_name,width,external)
     painted=page.evaluate("""async()=>{const r=await fetch('./assets/manga-painted-cast-v173.webp');return {status:r.status,size:(await r.arrayBuffer()).byteLength}}""")
     assert painted['status']==200 and painted['size']>4000,(browser_name,width,painted)
     # Each surface has its own illustrated scene, not a repeated protagonist bitmap.
     assert page.locator('#titleScreen .scene-v211-cover').is_visible()
     assert page.locator('#titleScreen .scene-v211-cover svg').count()==1
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#titleScreen').screenshot(path=str(visuals/'v211-title-390.png'))
     page.locator('#titleStart').click()
     assert page.locator('#contractsScreen .scene-v211-contract').is_visible()
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#contractsScreen').screenshot(path=str(visuals/'v211-contract-390.png'))
     page.locator('#acceptMarket').click()
     assert page.locator('#prologuePainting .v211-story-item use').count()==1
     page.locator('#prologueNext').click()
     assert page.locator('#prologuePainting .v211-story-item use').get_attribute('href')=='#art-home'
     page.locator('#prologueSkip').click()
     page.locator('#firstWeekStart').click()
     assert page.locator('#officeView .scene-v211-office').is_visible()
     assert page.locator('#officeView .new-office-person').count()==0
     # Check both sheets and all three main tabs in real Chromium/WebKit.
     page.locator('#openStatusSheet').click()
     assert page.locator('#statusSheet .scene-v211-status').is_visible()
     page.locator('#statusClose').click()
     page.locator('#officeStoreMoney').click()
     assert page.locator('#moneySheet .scene-v211-money').is_visible()
     page.locator('#moneyClose').click()
     page.locator('.game-tab[data-screen="voice"]').click()
     assert page.locator('#voiceView .scene-v211-voice').is_visible()
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#voiceView').screenshot(path=str(visuals/'v211-voice-390.png'))
     page.locator('.game-tab[data-screen="records"]').click()
     assert page.locator('#recordsView .scene-v211-records').is_visible()
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#recordsView').screenshot(path=str(visuals/'v211-records-390.png'))
     page.locator('.game-tab[data-screen="office"]').click()
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#officeView').screenshot(path=str(visuals/'office-390.png'))
     page.locator('#openProposals').click()
     assert page.locator('#proposalSheet .scene-v211-decision').is_visible()
     page.locator('#advanceButton').click()
     before=page.evaluate("""()=>{
       const s=JSON.parse(localStorage.getItem('okyakusama.save.v1'));
       return {week:s.week,history:s.history,rng:s.rng,store:s.cash,personal:s.personalCash};
     }""")
     assert before['week']==2
     assert page.locator('#workingComic .manga-panel').count()==3
     assert page.locator('#workingComic .manga-illustrated-person use').count()==3
     assert page.locator('#workingComic .manga-illustrated-person use').evaluate_all("els=>els.every(e=>(e.getAttribute('href')||'').includes('.svg#'))")
     assert page.locator('#workingComic .cast .arm').count()==0
     assert page.locator('#workingComic .portrait-hair').count()==0
     assert page.locator('#workingComic .manga-dialogue').count()==3
     # v2.6: animate only the finished illustration, never independent limbs or hair.
     result=page.evaluate("""()=>{
       const svg=document.querySelector('#workingComic .manga-panel.is-revealed .manga-illustrated-person');
       if(!svg)return {intact:false,anim:'missing'};
       return {intact:svg.querySelectorAll('use').length===1 && svg.querySelectorAll('.arm,.hair,.face').length===0,
         anim:getComputedStyle(svg).animationName};
     }""")
     assert result['intact'],(browser_name,width,'single intact complete SVG')
     if motion=='reduce':
      assert result['anim']=='none',(browser_name,width,'reduced motion must disable movement')
     else:
      assert result['anim'].startswith('cast-v260-'),(browser_name,width,result['anim'])
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
     # DOM classes change before the staggered animation completes. Validate pixels-visible
     # state instead of mistaking 3 pre-animation nodes for 3 rendered comic frames.
     page.wait_for_function("""()=>{
       const frames=[...document.querySelectorAll('#outcomeArt .manga-panel')];
       return frames.length===3&&frames.every(frame=>{
        const c=getComputedStyle(frame),box=frame.getBoundingClientRect();
        return c.visibility==='visible'&&Number(c.opacity)>=0.95&&box.width>80&&box.height>70;
       });
     }""",timeout=3500)
     if browser_name=='chromium' and width==390 and motion=='no-preference':
      page.locator('#outcomeArt').screenshot(path=str(visuals/'manga-result-390.png'))
     assert page.locator('#outcomeArt .manga-illustrated-person use').count()==3
     page.locator('#outcomeDetailsToggle').click()
     assert page.locator('#outcomeDetailsToggle').get_attribute('aria-expanded')=='true'
     assert page.locator('#outcomeOdds').is_visible()
     page.locator('#outcomeDetailsToggle').click()
     assert page.locator('#outcomeDetailsToggle').get_attribute('aria-expanded')=='false'
     assert not page.locator('#outcomeOdds').is_visible()
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
