"""v2.14 home UX: compact iPhone-sized layout, CTA, financial drilldown and optional metrics."""
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
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    resp=page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='domcontentloaded')
    assert resp.status==200
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    page.locator('#officeView').wait_for(state='visible')
    assert page.locator('#officeView .office-visitors .cast-avatar').count()==3
    assert page.locator('#openProposals').is_visible()
    assert page.locator('#openStatusSheet').is_visible()
    details=page.locator('#homeMetrics')
    assert details.locator(':scope > summary').count()==1
    assert not details.evaluate('(d)=>d.open')
    assert not page.locator('#dashSales').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(engine,width,'overflow')
    assert page.locator('#openProposals').bounding_box()['y'] < page.locator('#actionHeading').bounding_box()['y'],(engine,width,'cta priority')
    page.locator('#homeMetrics > summary').click()
    assert page.locator('#dashSales').is_visible()
    assert page.locator('#dashSat').is_visible()
    page.locator('#homeMetrics > summary').click()
    page.locator('#openStatusSheet').click()
    assert page.locator('#statusSheet').is_visible()
    page.locator('#statusDone').click()
    page.locator('#openProposals').click()
    assert page.locator('.action-option').count()==4
    assert not errors,(engine,width,errors)
    print('PASS v2.14 compact home',engine,width,flush=True)
    ctx.close()
   browser.close()
finally:
 server.shutdown()
