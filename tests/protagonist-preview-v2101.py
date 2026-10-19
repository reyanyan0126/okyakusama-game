"""v2.10.1 self-contained protagonist preview on smartphone-sized browsers."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  for engine in ('chromium','webkit'):
   browser=getattr(p,engine).launch(headless=True)
   for width in (320,390,430):
    ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    response=page.goto(f'http://127.0.0.1:{server.server_port}/protagonist-preview-v2101.html',wait_until='networkidle')
    assert response.status==200
    assert page.locator('figure img').count()==5
    page.wait_for_function('Array.from(document.images).every(im => im.complete && im.naturalWidth === 1024 && im.naturalHeight === 1280)')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (engine,width,'overflow')
    assert page.get_by_text('制作候補のプレビュー').count()==1
    assert not errors, (engine,width,errors)
    print('PASS original protagonist preview',engine,width,flush=True)
    ctx.close()
   browser.close()
finally:
 server.shutdown()
