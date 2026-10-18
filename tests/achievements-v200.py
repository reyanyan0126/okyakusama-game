"""End-to-end achievement persistence without changing the existing campaign save."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from functools import partial
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
   context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url)
   page.evaluate("""()=>{
    const G=GameEngine;let s=G.initial(2654435761);s.cash=900000;
    while(!s.finished){
     const a=G.weeklyOffers(s).find(x=>x.type==='kind')||G.weeklyOffers(s)[0];
     s=G.play(s,a.id);
     if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
     if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
    }
    if(s.week!==31)throw Error('fixture did not complete 30 weeks');
    G.validateSaved(s);
    localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
   }""")
   before=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
   page.reload()
   page.locator('#titleResume').click()
   assert page.locator('#modal').is_visible()
   persisted=page.evaluate("localStorage.getItem('okyakusama.achievements.v1')")
   assert persisted
   assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==before
   page.locator('#modalClose').click()
   page.locator('.game-tab[data-screen="records"]').click()
   page.locator('#achievementsToggle').click()
   assert page.locator('#achievementsPanel').is_visible()
   assert page.locator('#achievementsPanel .achievement-item').count()==8
   assert '発見したエンディング' in page.locator('#achievementsPanel').inner_text()
   page.reload()
   page.locator('#titleResume').click()
   assert page.evaluate("localStorage.getItem('okyakusama.achievements.v1')")==persisted,'replaying ending must not duplicate achievements'
   assert not errors,errors
   print('PASS achievements',browser_name,flush=True)
   context.close()
   browser.close()
finally:
 server.shutdown()
