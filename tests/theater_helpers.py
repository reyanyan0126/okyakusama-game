def finish_theater(page):
    page.locator('#outcomeScene').wait_for(state='visible', timeout=15000)
    page.locator('#outcomeNext').click()
    for _ in range(12):
        if not page.locator('#newsScene').is_visible(): break
        if page.locator('#accidentDecision').is_visible(): page.locator('#accidentIgnore').click()
        page.locator('#newsNext').click()
    if page.locator('#rescueScene').is_visible(): page.locator('#rescueGiveUp').click()
