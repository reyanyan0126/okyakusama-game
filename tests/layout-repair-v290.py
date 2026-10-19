"""v2.9: verify fixed-viewport game, accessible actions, and no procedural actor shapes."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
screens=root/'test-artifacts';screens.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=srv.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  for engine in ('chromium','webkit'):
   browser=getattr(p,engine).launch(headless=True)
   for width,height in [(320,667),(375,812),(390,844),(430,932)]:
    context=browser.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{srv.server_port}',wait_until='networkidle')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'entry width')
    page.locator('#titleStart').click()
    page.locator('#acceptMarket').click()
    page.locator('#prologueSkip').click()
    page.locator('#firstWeekStart').click()
    assert page.locator('#storeWeatherV250').count()==1
    assert not page.locator('#storeWeatherV250').is_visible()
    assert page.locator('#officeExtraMetricsV290').count()==1
    assert not page.locator('#officeExtraMetricsV290').get_attribute('open')
    page.locator('#officeExtraMetricsV290 > summary').click()
    assert page.locator('#officeExtraMetricsV290 .stats-stack').is_visible()
    assert page.locator('#officeExtraMetricsV290 #storeWeatherV250').is_visible()
    page.locator('#officeExtraMetricsV290 > summary').click()
    info=page.evaluate("""()=>{
      const office=document.querySelector('#officeView');
      const nav=document.querySelector('.game-nav');
      const main=document.querySelector('#app>main');
      const box=main.getBoundingClientRect(),n=nav.getBoundingClientRect();
      return {overflow:getComputedStyle(office).overflowY,mainBottom:box.bottom,navTop:n.top,docWidth:document.documentElement.scrollWidth,viewport:innerWidth,scrollAllowed:office.scrollHeight>=office.clientHeight};
    }""")
    assert info['overflow']=='auto',(engine,width,'office scroll',info)
    assert info['mainBottom']<=info['navTop']+6,(engine,width,'tab overlapping active panel',info)
    assert info['docWidth']<=info['viewport']+1,(engine,width,'horizontal overflow',info)
    assert page.locator('#officeView .store-weather-v250').evaluate('(e)=>e.getBoundingClientRect().height')<190,(engine,width,'oversized decorative artwork')
    art=page.evaluate("WeekTheater.art('product','joy','work')")
    assert art.count('class="theater-portrait"')>=2,(engine,width,'complete-portrait art')
    assert 'class="arm' not in art and 'class="head' not in art,(engine,width,'legacy procedural figures')
    # Critical CTA must be visible without first scrolling the office panel.
    action=page.evaluate("""()=>{
      const a=document.getElementById('openProposals').getBoundingClientRect();
      const nav=document.querySelector('.game-nav').getBoundingClientRect();
      return {top:a.top,bottom:a.bottom,navTop:nav.top,viewport:innerHeight};
    }""")
    assert action['top']>=0 and action['bottom']<=min(action['navTop']+1,action['viewport']),(engine,width,'primary action hidden below navigation',action)
    page.locator('#openProposals').click(timeout=6000)
    assert page.locator('#proposalSheet').is_visible()
    page.locator('#closeProposals').click()
    page.locator('.game-tab[data-screen="voice"]').click()
    assert page.locator('#voiceView').is_visible()
    page.locator('.game-tab[data-screen="records"]').click()
    assert page.locator('#recordsView').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'records horizontal overflow')
    if engine=='chromium' and width==390:page.locator('#recordsView').screenshot(path=str(screens/'v290-records-390.png'))
    assert not errors,(engine,width,errors)
    print('PASS mobile viewport and SVG actors',engine,width,height,flush=True)
    context.close()
   browser.close()
finally:
 srv.shutdown()
