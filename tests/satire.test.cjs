const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),G=require('../engine');
const c={window:{}};vm.runInNewContext(fs.readFileSync('pixel-story-copy.js','utf8'),c);const C=c.window.PixelCopy;
for(const a of G.ACTIONS){assert(C.SATIRE[a.id],a.id);assert(C.REACTIONS[a.id].includes(C.SATIRE[a.id].public));const h={actionId:a.id,performanceTier:'failure'},before=JSON.stringify(h);assert(C.resultSatire(h).includes(C.SATIRE[a.id].boss));assert.equal(JSON.stringify(h),before);assert.notEqual(C.resultSatire(h),C.resultSatire({...h,performanceTier:'great'}));}
assert.equal(C.PROLOGUE.length,7);assert(!C.PROLOGUE[5].text.includes('19万5'));console.log('PASS satire: all 53 policies, public reactions, outcome variants, no input mutation');
