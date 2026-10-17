'use strict';
const assert = require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'HTML id duplicates');
class Element {
  constructor(id){this.id=id;this.hidden=true;this.textContent='';this.innerHTML='';this.dataset={};this.style={};this.events={};this.attrs={};this.disabled=false;this.classList={add(){},remove(){},toggle(){}};this.offsetWidth=200;this.files=[];}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn)}
  dispatch(type,event={}){for(const fn of this.events[type]||[])fn({target:this,...event})}
  setAttribute(k,v){this.attrs[k]=v}
  getAttribute(k){return this.attrs[k]}
  querySelector(){return new Element('child')}
  focus(){}
  click(){this.dispatch('click')}
}
const nodes=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
nodes.weekScene.hidden=true;nodes.modal.hidden=true;nodes.historyPanel.hidden=true;
const tabs=['office','voice','records'].map(n=>{const e=new Element('tab-'+n);e.dataset.screen=n;return e});
const document={readyState:'complete',body:new Element('body'),querySelectorAll(selector){if(selector==='.game-tab')return tabs;if(selector==='.hint')return [];return [];},querySelector(selector){if(selector==='.stats-stack')return new Element('stack');return new Element('query')},getElementById(id){return nodes[id]||(nodes[id]=new Element(id))},addEventListener(){},createElement(){return new Element('created')}};
const state={};
const localStorage={getItem(k){return state[k]??null},setItem(k,v){state[k]=v}};
let warnings=[];
const context={document,localStorage,console:{warn:(...x)=>warnings.push(x),log:()=>{}},window:{matchMedia:()=>({matches:true}),setTimeout:fn=>{fn();return 1}},Date,Math,JSON,Number,String,Array,Set,Object,URL:{},confirm:()=>true,location:{protocol:'file:',hostname:''},navigator:{},setTimeout:(fn)=>{fn();return 1},clearTimeout:()=>{}};
context.window=context;context.matchMedia=()=>({matches:true});vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../engine.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../finance.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../scene.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
assert.equal(nodes.titleScreen.hidden,false,'title should show on first load');
assert.equal(nodes.app.hidden,true,'game should not display behind title');
nodes.titleStart.click();assert.equal(nodes.contractsScreen.hidden,false,'inbox after start');
assert.equal(nodes.titleScreen.hidden,true);
nodes.acceptMarket.click();assert.equal(nodes.prologueScreen.hidden,false,'intro after accepting contract');
for(let step=2;step<=7;step++){nodes.prologueNext.click();assert.equal(nodes.prologueCounter.textContent,`0${step} / 07`);}
nodes.prologueNext.click();assert.equal(nodes.app.hidden,false,'game after intro');
assert.equal(nodes.officeView.hidden,false);
assert.equal(nodes.bossFace.dataset.mood,'normal');assert.equal(nodes.buyerFace.dataset.mood,'normal');
assert.ok(nodes.actions.innerHTML.includes('action-option'));
assert.match(nodes.actionHeading.textContent,/最初の依頼/);
assert.match(nodes.goalChip.textContent,/255\.0万/);
assert.equal(nodes.proposalSheet.hidden,true);
nodes.openProposals.click();assert.equal(nodes.proposalSheet.hidden,false);
assert.match(nodes.proposalBudget.textContent,/店/);
assert.match(html,/契約条件/);
nodes.advanceButton.click();assert.equal(nodes.proposalSheet.hidden,true);assert.equal(nodes.reportScene.hidden,false,'report should open after week');
assert.ok(nodes.reportTakeaway.textContent.length>0);
assert.match(nodes.reportCash.innerHTML,/万円/);
assert.ok(nodes.reportReputationChange.textContent.length>0);
assert.match(nodes.reportGoal.textContent,/契約目標/);
assert.match(nodes.reportNext.textContent,/次の相談/);
if(nodes.reportContinue.disabled)nodes.accidentIgnore.click();
nodes.reportContinue.click();assert.equal(nodes.weekScene.hidden,true);
assert.equal(JSON.parse(state['okyakusama.save.v1']).week,2);
tabs[2].click();nodes.backTitle.click();assert.equal(nodes.titleScreen.hidden,false);assert.equal(nodes.titleResume.hidden,false,'resume after progress');
nodes.titleResume.click();assert.equal(nodes.app.hidden,false);assert.equal(nodes.officeView.hidden,false);
for(let i=1;i<30;i++){if(JSON.parse(state['okyakusama.save.v1']).finished)break;nodes.openProposals.click();nodes.advanceButton.click();if(nodes.reportContinue.disabled)nodes.accidentIgnore.click();nodes.reportContinue.click();}
const final=JSON.parse(state['okyakusama.save.v1']);assert.equal(final.finished,true);assert.equal(final.history.length,final.week-1);
console.log('PASS: title→contracts→prologue→client→proposals→budget result→resume→finished campaign');