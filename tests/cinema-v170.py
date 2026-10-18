"""v1.7.0: 24 story choices use original six-stage art; never loop indefinitely."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright

r=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(r)))
Thread(target=srv.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{srv.server_port}'
with sync_playwright() as p:
 for browser_name in ['chromium','webkit']:
  browser=getattr(p,browser_name).launch(headless=True)
  for width in [375,390,430]:
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='no-preference')
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='networkidle')
   info=page.evaluate("""async()=>{
    const url='./assets/episode-cinema-v170.svg';
    const response=await fetch(url);const content=await response.text();
    const doc=new DOMParser().parseFromString(content,'image/svg+xml');
    return {status:response.status,errors:doc.querySelectorAll('parsererror').length,symbols:doc.querySelectorAll('symbol').length};
   }""")
   assert info=={'status':200,'errors':0,'symbols':144},info
   count=page.evaluate("""()=>{
    const ids=GameEngine.STORIES.EPISODES.flatMap(e=>e.choices.map(a=>a.id));
    return {count:ids.length,refs:ids.every(id=>PolicyStoryboards.symbol(id,'work',0).includes('#cinema-'+id+'-work-0')),
      families:ids.every(id=>PolicyStoryboards.family(id)===id)};
   }""")
   assert count=={'count':24,'refs':True,'families':True},count
   finite=page.evaluate("""()=>{
    const test=document.createElement('span');test.className='title-svg';document.body.append(test);
    const count=getComputedStyle(test).animationIterationCount;test.remove();
    return {count,scroll:document.documentElement.scrollWidth<=innerWidth+1};
   }""")
   assert 'infinite' not in finite['count'],finite
   assert finite['scroll'],finite
   page.locator('#titleStart').click()
   page.locator('#acceptMarket').click()
   page.locator('#prologueSkip').click()
   page.locator('#firstWeekStart').click()
   page.evaluate("""()=>{
    const s=GameEngine.play(GameEngine.initial(447),'quality');
    localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
   }""")
   page.reload();page.locator('#titleResume').click()
   page.locator('#openProposals').click()
   c=page.locator('.action-option[data-id="arc_register_pay"]')
   assert c.count()==1, 'episode choice missing'
   assert c.locator('.policy-symbol use').get_attribute('href').startswith('./assets/policy-icons-v173.svg#icon-'), 'story card now has a large legible action symbol'
   c.click()
   page.locator('#advanceButton').click()
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
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert not errors,errors
   print('PASS v1.7.0 cinema',browser_name,width,tier,flush=True)
   context.close()
  browser.close()
srv.shutdown()
