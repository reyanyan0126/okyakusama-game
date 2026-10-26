const fs=require('fs'),crypto=require('crypto');
const base='https://reyanyan0126.github.io/okyakusama-game/';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{for(let attempt=0;attempt<30;attempt++){
 try{let matches=true;for(const f of ['app.js','index.html','sw.js','management.js','engine.js','finance.js']){const r=await fetch(base+f+'?release='+process.env.GITHUB_SHA,{signal:AbortSignal.timeout(15000)});if(!r.ok||hash(Buffer.from(await r.arrayBuffer()))!==hash(fs.readFileSync(f))){matches=false;break;}}
 if(matches){console.log('PASS GitHub Pages serves exact committed HTML, controller and service worker');return;}
 }catch(e){console.log('Waiting for Pages:',e.message);}
 console.log('Pages deployment pending',attempt+1);await new Promise(r=>setTimeout(r,20000));
}throw Error('GitHub Pages did not publish expected release in time');})().catch(e=>{console.error(e);process.exit(1)});
