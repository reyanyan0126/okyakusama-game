"""v1.1.0 mobile integration: four contextual choices, scenes and six-metric dashboard."""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text(encoding='utf-8')
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('stories.js','<script defer src="stories.js"></script>'),('stories.js','<script defer src="stories.js"></script>'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    assert tag in html
    html=html.replace(tag,('<style>'+(r/file).read_text(encoding='utf-8')+'</style>') if file.endswith('.css') else ('<script>'+(r/file).read_text(encoding='utf-8')+'</script>'))
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(375,667),(390,844),(430,932)]:
        c=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
        page=c.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#prologueSkip').click()
        assert page.locator('#firstWeekStart').is_visible()
        page.locator('#firstWeekStart').click()
        for id in ['dashSales','dashProfit','dashPrice','dashQuality','dashStaff','dashSat']:
            assert page.locator('#'+id).is_visible(),(width,id)
        assert '200' in page.locator('#dashPrice').inner_text()
        page.locator('#openStatusSheet').click()
        detail=page.locator('#statusContent').inner_text()
        for label in ['財務・契約','売上・コスト','商品・現場','お客様・リスク','現場診断','借入残高','商品の量']:
            assert label in detail,(width,label)
        page.locator('#statusDone').click()
        assert not page.locator('#statusSheet').is_visible()
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==4
        assert len(page.locator('.action-option').all_inner_texts())==4
        page.locator('.action-option[data-id="raise"]').click()
        assert '値札' in page.locator('#selectedTitle').inner_text()
        page.locator('#advanceButton').click()
        assert page.locator('#workingArtUse').get_attribute('href')=='#policy-scene-price'
        assert '値札' in page.locator('#workingAction').inner_text()
        page.locator('#reportScene').wait_for(state='visible',timeout=10000)
        assert '万円' in page.locator('#reportCash').inner_text()
        if not page.locator('#reportContinue').is_enabled():
            page.locator('#accidentIgnore').click()
        page.locator('#reportContinue').click()
        assert page.locator('#weekIndicator').inner_text()=='2 / 30'
        assert page.locator('#dashSales').inner_text().strip()
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==4
        page.locator('#closeProposals').click()
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),(width,'horizontal overflow')
        assert not errors,(width,errors)
        print('PASS v1.1.0 mobile',width,height,flush=True)
        c.close()
    browser.close()
