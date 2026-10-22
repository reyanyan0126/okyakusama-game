const CACHE_NAME = 'okyakusama-v2.17.0-ui-audit-cache-2';
const ASSETS = ['./','./index.html','./ui.css','./styles.css','./overhaul-v210.css','./scene-art-v211.js','./scene-art-v211.css','./cast-director-v220.js','./cast-director-v220.css','./cast-cinema-v260.js','./cast-cinema-v260.css','./decision-ledger-v230.js','./decision-ledger-v230.css','./store-scenes-v250.js','./store-scenes-v250.css','./layout-repair-v290.css','./compact-home-v214.css','./ui-foundations-v215.css','./gameplay-unified-v215.css','./art-consistency-v215.css','./screen-structure-v216.css','./home-rebuild-v216.css','./cast-gallery-v2100.html','./protagonist-preview-v2101.html','./cast-gallery-v2100.css','./cast-gallery-v2100.js','./assets/cast-gallery-art-v2110.js','./cast-art-v2120.js','./art-review-v280.html','./art-review-v280.css','./art-review-v280.js','./office-compact-v290.js','./assets/store-scenes-v250.svg','./app.js','./engine.js','./stories.js','./finance.js','./scene.js','./assets/storyboards-v150.js','./assets/storyboards-v150.svg','./assets/prologue-v160.svg','./assets/incidents-v160.svg','./assets/policies-v160.svg','./assets/episode-cinema-v170.svg','./assets/office-cinema-v171.svg','./assets/portraits-v171.svg','./manga-v200.js','./policy-symbols-v173.js','./assets/policy-icons-v173.svg','./assets/manga-cast-v200.svg','./assets/manga-painted-cast-v173.webp','./assets/root-cinema-v170.svg','./manifest.webmanifest','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('okyakusama-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
// Serve the installed release atomically, including when WebKit is offline.
// A new worker precaches the next release before replacing this cache.
self.addEventListener('fetch', e => {
  const request=e.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(request);
    if(cached)return cached;
    try{return await fetch(request);}
    catch(error){
      if(request.mode==='navigate'){
        const shell=await cache.match('./index.html');
        if(shell)return shell;
      }
      throw error;
    }
  })());
});
