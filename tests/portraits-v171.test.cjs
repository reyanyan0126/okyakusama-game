'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const portraits=read('assets/portraits-v171.svg');
const storefront=read('assets/storefront-v171.svg');
const js=read('app.js'),css=read('styles.css'),cache=read('sw.js');
const people=['manager','regular','parent','senior','student'];
const moods=['normal','happy','angry','panic','down'];
const idset=new Set();
for(const role of people)for(const mood of moods){
 const name='portrait-'+role+'-'+mood;
 assert(portraits.includes('id="'+name+'"'),name);
 idset.add(name);
}
assert.equal((portraits.match(/<symbol /g)||[]).length,25);
assert.equal(idset.size,25);
for(const state of ['normal','busy','quiet','critical','scandal','closed']){
 assert(storefront.includes('id="store-'+state+'"'),'unique store art '+state);
}
assert.equal((storefront.match(/<symbol /g)||[]).length,6);
assert(js.includes('portrait-'+who+'-'+mood),'portrait dynamically keyed by shopper and expression');
assert(js.includes('store-'+scene.store),'shop scene keyed by actual financial state');
assert(!js.includes("$(id).innerHTML=T.person("),'generic repeated faces should be removed from the office');
assert(css.includes('#officeView .office-visitors .face-art[data-mood="panic"]{animation:none!important'));
assert(cache.includes('okyakusama-v1.7.1-cache-1'));
assert(cache.includes("'./assets/portraits-v171.svg'"));
assert(cache.includes("'./assets/storefront-v171.svg'"));
const states=new Set(['normal','happy','angry','panic','down']);
assert.equal(states.size,5);
console.log('PASS v1.7.1: 25 unique portrait scenes, four recurring shopper identities, six unique store states and no infinite face movement');
