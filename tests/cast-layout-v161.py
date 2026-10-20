"""v1.6.1 verifies mobile skip control is below the entire illustrated story and can be tapped."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
class Silent(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Silent,directory=str(r)))
Thread(target=srv.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{srv.server_port}'
with sync_playwright() as p:
 for browser_name in ['chromium','webkit']:
  browser=getattr(p,browser_name).launch(headless=True)
  for width,height in [(320,568),(375,667),(390,844),(430,932)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
   page=context.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
   page.goto(url,wait_until='networkidle')
   parse=page.evaluate("""async()=>{
     const names=['policies-v160.svg','storyboards-v150.svg'];
     const out=[];
     for(const name of names){
      const response=await fetch('./assets/'+name);
      const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
      out.push([response.status,parsed.querySelectorAll('parsererror').length,parsed.querySelectorAll('[data-modern-portrait-v213]').length]);
     }return out;
   }""")
   assert parse==[[200,0,333],[200,0,96]],(browser_name,width,parse)
   page.locator('#titleStart').click()
   page.locator('#acceptMarket').click()
   page.locator('#prologueSkip').click()
   page.locator('#firstWeekStart').click()
   page.locator('#openProposals').click()
   page.locator('#advanceButton').click()
   page.locator('#workingScene').wait_for(state='visible')
   skip=page.locator('#workingSkip');skip.scroll_into_view_if_needed(timeout=1500)
   geometry=page.evaluate("""()=>{
    const read=id=>{const el=document.querySelector(id),b=el.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right};};
    const art=read('#workingComic'),message=read('#workingMessage'),bar=read('#workingScene .work-progress'),button=read('#workingSkip'),footer=read('#workingScene .work-footer');
    return {art,message,bar,button,footer,outer:document.documentElement.scrollWidth,inner:innerWidth,
            scrollbar:document.querySelector('#workingScene').scrollHeight>document.querySelector('#workingScene').clientHeight};
   }""")
   assert geometry['bar']['top']>=geometry['message']['bottom']+6,(browser_name,width,'progress overlap',geometry)
   assert geometry['button']['top']>=geometry['bar']['bottom']+12,(browser_name,width,'skip overlap',geometry)
   assert geometry['button']['top']>=geometry['art']['bottom']+8,(browser_name,width,'art overlap',geometry)
   assert geometry['button']['left']>=-1 and geometry['button']['right']<=width+1,(browser_name,width,'button clipped',geometry)
   assert geometry['outer']<=width+1,(browser_name,width,'horizontal overflow',geometry)
   skip.click(timeout=3000)
   assert page.locator('#outcomeScene').is_visible(),'the tap must advance directly to the result'
   assert not errors,(browser_name,width,errors)
   print('PASS v1.6.1 mobile footer and art',browser_name,width,height,flush=True)
   context.close()
  browser.close()
srv.shutdown()
