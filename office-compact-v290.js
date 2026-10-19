/* v2.9 Compact primary office. Secondary KPIs are available on demand.
 * DOM nodes are moved, not cloned or deleted: IDs, live updates and save data stay intact.
 */
(function(root){
'use strict';
function mount(){
 const view=document.getElementById('officeView');
 if(!view||document.getElementById('officeExtraMetricsV290'))return false;
 const main=view.querySelector('.main-column');
 const extra=main?.querySelector('.stats-stack');
 const dashboard=main?.querySelector('.store-dashboard');
 const weather=view.querySelector('#storeWeatherV250');
 if(!main||!extra||!dashboard)return false;
 const container=document.createElement('details');
 container.id='officeExtraMetricsV290';
 container.className='office-extra-metrics-v290';
 const summary=document.createElement('summary');
 summary.textContent='お店の様子と詳しい指標を見る';
 summary.setAttribute('aria-label','店舗情景と詳細な経営指標を展開または閉じる');
 const content=document.createElement('div');content.className='office-extra-metrics-body-v290';
 // The legacy global style forcibly hides .stats-stack with !important.
 // Once moved under the new closed-by-default disclosure, override that rule
 // on the element itself; the native <details> still hides all content closed.
 extra.style.setProperty('display','grid','important');
 extra.style.setProperty('height','auto','important');
 if(weather)content.append(weather);
 content.append(dashboard,extra);
 // The decorative state illustration remains accessible without pushing the
 // critical weekly decision below the visible iPhone screen.
 container.append(summary,content);
 const before=main.querySelector('.news-strip');
 if(before)before.insertAdjacentElement('beforebegin',container);
 else main.append(container);
 return true;
}
root.OfficeCompactV290=Object.freeze({mount});
if(typeof module==='object'&&module.exports)module.exports={mount};
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
})(typeof window!=='undefined'?window:globalThis);
