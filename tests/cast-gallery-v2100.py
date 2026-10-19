"""v2.11 cast portraits: all five new images, five protagonist moods and touch layout."""
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
    assert page.locator('.cast-thumb img.illustrated-portrait').count()==5
    assert page.locator('#castPortrait').evaluate('(e)=>e.tagName')=='IMG'
    assert page.locator('#castPortrait').evaluate('(e)=>e.complete && e.naturalWidth===1024'),(engine,width,'hero image')
    hero_normal=page.locator('#castPortrait').get_attribute('src')
    page.locator('.mood-picks button[data-mood="angry"]').click()
    hero_angry=page.locator('#castPortrait').get_attribute('src')
    assert hero_angry!=hero_normal and hero_angry.startswith('data:image/webp;base64,')
    assert page.locator('#moodStatus').inner_text()=='怒り'
    for actor in ('boss','manager','worker','customer'):
     page.locator(f'.cast-button[data-id="{actor}"]').click()
     assert page.locator('#castPortrait').evaluate('(e)=>e.tagName')=='IMG'
     assert page.locator('#castPortrait').evaluate('(e)=>e.complete && e.naturalWidth===512'),(engine,width,actor)
     assert page.locator('.mood-picks button[data-mood="angry"]').is_disabled()
     assert page.locator('.cast-button[data-id="'+actor+'"]').get_attribute('aria-pressed')=='true'
    page.locator('.cast-button[data-id="you"]').click()
    assert page.locator('.mood-picks button[data-mood="angry"]').is_enabled()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'overflow')
    assert page.locator('.mood-picks button').first.evaluate('(el)=>el.getBoundingClientRect().height')>=44
    assert not errors,(engine,width,errors)
    print('PASS gallery',engine,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
