"""v2.10 public character gallery: render existing art and verify touch at narrow widths."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from functools import partial
from pathlib import Path
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
    context=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=context.new_page()
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto(f'http://127.0.0.1:{server.server_port}/cast-gallery-v2100.html',wait_until='networkidle')
    assert page.locator('.cast-button').count()==5
    assert page.locator('.mood-picks button').count()==5
    assert page.locator('#castPortrait use').get_attribute('href').endswith('#manga-you-normal')
    page.locator('.cast-button[data-id="manager"]').click()
    assert page.locator('#castName').inner_text()=='店長'
    page.locator('.mood-picks button[data-mood="angry"]').click()
    assert page.locator('#castPortrait use').get_attribute('href').endswith('#portrait-manager-angry')
    assert page.locator('#moodStatus').inner_text()=='怒り'
    assert page.locator('.cast-button[data-id="manager"]').get_attribute('aria-pressed')=='true'
    assert page.locator('.mood-picks button[data-mood="angry"]').get_attribute('aria-pressed')=='true'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'overflow')
    assert page.locator('.mood-picks button').first.evaluate('(el)=>el.getBoundingClientRect().height')>=44
    assert not errors,(engine,width,errors)
    print('PASS gallery',engine,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
