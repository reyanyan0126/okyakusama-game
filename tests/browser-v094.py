"""Real Chromium smoke checks for boardroom and exact cash popups, compact iPhone widths."""
from pathlib import Path
from playwright.sync_api import sync_playwright
folder=Path(__file__).resolve().parents[1]
html=(folder/'index.html').read_text()
for file,tag in [('styles.css','<link rel="stylesheet" href="styles.css">'),('engine.js','<script defer src="engine.js"></script>'),('finance.js','<script defer src="finance.js"></script>'),('app.js','<script defer src="app.js"></script>')]:
    content=('<style>'+ (folder/file).read_text()+'</style>') if file.endswith('.css') else ('<script>'+(folder/file).read_text()+'</script>')
    assert tag in html
    html=html.replace(tag,content)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in ((375,667),(390,844),(430,932),(1280,850)):
        context=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
        page=context.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.locator('#titleStart').click();page.locator('#acceptMarket').click();page.locator('#prologueSkip').click()
        assert page.locator('#officeView').is_visible()
        assert page.locator('#meetingBills').is_visible()
        dims=page.evaluate('''()=>{let d=document.querySelector('.decision-card').getBoundingClientRect(),n=document.querySelector('.game-nav').getBoundingClientRect();return {decision:d.bottom,nav:n.top,overflow:document.documentElement.scrollWidth-innerWidth,meetingHeight:d.height}}''')
        assert dims['overflow']<=1,(w,dims)
        if w<850:assert dims['decision']<=dims['nav']+3,(w,dims)
        page.screenshot(path=str(folder/f'office-v094-{w}.png'))
        page.locator('#officeStoreMoney').click()
        assert page.locator('#moneySheet').is_visible()
        assert 'お店の資金明細' in page.locator('#moneyTitle').inner_text()
        assert '固定費' in page.locator('#moneyLines').inner_text()
        page.screenshot(path=str(folder/f'ledger-empty-v094-{w}.png'))
        page.locator('#moneyPersonalTab').click()
        assert '養育費' in page.locator('#moneyLines').inner_text()
        page.locator('#moneyDone').click()
        assert page.locator('#moneySheet').is_hidden()
        page.locator('#meetingMoneyButton').click()
        assert page.locator('#moneySheet').is_visible()
        page.locator('#moneyClose').click()
        page.locator('#openProposals').click()
        assert page.locator('#proposalSheet').is_visible()
        page.locator('#proposalMoneyButton').click()
        assert page.locator('#moneySheet').is_visible()
        page.locator('#moneyClose').click()
        assert page.locator('#proposalSheet').is_visible()
        page.locator('#advanceButton').click()
        page.wait_for_selector('#reportScene:visible',timeout=12000)
        if page.locator('#accidentDecision').is_visible():page.locator('#accidentIgnore').click()
        if page.locator('#rescueScene').is_visible():page.locator('.rescue-option').first.click()
        page.locator('#reportLedgerButton').click()
        assert page.locator('#moneySheet').is_visible()
        txt=page.locator('#moneyLines').inner_text()
        assert '商品の売上' in txt and 'コンサル報酬' in txt and '残高の計算' in txt,txt
        page.screenshot(path=str(folder/f'ledger-v094-{w}.png'))
        page.locator('#moneyPersonalTab').click()
        txt=page.locator('#moneyLines').inner_text();assert '生活費' in txt,txt
        page.locator('#moneyClose').click()
        page.screenshot(path=str(folder/f'report-v094-{w}.png'))
        page.locator('#reportContinue').click()
        if page.locator('#officeView').is_visible():
            page.locator('#officePersonalMoney').click()
            assert page.locator('#moneyTitle').inner_text()=='主人公の家計簿'
            page.keyboard.press('Escape')
        assert not errors,(w,errors)
        print('PASS',w,h,dims,flush=True)
        context.close()
    browser.close()