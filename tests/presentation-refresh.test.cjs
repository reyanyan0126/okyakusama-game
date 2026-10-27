'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),P=require('../plain-copy'),U=require('../pixel-ui');
const line='店長「人手が足りません！」社長「人数は足りてるはずだ、数字では！」';
const html=U.dialogue('boss',line);assert(html.includes('data-role="manager"'));assert(html.includes('data-role="boss"'));assert(html.includes('表にレジを打たせろよ'));assert(html.includes('class="emotion"'));
assert(!U.dialogue('boss','<script>alert(1)</script>').includes('<script>'));
for(const role of ['you','boss','manager','worker','customer','devil'])for(const mood of ['normal','happy','angry','confused','surprised','sad']){const full=fs.readFileSync(`assets/pixel/${role}-${mood}.svg`,'utf8'),face=fs.readFileSync(`assets/pixel/${role}-${mood}-face.svg`,'utf8');assert.equal(full.slice(full.indexOf('<rect')),face.slice(face.indexOf('<rect')));assert(U.character(role,mood).includes('<figcaption>'));assert(U.character(role,mood).includes(`data-mood="${mood}"`));}
assert(U.character('unknown','unknown').includes('you-normal.svg'));
console.log('PASS speaker-separated dialogue, explicit mood/name, escaped content, 36 coherent portrait/full pairs');

assert.equal(U.narrative("営業が終わった。"),"<p>営業が終わった。</p>");
assert(U.narrative(line).includes('data-role="manager"'));
assert(U.dialogue("boss",'店長「黙れ」').includes('data-mood="angry"'));

const nested=U.dialogue('boss','社長「客の「大満足」は載せろ」店長「はい」');
assert(nested.includes('客の「大満足」は載せろ'));assert.equal((nested.match(/class="dialogue"/g)||[]).length,2);
assert(U.dialogue('boss','社長「未完のセリフ').includes('未完のセリフ'));
