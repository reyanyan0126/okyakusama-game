/* v0.9.6: Presentation-only visual state; never mutates saved game finances. */
(function(root){'use strict';
const safeNumber=value=>Number.isFinite(Number(value))?Number(value):0;
function describe(s){
 const cash=safeNumber(s.cash),wallet=safeNumber(s.personalCash),rep=safeNumber(s.storeRep),fire=safeNumber(s.fire),sat=safeNumber(s.sat),frust=safeNumber(s.frust);
 const closed=Boolean(s.bankrupt);
 let store='normal';
 if(closed)store='closed';
 else if(fire>=55)store='scandal';
 else if(cash<80000 || rep<28)store='critical';
 else if(cash<170000 || rep<50 || sat<48 || frust>=55)store='quiet';
 else if(cash>=300000 && rep>=68 && sat>=65 && frust<=45)store='busy';
 const rootIssue=s.rootCause==='equipment' && s.rootSolved===false ? 'repair' : 'none';
 const invoiceWeight=(wallet<17000?1:0)+(cash<120000?1:0)+(safeNumber(s.arrears)>0?2:0);
 const bills=Math.max(0,Math.min(3,invoiceWeight));
 const office=wallet>=100000 && cash>=320000 && rep>=58 && !s.personalFailed?'upgraded':'ordinary';
 const devil=Array.isArray(s.pacts)&&s.pacts.length>0;
 const words={closed:'シャッターが下りた',scandal:'抗議の声が店先に',critical:'売り場は閑散としている',quiet:'客足が伸び悩んでいる',normal:'何とか営業を続けている',busy:'常連が戻り、店が賑わう'};
 let note='現場：'+words[store];
 if(store!=='closed'&&store!=='scandal'&&s.rootSolved===true&&s.rootCause&&s.rootCause!=='legacy')note+='・改善が効いている';
 if(closed)note+='。再建は失敗';
 return {store,bills,office,devil,rootIssue,note,description:'現場は'+words[store]+'。'+(bills>=2?'事務所には未払い請求書が積み上がっている。':'')+(devil?'悪魔の契約が有効。':'')+(office==='upgraded'?'事務所に観葉植物が置かれている。':'')};
}
const exported={describe};
if(typeof module!=='undefined'&&module.exports)module.exports=exported;
root.OfficeScene=exported;
})(typeof window!=='undefined'?window:globalThis);