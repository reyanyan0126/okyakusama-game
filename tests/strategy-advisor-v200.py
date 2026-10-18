"""Verify the optional strategic advisor in mobile Chromium/WebKit without changing saves."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
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
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto(url)
    page.evaluate("""()=>{
     const G=GameEngine;let s=G.initial(42);
     s=G.play(s,G.weeklyOffers(s)[0].id);
     if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
     if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
     G.validateSaved(s);
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    page.reload()
    page.locator('#titleResume').click()
    page.locator('#openProposals').click()
    assert page.locator('#strategyAdvisor').count()==1
    saved=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.locator('#strategyAdvisor summary').click()
    assert page.locator('#strategyAdviceContent').is_visible()
    assert '契約利益まであと' in page.locator('#strategyAdviceContent').inner_text()
    assert '基準炎上率' in page.locator('#strategyAdviceContent').inner_text()
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==saved
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    # Budget changes must update reference outlay, without applying any investment or advancing the week.
    page.locator('#optionalActions').evaluate('(el)=>el.open=true')
    original=page.evaluate("document.querySelector('#strategyAdviceContent').innerText")
    page.locator('#projectChoices [data-project="people"]').click()
    changed=page.evaluate("document.querySelector('#strategyAdviceContent').innerText")
    assert original!=changed,'investment forecast should react'
    assert page.evaluate("JSON.parse(localStorage.getItem('okyakusama.save.v1')).week")==2
    page.locator('#actions [data-id]').last.click()
    assert page.locator('#strategyAdviceContent').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert not errors,errors
    print('PASS strategy advisory',browser_name,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
