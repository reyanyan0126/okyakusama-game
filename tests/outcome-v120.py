"""v1.2.0: verify legible odds, outcome report, policy illustration on mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text(encoding='utf-8')
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('stories.js','<script defer src="stories.js"></script>'),('stories.js','<script defer src="stories.js"></script>'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    html=html.replace(tag,('<style>'+(r/file).read_text(encoding='utf-8')+'</style>') if file.endswith('.css') else ('<script>'+(r/file).read_text(encoding='utf-8')+'</script>'))
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(375,667),(390,844),(430,932)]:
        c=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
        page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#prologueSkip').click();page.locator('#firstWeekStart').click()
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==4
        assert page.locator('.action-odds').count()==4
        assert page.locator('#selectedPerformance').is_visible()
        summary=page.locator('#selectedPerformance').inner_text()
        assert '失敗' in summary and '成功' in summary and '大成功' in summary
        page.locator('.action-option[data-id="shrink"]').click()
        page.locator('#advanceButton').click()
        assert page.locator('#workingArtUse').get_attribute('href')=='#policy-scene-tiny'
        page.locator('#reportScene').wait_for(state='visible',timeout=10000)
        assert page.locator('#performanceReport').is_visible()
        assert page.locator('#performanceName').inner_text() in ['失敗…','成功！','大成功！']
        assert '80％' in page.locator('#performanceMessage').inner_text() or '100％' in page.locator('#performanceMessage').inner_text() or '135％' in page.locator('#performanceMessage').inner_text()
        assert '事故や炎上抽選は別判定' in page.locator('#performanceDetail').inner_text()
        if not page.locator('#reportContinue').is_enabled():page.locator('#accidentIgnore').click()
        page.locator('#reportContinue').click()
        page.locator('#openProposals').click()
        assert '連続好調' in page.locator('#successStreak').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),width
        assert not errors,(width,errors)
        print('PASS outcome mobile',width,height,flush=True)
        c.close()
    browser.close()
