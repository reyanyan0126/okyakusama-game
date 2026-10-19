'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const QA=require('../scripts/audit-cast-art-v270.cjs');
const r=QA.run();assert.equal(r.status,'draft');
assert.equal(r.valid,0,'No original art has been approved yet');
assert.equal(r.pending,25,'Honest count: 5 actors x 5 expressions pending');
assert(!r.complete);
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
 fs.mkdirSync(path.join(temp,'assets/approved-cast-v270'),{recursive:true});
 fs.writeFileSync(path.join(temp,'assets/approved-cast-v270/art-manifest.json'),JSON.stringify(manifest));
 assert.throws(()=>QA.run(temp),/検証失敗/,'cannot release 1 of 25 art samples');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log('PASS v2.7: production art QC rejects missing, unapproved, undersized or non-alpha artwork');
