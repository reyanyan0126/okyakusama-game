"""Saved narrative consequences are accessible on mobile Chromium and WebKit."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
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
     let s=GameEngine.initial(42);s.cash=850000;
     const first=GameEngine.weeklyOffers(s)[0];
     s=GameEngine.play(s,first.id);
     if(s.rescuePending)s=GameEngine.resolveRescue(s,GameEngine.rescueOptions(s)[0].id);
     if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=GameEngine.handleAccident(s,'ignore');
     if(s.week!==2)throw Error('week 1 did not complete');
     s=GameEngine.play(s,GameEngine.weeklyOffers(s)[0].id);
     if(s.rescuePending)s=GameEngine.resolveRescue(s,GameEngine.rescueOptions(s)[0].id);
     if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=GameEngine.handleAccident(s,'ignore');
     if(!s.storyArcs.length)throw Error('No story arc created in fixture');
     GameEngine.validateSaved(s);
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    original=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.reload()
    page.locator('#titleResume').click()
    page.locator('.game-tab[data-screen="records"]').click()
    page.locator('#consequencesToggle').click()
    assert '続報待ち' in page.locator('#consequencesPanel').inner_text()
    assert page.locator('#consequencesToggle').get_attribute('aria-expanded')=='true'
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==original
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.locator('#consequencesToggle').click()
    assert page.locator('#consequencesPanel').is_hidden()
    # Use actual game logic to reach a resolved follow-up, without fabricated future text.
    page.evaluate("""()=>{
     let s=GameEngine.initial(34);s.cash=850000;
     while(s.week<=9&&!s.finished){
      const a=GameEngine.weeklyOffers(s);
      s=GameEngine.play(s,(a.find(x=>x.type==='kind')||a[0]).id);
      if(s.rescuePending)s=GameEngine.resolveRescue(s,GameEngine.rescueOptions(s)[0].id);
      if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=GameEngine.handleAccident(s,'ignore');
     }
     if(!s.storyJournal.length)throw Error('No resolved journal in fixture');
     GameEngine.validateSaved(s);
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    page.reload()
    page.locator('#titleResume').click()
    page.locator('.game-tab[data-screen="records"]').click()
    page.locator('#consequencesToggle').click()
    assert '過去の判断の結末' in page.locator('#consequencesPanel').inner_text()
    assert page.locator('#consequencesPanel .is-resolved').count()>0
    assert not errors,errors
    print('PASS consequence journal',browser_name,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
