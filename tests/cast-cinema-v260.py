"""v2.6 five emotions on five actors, full-portrait animation and mobile accessibility."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
shots=root/'test-artifacts';shots.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)
try:
 with sync_playwright() as p:
  for engine in ('chromium','webkit'):
   b=getattr(p,engine).launch(headless=True)
   for width in (320,390,430):
    ctx=b.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',is_mobile=True,has_touch=True)
    page=ctx.new_page();errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
    page.goto(url,wait_until='networkidle')
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    start=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.locator('.game-tab[data-screen="voice"]').click()
    page.locator('#castGalleryV220 > summary').click()
    cards=page.locator('#castGalleryV220 .cast-v220-card')
    assert cards.count()==5,(engine,width,'characters')
    for role in ['you','boss','manager','worker','customer']:
     card=page.locator('.cast-v220-'+role)
     assert card.locator('.cast-v260-mood').count()==5
     for mood in ['happy','angry','sad','panic','normal']:
      button=card.locator('.cast-v260-mood[data-mood="'+mood+'"]')
      assert button.evaluate('(e)=>e.getBoundingClientRect().height')>=44
      button.click()
      assert button.get_attribute('aria-pressed')=='true'
      image=card.locator('svg.cast-v220-portrait')
      assert image.locator('use').get_attribute('href').endswith('-'+mood)
      assert image.get_attribute('aria-label')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'horizontal overflow')
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==start,(engine,width,'save mutation')
    assert page.evaluate("getComputedStyle(document.querySelector('.cast-v220-portrait')).animationName")=='none'
    if engine=='chromium' and width==390:page.locator('#castGalleryV220').screenshot(path=str(shots/'v260-25-expressions-gallery-390.png'))
    manga=page.evaluate("""()=>{
      const host=document.createElement('div');host.id='v260TestManga';
      host.innerHTML=MangaCinema.markup('quality',['店長「ありがとう！」','従業員「困ったな」','常連「残念ね」'],{setting:'shop',all:true});
      document.body.append(host);
      return [...host.querySelectorAll('.manga-panel')].map(e=>({role:e.dataset.role,mood:e.dataset.mood,setting:e.dataset.setting}));
    }""")
    assert manga==[{'role':'manager','mood':'happy','setting':'shop'},{'role':'worker','mood':'panic','setting':'shop'},{'role':'customer','mood':'sad','setting':'shop'}],(engine,width,manga)
    assert not errors,(engine,width,errors)
    print('PASS v2.6',engine,width,flush=True)
    ctx.close()
   b.close()
finally:
 server.shutdown()
