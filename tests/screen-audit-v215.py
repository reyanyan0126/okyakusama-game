"""v2.15 screen inventory and layout snapshots, browser-level phase 1 audit."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
artifacts=root/'test-artifacts'
artifacts.mkdir(exist_ok=True)
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
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='domcontentloaded')
    assert page.locator('#titleScreen').is_visible(),(engine,width,'title')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(engine,width,'title overflow')
    page.screenshot(path=str(artifacts/f'v215-title-{engine}-{width}.png'))
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    assert page.locator('#prologueScreen').is_visible(),(engine,width,'prologue')
    page.screenshot(path=str(artifacts/f'v215-prologue-{engine}-{width}.png'))
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    page.locator('#officeView').wait_for(state='visible')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(engine,width,'home overflow')
    page.screenshot(path=str(artifacts/f'v215-home-{engine}-{width}.png'))
    page.locator('#openProposals').click()
    assert page.locator('#proposalSheet').is_visible(),(engine,width,'proposals')
    page.screenshot(path=str(artifacts/f'v215-proposals-{engine}-{width}.png'))
    assert not errors,(engine,width,errors)
    print('PASS v2.15 screen audit',engine,width,flush=True)
    ctx.close()
   browser.close()
finally:
 server.shutdown()
