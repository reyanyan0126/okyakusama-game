from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
for p,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('manga-v200.js','<script defer src="manga-v200.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    html=html.replace(tag,'<style>'+ (root/p).read_text()+'</style>' if p.endswith('css') else '<script>'+(root/p).read_text()+'</script>')
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(375,667),(390,844),(430,932),(1280,850)]:
        ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
        page=ctx.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click();page.locator('#acceptMarket').click()
        for i in range(6):
            assert page.locator('#prologueCounter').inner_text()==f'{i+1:02} / 06'
            href=page.locator('#prologueArt').get_attribute('href')
            assert href==f'#story-scene-{i+1}',(i,href)
            bounds=page.locator('#prologueIllustration').bounding_box()
            assert bounds['width']>=275 and bounds['height']>=110,bounds
            assert page.evaluate('''()=>document.documentElement.scrollWidth-innerWidth''')<=1
            if width==390:page.screenshot(path=str(root/f'story-scene-{i+1:02}.png'))
            if i<5:page.locator('#prologueNext').click()
        page.locator('#prologueNext').click()
        assert page.locator('#officeView').is_visible()
        page.locator('#openStatusSheet').click();assert page.locator('#statusClose').is_visible()
        page.locator('#statusClose').click();assert not page.locator('#statusSheet').is_visible()
        page.locator('#officePersonalMoney').click();assert page.locator('#moneyClose').is_visible()
        page.locator('#moneyClose').click()
        page.locator('#openProposals').click();assert page.locator('#closeProposals').is_visible()
        page.locator('#closeProposals').click()
        assert not errors,(width,errors)
        print('PASS',width,height,'all six story scenes, 3 modals',flush=True)
        ctx.close()
    browser.close()