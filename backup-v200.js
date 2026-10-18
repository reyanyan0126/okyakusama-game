/* Portable collection backup while preserving legacy raw-v1 save imports/exports. */
(function(root){
'use strict';
const G=(typeof module==='object'&&module.exports)?require('./engine.js'):root.GameEngine;
const A=(typeof module==='object'&&module.exports)?require('./achievements-v200.js'):root.GameAchievements;
const SAVE_KEY='okyakusama.save.v1',KIND='okyakusama-portable-backup',VERSION=1;
const known=new Set(A.DEFINITIONS.map(x=>x.id));
function normalizeGallery(g){
 if(!g||g.version!==1||!g.unlocked||typeof g.unlocked!=='object'||Array.isArray(g.unlocked)||!Array.isArray(g.endings))throw Error('実績のバックアップ形式が不正です');
 const result={version:1,unlocked:{},endings:[]};
 for(const [id,flag]of Object.entries(g.unlocked)){
  if(!known.has(id)||flag!==true)throw Error('不正な実績データです');
  result.unlocked[id]=true;
 }
 for(const ending of g.endings){
  if(typeof ending!=='string'||!ending.trim()||ending.length>120)throw Error('不正なエンディング履歴です');
  if(!result.endings.includes(ending))result.endings.push(ending);
 }
 if(result.endings.length>30)throw Error('エンディング履歴が多すぎます');
 return result;
}
function exportFull(campaign,storage){
 G.validateSaved(campaign); // throw before offering a corrupt backup
 return {kind:KIND,backupVersion:VERSION,campaign:JSON.parse(JSON.stringify(campaign)),gallery:normalizeGallery(A.read(storage))};
}
function parse(raw){
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.kind===KIND){
  if(raw.backupVersion!==VERSION)throw Error('対応していないバックアップ形式です');
  return {kind:'full',campaign:G.validateSaved(raw.campaign),gallery:normalizeGallery(raw.gallery)};
 }
 return {kind:'legacy',campaign:G.validateSaved(raw),gallery:null};
}
function mergeGallery(current,incoming){
 const merged=normalizeGallery(current);
 if(incoming){
  const next=normalizeGallery(incoming);
  Object.assign(merged.unlocked,next.unlocked);
  for(const e of next.endings)if(!merged.endings.includes(e))merged.endings.push(e);
  merged.endings=merged.endings.slice(-30);
 }
 return merged;
}
function restore(parsed,storage){
 if(!parsed||!parsed.campaign||!['full','legacy'].includes(parsed.kind))throw Error('復元データが不正です');
 const validated=G.validateSaved(parsed.campaign);
 const merged=parsed.kind==='full'?mergeGallery(A.read(storage),parsed.gallery):null;
 const originalSave=storage.getItem(SAVE_KEY),originalAchievements=storage.getItem(A.KEY);
 const rollback=(key,previous)=>{if(previous===null)storage.removeItem(key);else storage.setItem(key,previous);};
 try{
  storage.setItem(SAVE_KEY,JSON.stringify(validated));
  if(merged)storage.setItem(A.KEY,JSON.stringify(merged));
 }catch(error){
  let failed=false;
  for(const [key,old]of [[SAVE_KEY,originalSave],[A.KEY,originalAchievements]])try{rollback(key,old);}catch(_){failed=true;}
  if(failed)throw Error('書き込み失敗後に元の保存状態へ戻せませんでした。データを確認してください');
  throw Error('バックアップを復元できませんでした: '+(error?.message||'保存エラー'));
 }
 return {campaign:validated,mergedAchievements:!!merged,achievementCount:merged?Object.keys(merged.unlocked).length:null};
}
const api={SAVE_KEY,KIND,VERSION,normalizeGallery,exportFull,parse,mergeGallery,restore};
root.GameBackup=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
