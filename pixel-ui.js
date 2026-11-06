/* Presentation components only. No gameplay mutations. */
(function (root) {
  "use strict";
  const esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const money = (n) => Number(n || 0).toLocaleString("ja-JP") + "円";
  const pad = n => String(n).padStart(2, "0");
  function art(group, index, columns, fallback, attributes) {
    const row = pad(Math.floor((index - 1) / columns) + 1);
    const col = pad((index - 1) % columns + 1);
    return `<img src="assets/work-import/${group}/${group}_${row}_${col}.png" data-fallback="assets/pixel/${fallback}.svg" ${attributes}>`;
  }
  const symbols = {store:10,wallet:30,people:12,chart:31,document:18,warning:2,tools:11,coin:19,star:32};
  function icon(name, index = symbols[name]) {
    const attrs = 'class="pixel-icon" width="16" height="16" alt=""';
    return index ? art("icons", index, 8, "icon-" + name, attrs) : `<img src="assets/pixel/icon-${name}.svg" ${attrs}>`;
  }
  const policySymbols = {raise:19,lower:25,shrink:28,cheap:22,quality:24,staff:7,explain:1,sale:15,points:32,pop:14,tasting:23,local:29,restorestaff:12,apology:6,recall:27,blame:5,loyalty:26,stamp:17,audit:18,maintenance:21,loan:30,airtax:3,photo:9,ceocut:16,bills:20,apologybot:1,fix_equipment:11,fix_people:8,fix_fans:4};
  const policyIcon = id => icon("document", policySymbols[id] || 18);
  const sceneLabels = ["夜の事務所","レジでの接客","商品の品出し","売場の清掃","経営会議","売場への申し入れ","ネットでの炎上","混雑するレジ","資金不足","再建の成功","閉店","店頭のスタッフ"];
  function scene(index, fallback = "scene-office") {
    return art("scenes", index, 4, fallback, `class="event-art" width="128" height="128" alt="${sceneLabels[index-1]}"`);
  }
  const canon = root.CharacterCanon || (typeof require === "function" ? require("./character-canon") : null);
  // Fixed artwork observations, not personality inferred from age, body or gender.
  const guestMoods = ["normal","happy","happy","normal","normal","normal","normal","happy","happy","happy","happy","normal","happy","happy","sad","normal","happy","angry","happy","normal","normal","normal","normal","normal","sad","anxious","sleeping","angry","normal","happy","normal","normal","normal","normal","normal","normal","normal","normal","happy","happy"];
  const customerProfiles = guestMoods.map((mood,i)=>Object.freeze({id:`guest-${i+1}`,index:i+1,mood,role:'買い物客',speech:'発言画像として自動割当しない',action:i===23?'スマホで買い物メモ確認中':i===26?'買い物の途中で休憩中':i===21?'商品情報を確認中':'商品を選んでいる',portrait:false}));
  function guests(s, context="shopping") {
    if(s.bankrupt || context==="news" || context==="voice")return "";
    const week=Math.max(1,s.lastResult?.week||s.week||1);
    const wanted=s.frust>=60?'angry':s.sat>=70?'happy':'normal';
    const pool=customerProfiles.filter(x=>x.mood===wanted);
    const offset=(week-1)%pool.length;
    const count=context==='queue'&&s.staff<45?2:1;
    return `<div class="shop-guests" data-purpose="${context}">${Array.from({length:count},(_,i)=>{
      const g=pool[(offset+i)%pool.length],action=context==='queue'?'会計を待っている':g.action;
      return `<figure class="guest-task" data-customer-id="${g.id}" data-action="${action}">${art('customers',g.index,8,'customer-'+(wanted==='angry'?'angry':wanted==='happy'?'happy':'normal'),`class="guest" data-guest="${g.id}" alt="来店客・${action}"`)}<figcaption>${esc(action)}</figcaption></figure>`;
    }).join('')}</div>`;
  }
  const names = {
    you: "あなた",
    boss: "社長",
    manager: "店長",
    worker: "従業員",
    customer: "森さん",
    devil: "悪魔",
  };
  const moods = {normal:"平常",happy:"喜び",angry:"怒り",confused:"困惑",surprised:"驚き",sad:"落胆",anxious:"焦り",smug:"不敵な笑み"};
  const character = (role = "you", mood = "normal", face = false, speaking = false) => {
    if (!names[role] || !moods[mood]) return "";
    const portraitRow = {boss:1,worker:2,customer:3,devil:4}[role];
    if (face && portraitRow) {
      const expression = Object.keys(moods).indexOf(mood);
      return art("portraits", (portraitRow-1)*8+expression+1, 8, role+"-"+mood+(speaking?"-speaking":"-face"), `class="portrait" width="64" height="64" alt="${names[role]}・${moods[mood]}"`);
    }
    const img = `<img class="${face ? "portrait" : "character"}" src="assets/cast/${role}-${mood}${face ? "-face" : ""}.png" width="${face ? 64 : 96}" height="${face ? 64 : 160}" alt="${names[role]}・${moods[mood]}">`;
    return face ? img : `<figure class="cast-member" data-role="${role}" data-mood="${mood}">${img}<figcaption><b>${names[role]}</b><span>${moods[mood]}</span></figcaption></figure>`;
  };
  // Pure visual state: critical conditions take precedence over a good last week.
  function stateMood(s, role) {
    if (s.bankrupt || s.personalFailed) return "sad";
    if (s.cash < 85000) return "anxious";
    if (s.fire >= 50) return role === "customer" ? "angry" : "anxious";
    if (role === "worker" || role === "manager") {
      if (s.workforce?.fatigue >= 65 || s.workforce?.morale <= 35) return "sad";
      if (s.staff < 45) return "confused";
      if (s.workforce?.morale >= 80 && s.workforce?.fatigue <= 35) return "happy";
    }
    if (role === "customer") return s.frust >= 60 ? "angry" : s.sat >= 75 ? "happy" : "normal";
    if (role === "devil") return s.pactCount > 0 ? "smug" : "normal";
    if (role === "boss" && s.lastResult?.profit > 0) return "happy";
    return "normal";
  }
  const storeState = (s) =>
    s.bankrupt
      ? "closed"
      : s.fire >= 50
        ? "fire"
        : s.cash < 85000
          ? "crisis"
          : s.staff < 45
            ? "shortstaff"
            : s.sat >= 70
              ? "busy"
              : "normal";
  function actor(role, mood, action, prop=18) {
    if(!action || !names[role] || !moods[mood])return "";
    return `<div class="actor-task" data-action="${esc(action)}">${character(role,mood).replace(`<span>${moods[mood]}</span>`, `<span>${esc(action)}</span>`)}<div class="task-prop" aria-hidden="true">${icon('document',prop)}</div></div>`;
  }
  function station(place,content){return `<section class="station"><h3>${esc(place)}</h3>${content}</section>`;}
  function activity(s,phase=1){
    if(s.bankrupt)return {role:'manager',mood:'sad',action:'閉店作業中',place:'店頭',prop:13,line:'最後の棚を片付けます。社長にも来ていただきます。'};
    if(phase===0)return {role:'worker',mood:stateMood(s,'worker'),action:'開店準備中',place:'売場',prop:28,line:'品出しから始めます。応援の方は来ていますか。'};
    if(phase>=2)return {role:'manager',mood:stateMood(s,'manager'),action:phase===2?'売上集計中':'閉店点検中',place:'事務所',prop:19,line:'帳簿を確認します。今日の頑張りが残っていますように。'};
    if(s.workforce?.fatigue>=65)return {role:'worker',mood:'sad',action:'交代で休憩中',place:'休憩室',prop:8,line:'少し座らせてください。笑顔も立ち仕事なんです。'};
    if(s.staff<45)return {role:'manager',mood:'anxious',action:'レジ応援中',place:'レジ',prop:16,line:'私もレジに入ります。シフト表だけでは袋を詰められませんから。'};
    if(s.fire>=50)return {role:'manager',mood:'anxious',action:'問い合わせ対応中',place:'事務所',prop:20,line:'電話が鳴っています。今度は説明できる答えをください。'};
    if(s.cash<85000)return {role:'manager',mood:'anxious',action:'支払い確認中',place:'事務所',prop:18,line:'請求書を確認しています。励ましでは振り込めませんね。'};
    if(s.frust>=60)return {role:'worker',mood:'confused',action:'商品の説明中',place:'売場',prop:1,line:'商品のことを聞かれています。広告と同じ説明で大丈夫ですか。'};
    if(s.sat>=70)return {role:'worker',mood:'happy',action:'レジ対応中',place:'レジ',prop:16,line:'また来ると言っていただけました。次も私たちがいれば、ですけど。'};
    return {role:'worker',mood:stateMood(s,'worker'),action:s.quality<45?'商品点検中':'品出し中',place:'売場',prop:28,line:s.quality<45?'売場の商品を確認しています。写真だけ良くても困りますから。':'棚を補充しています。売る分は写真の外にも必要ですから。'};
  }
  function floor(s,phase=1){const a=activity(s,phase);const shopper=phase===1&&!s.bankrupt&&s.cash>=85000&&s.fire<50;
    return `<div class="store-floor" data-store-state="${storeState(s)}">${station(a.place,actor(a.role,a.mood,a.action,a.prop))}${shopper?station(s.staff<45||s.sat>=70?'レジ前':'商品棚',guests(s,s.staff<45||s.sat>=70?'queue':'shopping')):station('現場から',`<p>${esc(a.line)}</p>`)}</div>`;
  }
  const store = (s, large=false) => large
    ? `<div class="store-sign"><span>モグモグマート</span><p>売場を守るか、社長の顔を立てるか。</p></div>`
    : floor(s);
  function prologueScene(index){
    const rows=[['you','sad','請求書を確認中',18,'雑居ビルの事務所'],['you','sad','養育費の支払日を確認中',17,'事務所の手帳'],['you','surprised','電話を受けている',20,'事務所'],['manager','anxious','再建を電話で依頼中',20,'店舗の事務所'],['manager','sad','売場を案内中',27,'商品棚'],['boss','smug','再建契約を提示中',18,'契約の打ち合わせ'],['devil','smug','取引を持ちかけている',18,'夜の事務所']];
    const [role,mood,action,prop,place]=rows[index];return station(place,actor(role,mood,action,prop));
  }
  const specialProfiles=[{id:'mori',role:'customer',row:1,habit:'いつもの商品を確かめる'},{id:'regular-2',row:2,habit:'商品の置き場所を尋ねる'},{id:'regular-3',row:3,habit:'まとめ買いの在庫を尋ねる'},{id:'regular-4',row:4,habit:'買い物メモを確認する'}];
  function visitor(s){
    const p=specialProfiles[(Math.max(1,s.week)-1)%4],mood=s.frust>=60?'angry':s.sat>=70?'happy':'normal';
    const line=p.id==='mori'?(s.frust>=60?'この前より待つようになったね。帰る前に買えるかしら。':s.sat>=70?'いつもの品があって助かったよ。また寄るね。':'いつもの品を見に来たよ。今日もあるかね。'):p.row===2?'いつもの商品の場所を教えてください。棚が変わったようですね。':p.row===3?'いつもの品をまとめて買いたいんです。在庫はありますか。':'メモの品を探しています。広告と同じものはどちらですか。';
    if(p.id==='mori')return dialogue('customer',line,mood);
    const index=(p.row-1)*4+({normal:1,happy:2,angry:3}[mood]);
    return `<div class="dialogue" data-role="${p.id}" data-mood="${mood}" data-action="${p.habit}">${art('special_customers',index,4,'customer-'+mood,`class="portrait" alt="常連客・${p.habit}"`)}<div><div class="speaker"><strong>常連客 ${p.row}</strong><span>${p.habit}</span></div><p>${esc(line)}</p></div></div>`;
  }
  const meter = (label, n) =>
    `<label class="meter-label">${esc(label)} <b>${n}/100</b><meter min="0" max="100" value="${n}">${n}</meter></label>`;
  const delta = (label, n, unit = "円") =>
    `<div class="delta"><small>${esc(label)}</small><strong class="${n > 0 ? "positive" : n < 0 ? "negative" : ""}">${n > 0 ? "↑ +" : n < 0 ? "↓ −" : "±"}${Math.abs(n || 0).toLocaleString("ja-JP")}<small>${unit}</small></strong></div>`;
  function emotion(text, fallback="normal") {
    if (/休憩をください|倒れ|つら|寂し|後始末/.test(text)) return "sad";
    if (/驚|びっくり|まさか/.test(text)) return "surprised";
    if (/ふざけ|逃げるな|寄こせ|黙れ|責任にするな/.test(text)) return "angry";
    if (/ありがとう|うれし|大成功|助かった|また寄る/.test(text)) return "happy";
    if (/困|厳しい|分から|どうし|足りません/.test(text)) return "confused";
    return moods[fallback] ? fallback : "normal";
  }
  function bubble(role, text, mood, label = names[role]) {
    if(!text.trim())return "";
    const image=role?character(role,mood,true,true):"";
    return `<div class="dialogue${role?'':' anonymous'}" data-role="${role||'anonymous'}" data-mood="${mood}" data-action="発言中">${image}<div><div class="speaker"><strong>${esc(label)}</strong><span class="emotion">${role?'発言中':'寄せられた声'}</span></div><p>${esc(text)}</p></div></div>`;
  }
  function dialogue(role, text, mood = "normal", statePriority = false) {
    text = root.PlainCopy ? root.PlainCopy.text(text) : canon.rewrite(text);
    const parts=canon.split(text);
    if(!parts.some(p=>p.speaker))return names[role]?bubble(role,text,moods[mood]?mood:'normal'):`<p>${esc(text)}</p>`;
    return `<div class="conversation">${parts.map(p=>p.speaker?bubble(p.role,p.text,statePriority&&p.role===role?mood:emotion(p.text,p.role===role?mood:'normal'),p.speaker):p.text.replace(/[。・\s]/g,'')?`<p class="dialogue-aside">${esc(p.text)}</p>`:'').join('')}</div>`;
  }
  function narrative(text) {
    text = root.PlainCopy ? root.PlainCopy.text(text) : canon.rewrite(text);
    return canon.split(text).some(p=>p.speaker)?dialogue(null,text):`<p>${esc(text)}</p>`;
  }
  const risk = (n) =>
    `${icon("warning")}炎上 ${n >= 0.17 ? "高" : n >= 0.08 ? "中" : "低"} <small>${Math.round(n * 100)}%</small>`;
  const details = (title, content, id = "") =>
    `<details${id ? ` id="${esc(id)}"` : ""}><summary>${esc(title)}</summary><div class="detail-body">${content}</div></details>`;
  const costs = {
    explain: 10000,
    sale: 12000,
    points: -16000,
    pop: 23000,
    tasting: 17000,
    local: 11000,
    restorestaff: 8000,
    apology: 18000,
    recall: 43000,
    blame: -24000,
    loyalty: 10000,
    stamp: 9500,
    audit: 11000,
    maintenance: 26000,
    airtax: -18000,
    photo: 17000,
    ceocut: -25000,
    bills: -13000,
    apologybot: 5000,
    fix_equipment: 30000,
    fix_people: 27000,
    fix_fans: 24000,
  };
  const cost = (G, id) => G.STORIES.POLICIES_BY_ID[id]?.cost ?? costs[id] ?? 0;
  const costLabel = (G, id) => {
    const n = cost(G, id);
    return n < 0 ? "削減目安 " + money(-n) : "施策費 " + money(n);
  };
  const api = {
    esc,
    money,
    icon,
    character,
    moods,
    stateMood,
    scene, guests, policyIcon, actor, station, activity, floor, prologueScene, visitor, customerProfiles, specialProfiles,
    storeState,
    store,
    meter,
    delta,
    dialogue,
    narrative,
    risk,
    details,
    cost,
    costLabel,
  };
  root.PixelUI = api;
  if (typeof module === "object") module.exports = api;
})(typeof window === "undefined" ? globalThis : window);
