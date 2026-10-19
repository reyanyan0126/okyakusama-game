"""v1.7.1: mobile Chromium/WebKit validate office illustration + resident portraits."""
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=srv.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{srv.server_port}'
with sync_playwright() as p:
 for engine in ['chromium','webkit']:
  browser=getattr(p,engine).launch(headless=True)
  for width in [375,390,430]:
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='networkidle')
   info=page.evaluate("""async()=>{
    const out=[];
    for(const [file,count] of [['office-cinema-v171.svg',10],['portraits-v171.svg',25]]){
     const resp=await fetch('./assets/'+file),doc=new DOMParser().parseFromString(await resp.text(),'image/svg+xml');
     out.push([resp.status,doc.querySelectorAll('parsererror').length,doc.querySelectorAll('symbol').length,count]);
    }
    return out;
   }""")
   assert info==[[200,0,10,10],[200,0,25,25]],(engine,width,info)
   # v2.1.1 replaces the generic bitmap cover with a unique resolution-independent scene.
   title=page.locator('#titleScreen .scene-v211-cover svg')
   assert title.is_visible()
   assert title.get_attribute('viewBox')=='0 0 720 350'
   assert title.locator('use[href*="manga-cast-v200.svg"]').count()==1
   page.locator('#titleStart').click()
   page.locator('#acceptMarket').click()
   page.locator('#prologueSkip').click()
   page.locator('#firstWeekStart').click()
   art=page.locator('#officeView .office-room-art use')
   assert art.count()==1
   assert art.get_attribute('href').startswith('./assets/office-cinema-v171.svg#office-')
   assert page.evaluate("document.querySelector('#officeView .office-room-art use').getBBox().width")>0
   assert page.locator('#bossFace use').get_attribute('href').endswith('#portrait-manager-normal') or page.locator('#bossFace use').get_attribute('href').startswith('./assets/portraits-v171.svg#portrait-manager-')
   assert page.locator('#buyerFace use').get_attribute('href').startswith('./assets/portraits-v171.svg#portrait-mori-')
   assert page.locator('#buyerPersona').inner_text()=='森さん'
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(engine,width,'overflow')
   assert not errors,(engine,width,errors)
   print('PASS v1.7.1 office and portraits',engine,width,flush=True)
   context.close()
  browser.close()
srv.shutdown()
