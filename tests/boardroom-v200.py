"""Boardroom dilemma is readable before decision and remembered in settlement and save."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
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
     const G=GameEngine;let s=G.initial(42);
     while(s.week<6&&!s.finished){
      const a=G.weeklyOffers(s).find(x=>x.type==='kind')||G.weeklyOffers(s)[0];
      s=G.play(s,a.id);
      if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
      if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
     }
     if(s.week!==6||!G.boardroomDemand(s)?.milestone)throw Error('no milestone in fixture');
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    page.reload()
    page.locator('#titleResume').click()
    page.locator('#openProposals').click()
    assert '人物の信頼が変化' in page.locator('#proposalMeetingTarget').inner_text()
    page.locator('.action-option[data-id="stamp"]').click()
    assert '【社長との駆け引き】' in page.locator('#selectedTradeoff').inner_text()
    page.locator('#advanceButton').click()
    record=page.evaluate("""()=>JSON.parse(localStorage.getItem('okyakusama.save.v1')).lastResult.boardroomDilemma""")
    assert record is not None and record['followed'] and record['delta']['boss']>=0
    page.evaluate("showWeekReport(game.lastResult,game.finished)")
    assert '社長との駆け引き' in page.locator('#resultFactors').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert not errors,errors
    print('PASS v2.0 boardroom',browser_name,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
