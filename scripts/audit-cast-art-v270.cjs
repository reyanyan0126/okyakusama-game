'use strict';
/* v2.7 art QA. Drafts report missing art honestly; release blocks on any missing art.
 * Node core only, no remote requests, no code execution from artwork metadata.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROLES=Object.freeze(['you','boss','manager','worker','customer']);
const MOODS=Object.freeze(['normal','happy','angry','sad','panic']);
const JPG_MAGIC=[0xff,0xd8];
function dimsPng(buf){
 if(buf.length<33||buf.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||buf.toString('ascii',12,16)!=='IHDR')return null;
 const width=buf.readUInt32BE(16),height=buf.readUInt32BE(20),depth=buf[24],color=buf[25];
 return {width,height,alpha:color===6||color===4,format:'png',depth};
}
function dimsWebp(buf){
 if(buf.length<30||buf.toString('ascii',0,4)!=='RIFF'||buf.toString('ascii',8,12)!=='WEBP')return null;
 const type=buf.toString('ascii',12,16);
 if(type==='VP8X')return {width:1+buf.readUIntLE(24,3),height:1+buf.readUIntLE(27,3),alpha:Boolean(buf[20]&0x10),format:'webp'};
 if(type==='VP8L'&&buf[20]===0x2f){
  const code=buf.readUInt32LE(21);
  return {width:1+(code&0x3fff),height:1+((code>>14)&0x3fff),alpha:Boolean((code>>28)&1),format:'webp'};
 }
 return null; // Require alpha-capable WebP, not old lossy VP8 with opaque background.
}
function inspect(file,settings){
 const ext=path.extname(file).toLowerCase();
 if(!['.png','.webp'].includes(ext))return {ok:false,reason:'PNG/WebP以外の形式'};
 if(!fs.existsSync(file))return {ok:false,reason:'未制作'};
 const bytes=fs.readFileSync(file);
 if(bytes.length>settings.maxFileBytes)return {ok:false,reason:'容量上限を超過'};
 const info=ext==='.png'?dimsPng(bytes):dimsWebp(bytes);
 if(!info)return {ok:false,reason:'形式または画像ヘッダーを認識できません'};
 if(info.width<settings.minWidth||info.height<settings.minHeight)return {ok:false,reason:'解像度不足',...info};
 if(!info.alpha)return {ok:false,reason:'アルファチャンネルがありません',...info};
 return {ok:true,...info,size:bytes.length};
}
function run(root=path.join(__dirname,'..')){
 const config=JSON.parse(fs.readFileSync(path.join(root,'assets/approved-cast-v270/art-manifest.json'),'utf8'));
 assert.deepEqual(config.roles,ROLES);assert.deepEqual(config.moods,MOODS);
 assert(['draft','ready'].includes(config.status),'status must be draft or ready');
 const approved=config.approvedAssets||[];
 const expected=new Set(ROLES.flatMap(role=>MOODS.map(mood=>role+'-'+mood)));
 assert.equal(approved.length,new Set(approved).size,'duplicate approvals forbidden');
 for(const name of approved)assert(expected.has(name),'unknown cast approval '+name);
 const entries=[];
 for(const name of expected){
  const webp=path.join(root,'assets/approved-cast-v270',name+'.webp');
  const png=path.join(root,'assets/approved-cast-v270',name+'.png');
  // No automatic inclusion. Art must exist AND be explicitly approved in the manifest.
  if(!approved.includes(name)){entries.push({name,approved:false,ok:false,reason:'承認待ち'});continue;}
  const picked=fs.existsSync(webp)?webp:png;
  entries.push({name,approved:true,...inspect(picked,config)});
 }
 const complete=entries.every(x=>x.ok)&&Object.values(config.humanReview||{}).every(Boolean);
 const result={status:config.status,complete,approved:entries.filter(x=>x.approved).length,valid:entries.filter(x=>x.ok).length,pending:entries.filter(x=>!x.ok).length,entries};
 if(config.status==='ready'&&!complete)throw Error('本番用の人物原画の検証失敗: '+JSON.stringify(result.entries.filter(x=>!x.ok)));
 return result;
}
if(require.main===module){
 try{
  const r=run();console.log('ART QA v2.7: status='+r.status+', valid='+r.valid+'/25, pending='+r.pending+', productionReady='+r.complete);
  if(r.status==='draft')console.log('NOTICE: This is a draft review. New 25-character art is NOT released.');
 }catch(err){console.error('ART QA FAILED:',err.message);process.exitCode=1;}
}
module.exports={ROLES,MOODS,dimsPng,dimsWebp,inspect,run};
