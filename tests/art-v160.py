"""Browser regression: 7 separate story panels and 21 purpose-made news scenes."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(r)))
Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)
with sync_playwright() as p:
 for browser_name in ['chromium','webkit']:
  browser=getattr(p,browser_name).launch(headless=True)
  for width in [375,390,430]:
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
   page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(url)
   counts=page.evaluate("""async()=>{const files=['prologue-v160.svg','incidents-v160.svg'];const n=[];for(const file of files){const res=await fetch('./assets/'+file),text=await res.text(),dom=new DOMParser().parseFromString(text,'image/svg+xml');n.push([res.status,dom.querySelectorAll('parsererror').length,dom.querySelectorAll('symbol').length]);}return n;}""")
   assert counts==[[200,0,7],[200,0,21]],counts
   page.locator('#titleStart').click();page.locator('#acceptMarket').click()
   for n in range(1,8):
    use=page.locator('#prologueArt')
    assert use.get_attribute('href')=='./assets/prologue-v160.svg#prologue-'+str(n)
    size=page.evaluate("()=>document.querySelector('#prologueArt').getBBox().width")
    assert size>0,(browser_name,width,n,'intro not drawn',size)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    if n<7:page.locator('#prologueNext').click()
   page.locator('#prologueSkip').click()
   page.locator('#firstWeekStart').click()
   # Inject a valid fixture for each source news category.
   testcases=[('freezer','freezer'),('rain','rain'),('viral','viral')]
   for incident,expected in testcases:
    page.evaluate("""id=>{
      const G=GameEngine;
      let result=null;
      for(let seed=1;seed<60000;seed++){
       const s=G.play(G.initial(seed),'quality');
       if(s.lastResult.accidentId===id){result=s;break;}
      }
      if(!result)throw Error('fixture not found: '+id);
      result.presentation={week:1,stage:'news',newsIndex:0};
      // Present the accident's own item first without modifying any money.
      const list=WeekTheater.news(result.lastResult,G);
      result.presentation.newsIndex=list.findIndex(x=>x.visualId===id);
      localStorage.setItem('okyakusama.save.v1',JSON.stringify(result));
    }""",incident)
    page.reload();page.locator('#titleResume').click()
    use=page.locator('#newsArt .incident-illustration use')
    assert use.get_attribute('href').endswith('#incident-'+expected),(incident,use.get_attribute('href'))
    b=page.evaluate("()=>document.querySelector('#newsArt .incident-illustration use').getBBox().width")
    assert b>0,(browser_name,width,incident,b)
   assert not errors,errors
   print('PASS v1.6 art',browser_name,width,flush=True)
   context.close()
  browser.close()
server.shutdown()
