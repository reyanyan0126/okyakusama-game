"""Verify that external SVG scene symbols actually paint embedded WebP cast on Chromium/WebKit.
A symbol-reference existing is not enough: compare rendered pixels with bitmap references blanked.
"""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from hashlib import sha256
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0), partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
CASES=[('prologue-v160.svg','prologue-1'),
       ('office-cinema-v171.svg','office-normal'),
       ('incidents-v160.svg','incident-absent'),
       ('policies-v160.svg','policy-raise-work-0'),
       ('episode-cinema-v170.svg','cinema-arc_register_boss-work-0'),
       ('storyboards-v150.svg','register-work-0'),
       ('root-cinema-v170.svg','repair-fix_fans-great')]
def capture(browser,path,symbol,blank):
 ctx=browser.new_context(viewport={'width':750,'height':460},device_scale_factor=1,reduced_motion='reduce')
 page=ctx.new_page()
 failures=[]
 page.on('pageerror',lambda e: failures.append(str(e)))
 if blank:
  def replace(route):
   response=route.fetch()
   body=response.body().decode('utf-8')
   stripped=re.sub(r'href="data:image/webp;base64,[^"]+"','href=""',body)
   route.fulfill(response=response,body=stripped)
  page.route('**/assets/'+path,replace)
 page.goto('http://127.0.0.1:'+str(server.server_port)+'/index.html',wait_until='domcontentloaded')
 page.evaluate("""([path,symbol])=>{
  document.body.replaceChildren();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 720 420');
  svg.style.width='720px'; svg.style.height='420px';
  const use=document.createElementNS(svg.namespaceURI,'use');
  use.setAttribute('href','./assets/'+path+'#'+symbol);
  svg.append(use);document.body.append(svg);
 }""",[path,symbol])
 page.wait_for_timeout(500)
 png=page.locator('svg').screenshot(timeout=15000)
 assert not failures,(path,failures)
 ctx.close()
 return sha256(png).hexdigest()
try:
 with sync_playwright() as p:
  for engine in ('chromium','webkit'):
   browser=getattr(p,engine).launch(headless=True)
   for path,symbol in CASES:
    full=capture(browser,path,symbol,False)
    empty=capture(browser,path,symbol,True)
    assert full!=empty,(engine,path,symbol,'embedded portrait did not change the rendered image')
    print('PASS WebP visibly renders inside external SVG symbol',engine,path,symbol,flush=True)
   browser.close()
finally:
 server.shutdown()
