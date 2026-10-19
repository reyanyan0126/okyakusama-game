'use strict';
/* v3.0 art handoff validator. Verifies candidate bytes, NOT artistic approval.
 * Never writes art-manifest.json or changes production assets. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const QA=require('./audit-cast-art-v270.cjs');
const CHECKS=['identity','expressions','style','anatomy','transparentBackground','phoneLegibility'];
const EXPECTED=new Set(QA.ROLES.flatMap(role=>QA.MOODS.map(mood=>role+'-'+mood)));

function verifyProposal(root,proposalPath,candidateDir){
 const settings=JSON.parse(fs.readFileSync(path.join(root,'assets/approved-cast-v270/art-manifest.json'),'utf8'));
 const proposal=JSON.parse(fs.readFileSync(proposalPath,'utf8'));
 assert.equal(proposal.reviewOnly,true,'reviewOnly must be true');
 assert.equal(proposal.status,'draft','only draft review proposals may be imported');
 assert.deepEqual(proposal.approvedAssets,[],'proposals must not contain production approvals');
 assert.deepEqual(proposal.roles,QA.ROLES,'cast IDs must match');
 assert.deepEqual(proposal.moods,QA.MOODS,'expression IDs must match');
 assert(Array.isArray(proposal.reviewItems),'reviewItems must be an array');
 assert(Array.isArray(proposal.proposedAssets),'proposedAssets must be an array');
 const rows=new Map();
 for(const item of proposal.reviewItems){
  assert(item&&typeof item==='object'&&EXPECTED.has(item.name),'unknown character/expression');
  assert(!rows.has(item.name),'duplicate review slot '+item.name);
  assert(Number.isInteger(item.width)&&Number.isInteger(item.height)&&Number.isInteger(item.bytes),'invalid image measurements');
  assert(typeof item.sha256==='string'&&/^[0-9a-f]{64}$/.test(item.sha256),'missing SHA-256 for '+item.name);
  assert(item.checks&&typeof item.checks==='object','missing manual checks for '+item.name);
  rows.set(item.name,item);
 }
 const requested=new Set();
 for(const name of proposal.proposedAssets){
  assert(EXPECTED.has(name)&&!requested.has(name),'invalid/duplicate proposed image '+name);
  requested.add(name);
  const item=rows.get(name);
  assert(item&&CHECKS.every(key=>item.checks[key]===true),'unchecked review proposal '+name);
 }
 const results=[];
 for(const name of requested){
  const item=rows.get(name),possible=['png','webp'].map(ext=>path.join(candidateDir,name+'.'+ext));
  const found=possible.filter(fs.existsSync);
  if(found.length!==1){results.push({name,ok:false,reason:found.length?'PNG/WebPが重複':'候補原画が見つかりません'});continue;}
  const bytes=fs.readFileSync(found[0]),digest=crypto.createHash('sha256').update(bytes).digest('hex');
  if(digest!==item.sha256){results.push({name,ok:false,reason:'SHA-256不一致（審査後に画像が変更）'});continue;}
  const inspected=QA.inspect(found[0],settings);
  if(!inspected.ok){results.push({name,ok:false,reason:inspected.reason});continue;}
  if(item.width!==inspected.width||item.height!==inspected.height||item.bytes!==bytes.length){
   results.push({name,ok:false,reason:'画像の寸法・容量が審査時と異なります'});continue;
  }
  results.push({name,ok:true,reason:'候補ファイル一致・最終目視承認待ち'});
 }
 return {proposalCount:requested.size,matching:results.filter(x=>x.ok).length,
  rejected:results.filter(x=>!x.ok).length,releaseReady:false,results};
}
if(require.main===module){
 try{
  const [proposal,candidateDir]=process.argv.slice(2);
  if(!proposal||!candidateDir)throw Error('使い方: node scripts/verify-art-review-v300.cjs <proposal.json> <候補画像ディレクトリ>');
  const result=verifyProposal(path.join(__dirname,'..'),path.resolve(proposal),path.resolve(candidateDir));
  console.log(JSON.stringify(result,null,2));
  if(result.rejected)process.exitCode=1;
 }catch(err){console.error('REVIEW VERIFICATION FAILED:',err.message);process.exitCode=1;}
}
module.exports={CHECKS,verifyProposal};
