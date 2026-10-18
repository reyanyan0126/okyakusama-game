"""v1.7.3: actual painted pictures and large policy icons in mobile Chrome/WebKit."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
ARTIFACTS=ROOT/'test-artifacts'
ARTIFACTS.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)
try:
 with sync_playwright() as p:
  for browser_name in ('chromium','webkit'):
   browser=getattr(p,browser_name).launch(headless=True)
   for width in (320,375,390,430):
    ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda x:errors.append(str(x)))
    page.goto(url,wait_until='networkidle')
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    picture=page.locator('#prologuePaintedPerson')
    assert picture.is_visible()
    seen=set()
    for n in range(7):
     assert page.locator('#prologueCounter').inner_text()==f'{n+1:02d} / 07'
     page.wait_for_function("""()=>{const img=document.querySelector('#prologuePaintedPerson');return img&&img.complete&&img.naturalWidth>0;}""",timeout=8000)
     loaded=page.evaluate("""()=>({
      name:document.querySelector('#prologuePaintedPerson').src.split('/').pop(),
      okay:document.querySelector('#prologuePaintedPerson').complete&&document.querySelector('#prologuePaintedPerson').naturalWidth>0,
      hiddenLegacy:getComputedStyle(document.querySelector('.prologue-art-v160')).opacity==='0',
      w:document.querySelector('#prologuePaintedPerson').getBoundingClientRect().width
     })""")
     assert loaded['okay'] and loaded['hiddenLegacy'],loaded
     assert loaded['w']>=95,(browser_name,width,loaded)
     seen.add(loaded['name'])
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     if browser_name=='chromium' and width==390 and n==0:
      page.locator('#prologueIllustration').screenshot(path=str(ARTIFACTS/'prologue-illustrated-390.png'))
     if n<6:page.locator('#prologueNext').click()
    assert len(seen)==3,seen
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    page.locator('#openProposals').click()
    cards=page.locator('#actions .action-option')
    assert cards.count()==4
    icons=page.locator('#actions .policy-symbol')
    assert icons.count()==4
    keys=icons.evaluate_all("""els=>els.map(x=>x.querySelector('use')?.getAttribute('href')||'')""")
    assert all(x.startswith('./assets/policy-icons-v173.svg#icon-') for x in keys),keys
    boxes=icons.evaluate_all("""els=>els.map(x=>({
      width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height
    }))""")
    assert all(x['width']>=55 and x['height']>=55 for x in boxes),(browser_name,width,boxes)
    cols=page.locator('#actions').evaluate("""el=>getComputedStyle(el).gridTemplateColumns""")
    assert len(cols.split())==2,(browser_name,width,cols)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    if browser_name=='chromium' and width==390:
     page.locator('#actions').screenshot(path=str(ARTIFACTS/'policy-pictograms-390.png'))
    assert not errors,errors
    print('PASS illustrated prologue / decision pictograms',browser_name,width,flush=True)
    ctx.close()
   browser.close()
finally:
 server.shutdown()
