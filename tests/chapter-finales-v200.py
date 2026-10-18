"""Chapter hearings and evidence epilogues in mobile Chromium and WebKit."""
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
     const G=GameEngine;let s=G.initial(34);s.cash=850000;
     while(s.week<15&&!s.finished){
      const choices=G.weeklyOffers(s);
      const a=choices.find(x=>x.id.startsWith('fix_'))||choices.find(x=>x.type==='kind')||choices[0];
      s=G.play(s,a.id);
      if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
      if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
     }
     if(s.week!==15)throw Error('Could not reach the middle-game scene');
     s.cash=850000;s.fire=1;s.frust=10;
     s.lastResult.fireHit=false;s.lastResult.memoryEvent=false;
     if(G.weeklyBrief(s).chapter!=='accountability')throw Error('Chapter missing');
     G.validateSaved(s);
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    }""")
    page.reload()
    page.locator('#titleResume').click()
    assert '物語の転換点' in page.locator('#storyPulse').inner_text()
    page.locator('#openProposals').click()
    assert '中間監査' in page.locator('#pitchTone').inner_text() or '現場の声' in page.locator('#pitchTone').inner_text() or '再建' in page.locator('#pitchTone').inner_text()
    ids=page.locator('#actions [data-id]').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.id)')
    assert ids==['audit','bills','stamp','blame'],ids
    page.locator('#actions [data-id="audit"]').click()
    page.locator('#advanceButton').click()
    record=page.evaluate("JSON.parse(localStorage.getItem('okyakusama.save.v1')).lastResult.chapterDecision")
    assert record and record['id']=='accountability' and record['route']=='people',record
    page.locator('#outcomeNext').wait_for(state='visible',timeout=15000)
    page.locator('#outcomeNext').click()
    for _ in range(15):
     if page.locator('#reportScene').is_visible():break
     if page.locator('#accidentIgnore').is_visible():page.locator('#accidentIgnore').click()
     elif page.locator('#newsNext').is_visible():page.locator('#newsNext').click()
     else:raise AssertionError('Cannot reach settlement')
    assert page.locator('#reportScene').is_visible()
    page.locator('#financialDetail').evaluate('(el)=>el.open=true')
    assert '重要会議の判断' in page.locator('#resultFactors').inner_text()
    # Finish the settlement so reloading returns to the office rather than a resumed cinema.
    page.locator('#reportContinue').click()
    assert page.evaluate("JSON.parse(localStorage.getItem('okyakusama.save.v1')).presentation")==None
    page.reload()
    page.locator('#titleResume').click()
    page.locator('.game-tab[data-screen="records"]').click()
    page.locator('#consequencesToggle').click()
    assert page.locator('#consequencesPanel .is-chapter').count()==1
    assert '中盤・終盤の選択' in page.locator('#consequencesPanel').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert not errors,errors
    print('PASS v2.0 chapter hearing',browser_name,width,flush=True)
    context.close()
   browser.close()
  # Full-campaign finale: use actual settled story records, not fabricated future scenes.
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  page.goto(url)
  page.evaluate("""()=>{
   const G=GameEngine;let s=G.initial(2654435761);s.cash=900000;
   while(!s.finished){
    const offers=G.weeklyOffers(s),a=offers.find(x=>x.type==='kind')||offers[0];
    s=G.play(s,a.id);
    if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
    if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
   }
   if(s.week!==31||s.storyJournal.length===0)throw Error('No 30-week campaign');
   G.validateSaved(s);
   localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
  }""")
  raw=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
  page.reload()
  page.locator('#titleResume').click()
  assert page.locator('#modal').is_visible()
  assert page.locator('.finale-evidence li').count()>0
  assert '過去の判断' in page.locator('.finale-evidence').inner_text()
  assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==raw
  print('PASS v2.0 finale evidence',flush=True)
  browser.close()
finally:
 server.shutdown()
