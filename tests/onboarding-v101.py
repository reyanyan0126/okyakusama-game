from theater_helpers import finish_theater
"""v1.0.1: new-contract onboarding, resume safety and compact iPhone UI."""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text(encoding='utf-8')
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('stories.js','<script defer src="stories.js"></script>'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('scene.js','<script defer src="scene.js"></script>'),('manga-v200.js','<script defer src="manga-v200.js"></script>'),('policy-symbols-v173.js','<script defer src="policy-symbols-v173.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    assert tag in html,(file,tag)
    html=html.replace(tag,('<style>'+ (r/file).read_text(encoding='utf-8')+'</style>') if file.endswith('.css') else ('<script>'+(r/file).read_text(encoding='utf-8')+'</script>'))
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(375,667),(390,844),(430,932)]:
        c=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
        page=c.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click()
        page.locator('#acceptMarket').click()
        for i in range(7):
            assert page.locator('#prologueArt').get_attribute('href')==f'./assets/prologue-v160.svg#prologue-{i+1}'
            if i<6:page.locator('#prologueNext').click()
        page.locator('#prologueNext').click()
        assert page.locator('#modal').is_visible(), 'guide should display directly after intro'
        guide=page.locator('#modalContent').inner_text()
        for word in ['30週間','4つの作戦を見る','この案で営業する','評判50以上']:
            assert word in guide,(width,word)
        assert page.locator('#firstWeekStart').is_visible()
        rect=page.locator('#firstWeekStart').bounding_box()
        assert rect is not None and rect['width']>230
        # The dialog itself may scroll on small iPhones: the primary CTA must remain reachable.
        page.locator('#firstWeekStart').click()
        assert not page.locator('#modal').is_visible()
        assert page.locator('#weekIndicator').inner_text()=='1 / 30'
        # Record one week so that "Continue" becomes available on the title screen.
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==4
        page.locator('#advanceButton').click()
        finish_theater(page)
        page.locator('#reportScene').wait_for(state='visible',timeout=10000)
        if not page.locator('#reportContinue').is_enabled():
            page.locator('#accidentIgnore').click()
        page.locator('#reportContinue').click()
        assert page.locator('#weekIndicator').inner_text()=='2 / 30'
        page.locator('.game-tab[data-screen="records"]').click()
        page.locator('#backTitle').click()
        page.locator('#titleResume').click()
        assert not page.locator('#modal').is_visible(), 'resume must not reopen onboarding'
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==4
        page.locator('#closeProposals').click()
        assert not errors,(width,errors)
        print('PASS onboarding',width,height,flush=True)
        c.close()
    # Skipping the story must still show the same onboarding once.
    c=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    page=c.new_page();page.set_content(html,wait_until='load')
    page.locator('#titleStart').click();page.locator('#acceptMarket').click()
    page.locator('#prologueSkip').click()
    assert page.locator('#modal').is_visible()
    assert page.locator('#firstWeekStart').is_visible()
    print('PASS onboarding after story skip',flush=True)
    c.close()
    browser.close()
