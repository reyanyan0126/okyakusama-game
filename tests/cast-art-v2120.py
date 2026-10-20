"""v2.12 complete named main-cast portrait integration in the actual game."""
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
    errs=[];page.on('pageerror',lambda error:errs.append(str(error)))
    resp=page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='networkidle',timeout=30000)
    assert resp.status==200
    page.wait_for_function("window.CastArtV2120 && document.querySelectorAll('use[data-cast-v2120]').length >= 5",timeout=15000)
    # Portraits in the actual game: opening, office visitors, 5-person story cast.
    for selector in ['#prologuePaintedPerson use','#bossFace use',
                     '#castGalleryV220 .cast-v220-you use',
                     '#castGalleryV220 .cast-v220-boss use',
                     '#castGalleryV220 .cast-v220-manager use',
                     '#castGalleryV220 .cast-v220-worker use',
                     '#castGalleryV220 .cast-v220-customer use']:
     assert page.locator(selector).count()==1,(engine,width,selector)
     assert page.locator(selector).evaluate("(u)=>u.nextElementSibling?.localName==='image' && u.nextElementSibling.getAttribute('href')?.startsWith('data:image/webp;base64,')"),(engine,width,selector)
    # Dynamic manga and emotion swaps must continue to display raster art.
    result=page.evaluate("""() => {
      const target=document.createElement('div');target.id='qa-manga';document.body.append(target);
      target.innerHTML=window.MangaCinema.markup('shop',[
        '社長「困りました」','店長「助かりました」','従業員「怒っています」'
      ],{all:true});
      return target.querySelectorAll('use[href]').length;
    }""")
    assert result==3,(engine,width,result)
    page.wait_for_function("document.querySelectorAll('#qa-manga use[data-cast-v2120]').length === 3")
    mood=page.locator('#castGalleryV220 .cast-v220-you use')
    mood.evaluate("(u)=>u.setAttribute('href','./assets/manga-cast-v200.svg#manga-you-angry')")
    page.wait_for_function("""() => {
      const u=document.querySelector('#castGalleryV220 .cast-v220-you use');
      return u.dataset.castV2120==='you-angry' && u.nextElementSibling?.getAttribute('data-cast-v2120')==='you-angry';
    }""")
    assert not errs,(engine,width,errs)
    print('PASS in-game portrait renderer',engine,width,flush=True)
    ctx.close()
   browser.close()
finally:
 server.shutdown()
