"""Mobile Chromium/WebKit smoke: settled financial trend charts and old-history gaps."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)
try:
 with sync_playwright() as p:
  for browser_name in ('chromium','webkit'):
   browser=getattr(p,browser_name).launch(headless=True)
   for width in (320,390):
    context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url)
    page.evaluate("""()=>{
     const G=GameEngine;let s=G.initial(42);
     for(let i=0;i<2;i++){
      const a=G.weeklyOffers(s)[0];
      s=G.play(s,a.id);
      if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
      if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
     }
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    saved=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.reload()
    page.locator('#titleResume').click()
    page.locator('#openStatusSheet').click()
    assert page.locator('#statusContent .trend-svg').count()==4
    assert '店舗現金' in page.locator('#statusContent .trend-section').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert page.evaluate("document.querySelector('#statusContent').scrollWidth<=document.querySelector('#statusContent').clientWidth+1")
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==saved
    page.locator('#statusDone').click()
    page.evaluate("""()=>{
     let s=JSON.parse(localStorage.getItem('okyakusama.save.v1'));
     for(const h of s.history)delete h.personalCashAfter;
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    page.reload()
    page.locator('#titleResume').click()
    page.locator('#openStatusSheet').click()
    assert page.locator('#statusContent .trend-svg').count()==3
    assert 'この指標の記録はありません' in page.locator('#statusContent .trend-section').inner_text()
    assert not errors,errors
    print('PASS trend',browser_name,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
