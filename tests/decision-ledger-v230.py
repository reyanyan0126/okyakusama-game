"""v2.3/v2.4 preview: read-only, safe mobile journal and stats across browsers."""
from pathlib import Path
from threading import Thread
from functools import partial
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
    context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',is_mobile=True,has_touch=True)
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:'+str(server.server_port),wait_until='networkidle')
    page.evaluate("""()=>{
     const G=GameEngine,s=G.play(G.initial(12345),'quality');
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    page.reload(wait_until='networkidle')
    page.locator('#titleResume').click()
    original=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.locator('.game-tab[data-screen="records"]').click()
    first=page.locator('#decisionReviewV230')
    second=page.locator('#strategyReviewV240')
    assert first.is_visible() and second.is_visible()
    assert not first.get_attribute('open')
    first.locator('summary').click()
    assert first.get_attribute('open') is not None
    assert page.locator('#ledgerWeekPickerV230 option').count()==1
    detail=page.locator('#ledgerWeekDetailV230').inner_text()
    assert '第1週' in detail and '評判' in detail and '施策' in detail and 'その他' in detail
    assert '店の現金増減' in detail
    second.locator('summary').click()
    assert second.get_attribute('open') is not None
    stats=page.locator('#ledgerStrategyStatsV240').inner_text()
    assert '経営した週' in stats and '累計営業利益' in stats
    assert '赤字の週' in stats and '炎上の週' in stats
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'overflow')
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==original,(engine,width,'financial save changed')
    assert not errors,(engine,width,errors)
    print('PASS decisions and strategy',engine,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
