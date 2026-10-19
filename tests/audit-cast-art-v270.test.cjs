'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const QA=require('../scripts/audit-cast-art-v270.cjs');
const r=QA.run();assert.equal(r.status,'draft');
assert.equal(r.valid+r.pending,25,'Honest count: 5 actors x 5 expressions');
assert.equal(r.complete, r.valid===25 && r.status==='ready','Draft must never claim a completed release');
assert.deepEqual(QA.ROLES,['you','boss','manager','worker','customer']);
assert.deepEqual(QA.MOODS,['normal','happy','angry','sad','panic']);
const tiny=Buffer.alloc(50);Buffer.from('89504e470d0a1a0a','hex').copy(tiny);tiny.write('IHDR',12);
tiny.writeUInt32BE(1024,16);tiny.writeUInt32BE(1280,20);tiny[24]=8;tiny[25]=6;
assert.deepEqual(QA.dimsPng(tiny),{width:1024,height:1280,alpha:true,format:'png',depth:8});
const bad=Buffer.from(tiny);bad[25]=2;assert.equal(QA.dimsPng(bad).alpha,false);
const webp=Buffer.alloc(40);webp.write('RIFF',0);webp.write('WEBP',8);webp.write('VP8X',12);webp[20]=0x10;webp.writeUIntLE(1023,24,3);webp.writeUIntLE(1279,27,3);
assert.equal(QA.dimsWebp(webp).width,1024);
assert.equal(QA.dimsWebp(webp).height,1280);
assert.equal(QA.dimsWebp(webp).alpha,true);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'art-audit-'));
try{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/approved-cast-v270/art-manifest.json'),'utf8'));
 manifest.status='ready';manifest.approvedAssets=['you-normal'];
 const assetDir=path.join(temp,'assets/approved-cast-v270');
 fs.mkdirSync(assetDir,{recursive:true});
 fs.writeFileSync(path.join(assetDir,'art-manifest.json'),JSON.stringify(manifest));
 assert.throws(()=>QA.run(temp),/検証失敗/,'cannot release 1 of 25 art samples');

 // The release audit must enforce the SAME 4:5 ratio as the local review UI.
 const sample=path.join(assetDir,'you-normal.png');
 fs.writeFileSync(sample,tiny);
 assert.equal(QA.inspect(sample,manifest).ok,true);
 const stretched=Buffer.from(tiny);stretched.writeUInt32BE(1600,20);
 fs.writeFileSync(sample,stretched);
 assert.match(QA.inspect(sample,manifest).reason,/縦横比/);
 fs.writeFileSync(sample,tiny);

 // A full set of candidates is still not a release without all six independent approvals.
 manifest.approvedAssets=QA.ROLES.flatMap(role=>QA.MOODS.map(mood=>role+'-'+mood));
 for(const name of manifest.approvedAssets)fs.writeFileSync(path.join(assetDir,name+'.png'),tiny);
 manifest.humanReview={};
 fs.writeFileSync(path.join(assetDir,'art-manifest.json'),JSON.stringify(manifest));
 assert.throws(()=>QA.run(temp),/manualReviewComplete.*false/,'missing review fields reject release');
 manifest.humanReview={identity:true,expressions:true,style:true,anatomy:true,transparentBackground:true,phoneLegibility:true};
 manifest.reviewOnly=true;
 fs.writeFileSync(path.join(assetDir,'art-manifest.json'),JSON.stringify(manifest));
 assert.throws(()=>QA.run(temp),/reviewOnly.*true/,'exported review proposals never become releases');
 delete manifest.reviewOnly;
 fs.writeFileSync(path.join(assetDir,'art-manifest.json'),JSON.stringify(manifest));
 assert.equal(QA.run(temp).complete,true,'all explicit approvals and valid metadata pass');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log('PASS v2.7: production art QC rejects missing, unapproved, undersized or non-alpha artwork');
