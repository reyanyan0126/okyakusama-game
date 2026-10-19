"""v2.2 cast gallery: real Chromium/WebKit touch interaction and mobile layout."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
art=root/'test-artifacts';art.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=srv.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  for engine in ('chromium','webkit'):
   browser=getattr(p,engine).launch(headless=True)
   for width in (320,390,430):
    context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',has_touch=True,is_mobile=True)
    page=context.new_page();errors=[];page.on('pageerror',lambda ex:errors.append(str(ex)))
    page.goto('http://127.0.0.1:'+str(srv.server_port),wait_until='networkidle')
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    saved_before=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.locator('.game-tab[data-screen="voice"]').click()
    gallery=page.locator('#castGalleryV220')
    assert gallery.is_visible()
    assert not gallery.get_attribute('open'),'gallery starts collapsed'
    page.locator('#castGalleryV220 > summary').click()
    assert gallery.get_attribute('open') is not None
    assert page.locator('.cast-v220-card').count()==5
    hrefs=page.locator('.cast-v220-portrait use').evaluate_all("els=>els.map(e=>e.getAttribute('href'))")
    assert len(set(hrefs))==5 and all('.svg#' in h for h in hrefs),(engine,width,hrefs)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'overflow')
    assert page.evaluate("getComputedStyle(document.querySelector('.cast-v220-portrait')).animationName==='none'")
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==saved_before
    if engine=='chromium' and width==390:gallery.screenshot(path=str(art/'cast-gallery-390.png'))
    page.locator('#castGalleryV220 > summary').click()
    assert not gallery.get_attribute('open')
    assert not errors,(engine,width,errors)
    print('PASS v2.2 cast',engine,width,flush=True)
    context.close()
   browser.close()
finally:
 srv.shutdown()
