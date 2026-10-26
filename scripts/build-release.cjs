'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const match=sw.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/);if(!match)throw Error('Missing precache manifest');
const assets=vm.runInNewContext(match[1]);
const files=[...new Set(['index.html','sw.js',...assets.map(x=>x==='./'?'index.html':x.replace(/^\.\//,''))])];
fs.mkdirSync(out,{recursive:true});
for(const f of files){if(f.includes('..')||path.isAbsolute(f))throw Error('Unsafe path');const from=path.join(root,f);if(!fs.statSync(from).isFile())throw Error('Missing file '+f);fs.mkdirSync(path.dirname(path.join(out,f)),{recursive:true});fs.copyFileSync(from,path.join(out,f));}
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({version:require('../package.json').version,files},null,2));
console.log('Release',require('../package.json').version,files.length,'files -> dist/');
