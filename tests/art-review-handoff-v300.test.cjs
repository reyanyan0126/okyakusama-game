'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {verifyProposal,CHECKS}=require('../scripts/verify-art-review-v300.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'portrait-handoff-'));
const assetDir=path.join(root,'assets/approved-cast-v270');
const candidateDir=path.join(root,'candidate');
fs.mkdirSync(assetDir,{recursive:true});fs.mkdirSync(candidateDir);
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/approved-cast-v270/art-manifest.json'),'utf8'));
fs.writeFileSync(path.join(assetDir,'art-manifest.json'),JSON.stringify(manifest));
const png=Buffer.alloc(50);
Buffer.from('89504e470d0a1a0a','hex').copy(png);
png.write('IHDR',12);png.writeUInt32BE(1024,16);png.writeUInt32BE(1280,20);png[24]=8;png[25]=6;
const candidate=path.join(candidateDir,'you-normal.png');
const proposalPath=path.join(root,'proposal.json');
function makeProposal(){
 return {version:'v2.8.0',status:'draft',reviewOnly:true,roles:manifest.roles,moods:manifest.moods,
  approvedAssets:[],proposedAssets:['you-normal'],reviewItems:[{name:'you-normal',width:1024,height:1280,bytes:png.length,
   sha256:crypto.createHash('sha256').update(png).digest('hex'),
   checks:Object.fromEntries(CHECKS.map(k=>[k,true])),proposed:true}]};
}
const verify=doc=>{fs.writeFileSync(proposalPath,JSON.stringify(doc));return verifyProposal(root,proposalPath,candidateDir);};
try{
 fs.writeFileSync(candidate,png);
 let doc=makeProposal();
 let result=verify(doc);
 assert.equal(result.matching,1);
 assert.equal(result.rejected,0);
 assert.equal(result.releaseReady,false,'review does not approve or publish');
 assert.equal(fs.existsSync(path.join(assetDir,'you-normal.png')),false,'review must not copy into approved production');
 fs.writeFileSync(candidate,Buffer.concat([png,Buffer.from('changed')]));
 result=verify(doc);assert.equal(result.matching,0);
 assert.match(result.results[0].reason,/SHA-256/,'editing image after review is rejected');
 fs.writeFileSync(candidate,png);
 doc.reviewItems[0].checks.identity=false;
 assert.throws(()=>verify(doc),/unchecked/,'all six checks required');
 doc=makeProposal();doc.status='ready';
 assert.throws(()=>verify(doc),/draft/,'ready manifest cannot be imported');
 doc=makeProposal();doc.approvedAssets=['you-normal'];
 assert.throws(()=>verify(doc),/production approvals/,'cannot confuse review with release');
 doc=makeProposal();doc.reviewItems[0].name='../unsafe';
 assert.throws(()=>verify(doc),/unknown/,'path traversal rejected');
 doc=makeProposal();fs.writeFileSync(path.join(candidateDir,'you-normal.webp'),png);
 result=verify(doc);assert.match(result.results[0].reason,/重複/,'ambiguous file formats rejected');
 console.log('PASS v3.0 art review handoff: SHA-256 binding, changed file rejection, explicit manual checks, draft-only, no production writes');
}finally{fs.rmSync(root,{recursive:true,force:true});}
