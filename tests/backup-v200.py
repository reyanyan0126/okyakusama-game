"""Portable full backup download and import, with legacy JSON compatibility."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import json

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
   context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('dialog',lambda dialog:dialog.accept())
   page.goto(url)
   page.evaluate("""()=>{
    let s=GameEngine.initial(42),a=GameEngine.weeklyOffers(s)[0];
    s=GameEngine.play(s,a.id);
    if(s.rescuePending)s=GameEngine.resolveRescue(s,GameEngine.rescueOptions(s)[0].id);
    if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=GameEngine.handleAccident(s,'ignore');
    GameEngine.validateSaved(s);
    localStorage.setItem('okyakusama.save.v1',JSON.stringify(s));
    localStorage.setItem('okyakusama.achievements.v1',JSON.stringify({version:1,unlocked:{complete:true},endings:['契約更新！']}));
   }""")
   page.reload()
   page.locator('#titleResume').click()
   page.locator('.game-tab[data-screen="records"]').click()
   with page.expect_download() as info:
    page.locator('#exportFullBackup').click()
   downloaded=info.value
   full=json.loads(Path(downloaded.path()).read_text(encoding='utf-8'))
   assert full['kind']=='okyakusama-portable-backup'
   assert full['gallery']['unlocked']['complete']
   assert full['campaign']['week']==2
   with page.expect_download() as old_download:
    page.locator('#exportButton').click()
   legacy=json.loads(Path(old_download.value.path()).read_text(encoding='utf-8'))
   assert legacy['version']==full['campaign']['version'] and 'kind' not in legacy
   page.evaluate("""()=>{
    localStorage.setItem('okyakusama.achievements.v1',
      JSON.stringify({version:1,unlocked:{credit:true},endings:['優良店の改革者']}));
   }""")
   page.locator('#importInput').set_input_files({'name':'full.json','mimeType':'application/json','buffer':json.dumps(full,ensure_ascii=False).encode('utf-8')})
   page.wait_for_function("""()=>{
    let x=JSON.parse(localStorage.getItem('okyakusama.achievements.v1'));
    return x.unlocked.credit&&x.unlocked.complete&&x.endings.includes('契約更新！')&&x.endings.includes('優良店の改革者');
   }""")
   page.locator('#importInput').set_input_files({'name':'legacy.json','mimeType':'application/json','buffer':json.dumps(legacy,ensure_ascii=False).encode('utf-8')})
   page.wait_for_function("""()=>{
    let x=JSON.parse(localStorage.getItem('okyakusama.achievements.v1'));
    return x.unlocked.credit&&x.unlocked.complete;
   }""")
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert not errors,errors
   print('PASS v2.0 portable backup',browser_name,flush=True)
   context.close()
   browser.close()
finally:
 server.shutdown()
