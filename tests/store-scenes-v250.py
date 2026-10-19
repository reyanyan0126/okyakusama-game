"""v2.5 scenes: loaded external SVG and four observable states in Chromium/WebKit."""
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
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
    loaded=page.evaluate("""async()=>{
     const r=await fetch('./assets/store-scenes-v250.svg');
     const svg=new DOMParser().parseFromString(await r.text(),'image/svg+xml');
     return [r.status,svg.querySelectorAll('parsererror').length,svg.querySelectorAll('symbol[id^="scene-"]').length];
    }""")
    assert loaded==[200,0,4],(engine,width,loaded)
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    figure=page.locator('#storeWeatherV250')
    assert not figure.is_visible(),(engine,width,'optional art is collapsed to prioritize play')
    page.locator('#officeExtraMetricsV290 > summary').click()
    assert figure.is_visible()
    assert figure.get_attribute('data-scene')=='normal'
    assert page.locator('.store-weather-art-v250 use').get_attribute('href').endswith('#scene-normal')
    assert page.evaluate("document.querySelector('.store-weather-art-v250 use').getBBox().width")>0
    page.evaluate("document.getElementById('dashSat').textContent='88';document.getElementById('repCount').textContent='82'")
    page.wait_for_function("document.getElementById('storeWeatherV250').dataset.scene==='boom'")
    page.evaluate("document.getElementById('heatCount').textContent='65'")
    page.wait_for_function("document.getElementById('storeWeatherV250').dataset.scene==='fire'")
    page.evaluate("document.getElementById('heatCount').textContent='3';document.getElementById('dashSat').textContent='33'")
    page.wait_for_function("document.getElementById('storeWeatherV250').dataset.scene==='slump'")
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'overflow')
    if engine=='chromium' and width==390:figure.screenshot(path=str(art/'v250-store-slump-390.png'))
    assert not errors,(engine,width,errors)
    print('PASS v2.5 store-scenes',engine,width,flush=True)
    context.close()
   browser.close()
finally:
 srv.shutdown()
