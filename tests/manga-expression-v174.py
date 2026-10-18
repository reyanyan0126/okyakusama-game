"""v1.7.4: a real protagonist image changes with emotional dialogue, with no CSS anatomy."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
artifacts=root/'test-artifacts'
artifacts.mkdir(parents=True,exist_ok=True)
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
    page.goto(url,wait_until='networkidle')
    original=page.evaluate("localStorage.getItem('okyakusama.save.v1')")
    page.evaluate("""()=>{
      const div=document.createElement('div');
      div.id='expressionPreview';
      div.style.cssText='width:100%;max-width:400px;padding:8px;margin:0 auto;box-sizing:border-box;';
      div.innerHTML=MangaCinema.markup('office',[
        'あなたは支払いのことが心配？',
        '社長「責任は全部君だ！」',
        '店長「良かった！ お客様が喜んでいる！」'
      ],{all:true,setting:'office'});
      document.body.replaceChildren(div);
    }""")
    assert page.locator('#expressionPreview .manga-panel').count()==3
    assert page.locator('#expressionPreview .manga-emotion-cue').all_text_contents()==['焦り','怒り','前向き']
    assert page.locator('#expressionPreview .manga-panel').evaluate_all(
     "(els)=>els.map(e=>e.dataset.emotion)"
    )==['panic','angry','happy']
    hrefs=page.locator('#expressionPreview .manga-painted-character image').evaluate_all(
     "(els)=>els.map(e=>e.getAttribute('href'))"
    )
    assert len(hrefs)==3,hrefs
    assert hrefs[0].endswith('illustrated-protagonist-v173.webp'),hrefs
    assert hrefs[1].endswith('manga-painted-cast-v173.webp'),hrefs
    assert hrefs[2].endswith('manga-painted-cast-v173.webp'),hrefs
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
    assert page.evaluate("localStorage.getItem('okyakusama.save.v1')")==original
    assert not errors,errors
    if browser_name=='chromium' and width==390:
     page.locator('#expressionPreview').screenshot(path=str(artifacts/'manga-emotions-390.png'))
    print('PASS v1.7.4 emotions',browser_name,width,flush=True)
    context.close()
   browser.close()
finally:
 server.shutdown()
