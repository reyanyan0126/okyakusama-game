"""v1.3.0 integration: story decisions, outcome artwork and genuine next-week consequences."""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text(encoding='utf-8')
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('stories.js','<script defer src="stories.js"></script>'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    assert tag in html, (file, 'missing script or style include')
    replacement=('<style>'+(r/file).read_text(encoding='utf-8')+'</style>') if file.endswith('.css') else ('<script>'+(r/file).read_text(encoding='utf-8')+'</script>')
    html=html.replace(tag,replacement)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(375,667),(390,844),(430,932)]:
        context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
        page=context.new_page();errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click()
        page.locator('#acceptMarket').click()
        page.locator('#prologueSkip').click()
        page.locator('#firstWeekStart').click()
        assert page.locator('#storyPulse').is_hidden()
        page.locator('#openProposals').click()
        page.locator('#advanceButton').click()
        page.locator('#reportScene').wait_for(state='visible',timeout=12000)
        if not page.locator('#reportContinue').is_enabled():page.locator('#accidentIgnore').click()
        page.locator('#reportContinue').click()
        assert page.locator('#weekIndicator').inner_text()=='2 / 30'
        assert page.locator('#storyPulse').is_visible()
        assert '大型事件' in page.locator('#storyPulse').inner_text()
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==4
        for selector in ['[data-id="arc_register_boss"]','[data-id="arc_register_pay"]','[data-id="arc_register_machine"]','[data-id="arc_register_graduation"]']:
            assert page.locator('.action-option'+selector).count()==1
        page.locator('.action-option[data-id="arc_register_boss"]').click()
        assert page.locator('#selectedPerformance').is_visible()
        page.locator('#advanceButton').click()
        assert page.locator('#workingArtUse').get_attribute('href')=='#policy-scene-story-register'
        page.locator('#reportScene').wait_for(state='visible',timeout=12000)
        assert page.locator('#storyEvent').is_visible()
        assert page.locator('#storyArtUse').get_attribute('href')=='#story-cut-register'
        tier=page.locator('#performanceName').inner_text()
        assert tier in ['失敗…','成功！','大成功！'],tier
        assert page.locator('#storyEpisodeText').inner_text()
        assert page.locator('#storyEpisodeQuote').inner_text()
        if not page.locator('#reportContinue').is_enabled():page.locator('#accidentIgnore').click()
        page.locator('#reportContinue').click()
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),width
        assert not errors,(width,errors)
        print('PASS story browser',width,height,flush=True)
        context.close()
    browser.close()
