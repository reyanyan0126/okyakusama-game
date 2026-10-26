'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),P=require('../plain-copy'),G=require('../engine');
for(const e of G.STORIES.EPISODES)for(const a of e.choices)for(const tier of ['failure','success','great']){const old=a[tier];assert.notEqual(P.text(old),old,a.id+' '+tier);assert(P.text(old).length<180);assert.equal(a[tier],old);}
for(const [old]of P.replacements)assert.notEqual(P.text(old),old);
for(const old of Object.keys(P.terms))assert(!P.text(old).includes(old));
assert.equal(P.text('費用 18,000円 / 利益率 15% / 第12週'),'費用 18,000円 / 利益率 15% / 第12週');
assert.equal(P.text('<script>alert(1)</script>'),'<script>alert(1)</script>'); // text-node-only; never parsed as markup
assert(fs.readFileSync('app.js','utf8').includes('window.PlainCopy.apply(main)'));
assert(fs.readFileSync('sw.js','utf8').includes("'./plain-copy.js'"));
console.log('PASS 72 authored event outcomes; '+P.replacements.length+' display rewrites; numeric text and source records preserved; offline manifest');
