"""Standalone local-only portrait review: 25 slots, upload quality gate and mobile touch."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import zlib,struct
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
def chunk(tag,data):return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
def transparent_png(w,h):
 header=chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))
 row=b'\x00'+(b'\x00\x00\x00\x00'*w)
 return b'\x89PNG\r\n\x1a\n'+header+chunk(b'IDAT',zlib.compress(row*h,level=6))+chunk(b'IEND',b'')
png=transparent_png(1024,1280)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  for engine in ('chromium','webkit'):
   b=getattr(p,engine).launch(headless=True)
   for width in (320,390,430):
    ctx=b.new_context(viewport={'width':width,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce',accept_downloads=True)
    page=ctx.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/art-review-v280.html',wait_until='networkidle')
    assert page.locator('.portrait-card').count()==25
    assert page.locator('.portrait-frame svg use').count()==25
    assert page.locator('#assetCount').inner_text()=='0 / 25'
    page.locator('#characterFilter button[data-role="manager"]').click()
    assert page.locator('.portrait-card:visible').count()==5
    page.locator('#candidateFiles').set_input_files({'name':'manager-normal.png','mimeType':'image/png','buffer':png})
    page.wait_for_function("document.querySelector('#assetCount').textContent==='1 / 25'")
    card=page.locator('#portrait-manager-normal')
    assert card.get_attribute('data-state')=='pending'
    assert card.locator('.review-flags input').count()==6
    for checkbox in card.locator('.review-flags input').all():checkbox.check()
    assert card.get_attribute('data-state')=='ready'
    assert page.locator('#approvedCount').inner_text()=='1 / 25'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,'horizontal overflow')
    with page.expect_download() as d:page.locator('#exportReview').click()
    assert d.value.suggested_filename=='art-review-proposal-v280.json'
    assert not errors,(engine,width,errors)
    print('PASS original-art-review',engine,width,flush=True)
    ctx.close()
   b.close()
finally:
 server.shutdown()
