"""v0.9.3: verify compact boardroom, two cash indicators, optional actions, results and tabs."""
from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path(__file__).resolve().parents[1]
html=(folder/'index.html').read_text()
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    content=('<style>'+ (folder/file).read_text()+'</style>') if file.endswith('.css') else ('<script>'+(folder/file).read_text()+'</script>')
    html=html.replace(tag,content)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in ((375,667),(390,844),(430,932),(1280,850)):
        context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click(); page.locator('#acceptMarket').click()
        assert page.locator('#prologueScreen').is_visible()
        page.locator('#prologueSkip').click()
        assert page.locator('#officeView').is_visible()
        assert page.locator('#cashTrend').inner_text()=='開始時点'
        assert page.locator('#personalTrend').inner_text()=='開始時点'
        assert page.locator('#officeView .office-room-art').is_visible()
        dimensions=page.evaluate('''()=>{let d=document.querySelector('.decision-card').getBoundingClientRect(),n=document.querySelector('.game-nav').getBoundingClientRect();return {decision:d.bottom,nav:n.top,overflow:document.documentElement.scrollWidth-innerWidth}}''')
        assert dimensions['overflow']<=0,(width,dimensions)
        if width<850:assert dimensions['decision']<=dimensions['nav']+2,(width,dimensions)
        page.screenshot(path=str(folder/f'office-{width}.png'))
        page.locator('#openProposals').click()
        assert page.locator('.action-option').count()==3
        assert page.locator('#optionalActions').is_visible()
        assert not page.locator('#optionalActions').evaluate('(el)=>el.open')
        page.locator('#optionalActions > summary').click()
        assert page.locator('#optionalActions').evaluate('(el)=>el.open')
        page.screenshot(path=str(folder/f'proposals-{width}.png'))
        page.locator('#advanceButton').click()
        page.wait_for_selector('#reportScene:visible',timeout=12000)
        if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
        if page.locator('#rescueScene').is_visible():page.locator('.rescue-option').first.click()
        assert page.locator('#reportCashChange').is_visible()
        assert page.locator('#reportPersonalChange').is_visible()
        assert page.locator('#storeMoneyWhy').is_visible()
        assert not page.locator('#financialDetail').evaluate('(el)=>el.open')
        page.locator('#financialDetail > summary').click()
        assert page.locator('#storeMoneyFull').is_visible()
        page.screenshot(path=str(folder/f'result-{width}.png'))
        page.locator('#reportContinue').click()
        assert page.locator('#cashTrend').inner_text().startswith('前週から')
        assert page.locator('#personalTrend').inner_text().startswith('前週から')
        page.locator('.game-tab[data-screen="voice"]').click()
        gap=page.evaluate('''()=>{let h=document.querySelector('#voiceView .voice-feed-heading').getBoundingClientRect(),a=document.querySelector('#publicFeed .social-post').getBoundingClientRect();return a.top-h.bottom;}''')
        assert gap>=8,('overlapping voice',width,gap)
        page.locator('.game-tab[data-screen="records"]').click()
        assert page.locator('#recordsView').is_visible()
        assert not errors,(width,errors)
        print('PASS',width,height,'voice gap',gap,'fixed bar',dimensions)
        context.close()
    browser.close()
print('PASS v0.9.3 compact finance UI')