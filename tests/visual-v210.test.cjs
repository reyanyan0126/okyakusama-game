'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html'),app=read('app.js'),css=read('overhaul-v210.css');
const presenter=read('overhaul-v210.js'),sw=read('sw.js'),manga=read('manga-v200.js');
const G=require('../engine.js'),M=require('../manga-v200.js');
assert(html.includes('overhaul-v210.css?v=210'));
assert(html.includes('overhaul-v210.js?v=210'));
assert(html.includes('<button type="button" id="outcomeDetailsToggle"'));
assert(html.includes('aria-controls="outcomeDetailsPanel"'));
assert(html.includes('<div id="outcomeDetailsPanel" class="theater-detail-panel" hidden>'));
assert(!html.includes('<details><summary>判定の詳細'));
assert(app.includes("'outcomeDetailsToggle').addEventListener('click'"));
assert(app.includes("'outcomeDetailsPanel').hidden=true"));
assert(app.includes("event.target.closest('button,summary,details,input,select,textarea,a,label')"));
for(const key of ['titleScreen','contractsScreen','prologueScreen','officeView','voiceView','recordsView','proposalSheet','workingScene','newsScene','reportScene'])
 assert(css.includes('#'+key),key+' has redesigned styling');
for(const role of ['cover','contract','voice','records','report'])
 assert(presenter.includes("'"+role+"'"),role+' contains an illustrated scene');
assert(presenter.includes("if(report)report.insertBefore")&&presenter.includes("const title=$('#titleScreen .title-visual')"));
assert(presenter.includes("Do not inject visual elements into #outcomeScene"));
assert(!manga.includes('manga-painted-character'),'low-resolution 90px sprite enlargement removed');
assert(manga.includes('manga-illustrated-person'));
const pane=M.markup('quality',['店長「今週は品質重視」','従業員「頑張ります」','常連「おいしい」'],{all:true});
assert.equal((pane.match(/class="manga-panel is-revealed"/g)||[]).length,3);
assert.equal((pane.match(/class="manga-illustrated-person"/g)||[]).length,3);
assert(pane.includes('./assets/portraits-v171.svg#portrait-manager-'));
assert(pane.includes('./assets/manga-cast-v200.svg#manga-worker-'));
for(const file of ['overhaul-v210.css','overhaul-v210.js','assets/manga-cast-v200.svg','assets/portraits-v171.svg'])
 assert(sw.includes("'./"+file+"'"),file+' cached');
assert(sw.includes('okyakusama-v2.1.0-ui-rebuild-cache-1'));
const s=G.initial(21),before=JSON.stringify(s);
M.markup(G.weeklyOffers(s)[0].id,['店長「準備」','従業員「実行」','常連「結果」'],{});
assert.equal(JSON.stringify(s),before,'UI is read-only against game RNG and balances');
console.log('PASS v2.1: all non-outcome surfaces, tappable details, crisp SVG cast and unchanged economy');
