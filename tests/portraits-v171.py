"""v1.7.1: fresh character portraits and storefront scenes are visible on mobile in Chromium/WebKit."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
class Silent(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Silent,directory=str(r)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}'
with sync_playwright() as p:
 for engine in ['chromium','webkit']:
  browser=getattr(p,engine).launch(headless=True)
  for width in [320,375,390,430]:
   context=browser.new_context(viewport={'width':width,'height':780},reduced_motion='reduce')
   page=context.new_page();errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(url,wait_until='networkidle')
   counts=page.evaluate("""async()=>{
     const results=[];
     for(const name of ['portraits-v171.svg','storefront-v171.svg']){
       const response=await fetch('./assets/'+name);
       const dom=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
       results.push([response.status,dom.querySelectorAll('parsererror').length,dom.querySelectorAll('symbol').length]);
     }return results;
   }""")
   assert counts==[[200,0,25],[200,0,6]],(engine,width,counts)
   cases=[('normal',1,'regular'),('busy',5,'parent'),('quiet',9,'senior'),('scandal',13,'student'),('critical',1,'regular')]
   for shop,week,customer in cases:
    page.evaluate("""({shop,week})=>{
     let g=GameEngine.initial(1441);
     g.cash=1200000;g.personalCash=400000;
     while(g.week<week&&!g.finished){
      const actions=GameEngine.weeklyOffers(g);
      const chosen=actions.find(a=>a.id==='quality')||actions[0];
      g=GameEngine.play(g,chosen.id);
      const h=g.lastResult;
      if(h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&h.accidentResponse===null)g=GameEngine.handleAccident(g,'ignore');
     }
     if(g.week!==week)throw Error('Could not build consistent multiweek save: '+week);
     if(shop==='busy'){g.cash=320000;g.storeRep=78;g.sat=79;g.frust=17;g.fire=3;g.profit=165000;}
     if(shop==='quiet'){g.cash=152000;g.storeRep=51;g.sat=45;g.frust=41;g.profit=3000;}
     if(shop==='scandal'){g.fire=68;g.storeRep=30;g.profit=13000;}
     if(shop==='critical'){g.cash=53000;g.storeRep=29;g.profit=-35000;}
     localStorage.setItem('okyakusama.save.v1',JSON.stringify(g));
    }""",{'shop':shop,'week':week})
    page.reload(wait_until='load')
    page.locator('#titleResume').click()
    art=page.locator('.office-room-art use')
    href=art.get_attribute('href')
    assert href.endswith('#store-'+shop),(engine,width,shop,href)
    assert page.locator('#bossFace use').get_attribute('href').startswith('./assets/portraits-v171.svg#portrait-manager-')
    assert page.locator('#buyerFace use').get_attribute('href').startswith('./assets/portraits-v171.svg#portrait-'+customer+'-')
    # Verify actual glyphs are rendered, not just that a link exists.
    bounds=page.evaluate("""()=>{
     return [
      document.querySelector('.office-room-art use').getBBox().width,
      document.querySelector('#bossFace use').getBBox().width,
      document.querySelector('#buyerFace use').getBBox().width
     ];
    }""")
    assert all(n>0 for n in bounds),(engine,width,shop,bounds)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(engine,width,'horizontal overflow')
    assert not errors,(engine,width,errors)
   print('PASS v1.7.1 office artwork',engine,width,flush=True)
   context.close()
  browser.close()
server.shutdown()
