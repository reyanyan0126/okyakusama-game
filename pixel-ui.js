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
  function guests(s) {
    const week = Math.max(1, s.lastResult?.week || s.week || 1);
    const seed = (s.rngSeed || 0) >>> 0;
    const first = (seed % 40 + 7 * week) % 40;
    const mood = s.fire >= 50 || s.frust >= 60 ? 3 : s.sat < 45 ? 4 : s.sat >= 70 ? 2 : 1;
    const ids = s.sat >= 70 ? [first, (first + 13) % 40] : [first];
    const visitors = ids.map(i => art("customers", i+1, 8, "customer-normal", `class="guest" data-guest="guest-${i+1}" alt="買い物中のお客様"`));
    const regular = (seed % 4 + week) % 4;
    const expression = ["平常","喜び","怒り","戸惑い"][mood-1];
    visitors.push(art("special_customers", regular*4+mood, 4, "customer-"+["normal","happy","angry","confused"][mood-1], `class="guest" data-guest="regular-${regular+1}" alt="常連客・${expression}"`));
    return `<div class="shop-guests">${visitors.join("")}</div>`;
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
    role = names[role] ? role : "you"; mood = moods[mood] ? mood : "normal";
    const portraitRow = {boss:1,worker:2,customer:3,devil:4}[role];
    if (face && portraitRow) {
      const expression = Object.keys(moods).indexOf(mood);
      return art("portraits", (portraitRow-1)*8+expression+1, 8, role+"-"+mood+(speaking?"-speaking":"-face"), `class="portrait" width="64" height="64" alt="${names[role]}・${moods[mood]}"`);
    }
    const img = `<img class="${face ? "portrait" : "character"}" src="assets/pixel/${role}-${mood}${face ? speaking ? "-speaking" : "-face" : ""}.svg" width="${face ? 64 : 96}" height="${face ? 64 : 160}" alt="${names[role]}・${moods[mood]}">`;
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
  const store = (s, large = false) => {
    const state = storeState(s);
    return `<figure class="store ${large ? "large" : ""}">${scene({closed:11,fire:7,crisis:9,shortstaff:4,busy:8,normal:12}[state],"store-"+state)}</figure>`;
  };
  const meter = (label, n) =>
    `<label class="meter-label">${esc(label)} <b>${n}/100</b><meter min="0" max="100" value="${n}">${n}</meter></label>`;
  const delta = (label, n, unit = "円") =>
    `<div class="delta"><small>${esc(label)}</small><strong class="${n > 0 ? "positive" : n < 0 ? "negative" : ""}">${n > 0 ? "↑ +" : n < 0 ? "↓ −" : "±"}${Math.abs(n || 0).toLocaleString("ja-JP")}<small>${unit}</small></strong></div>`;
  const aliases = {"社長":"boss","店長":"manager","従業員":"worker","社員":"worker","店員":"worker","客":"customer","お客様":"customer","消費者":"customer","常連":"customer","常連客":"customer","森さん":"customer","あなた":"you","悪魔":"devil"};
  function emotion(text, fallback) {
    if (/泣|落ち込|つら|辞め|寂し/.test(text)) return "sad";
    if (/驚|びっくり|まさか/.test(text)) return "surprised";
    if (/黙れ|お前|バカ|ふざけ|逃げるな|するな|じゃねえ|寄こせ/.test(text)) return "angry";
    if (/ありがとう|うれし|喜|大成功|うまい|おいしい/.test(text)) return "happy";
    if (/困|厳しい|分から|どうし|足りません/.test(text)) return "confused";
    return moods[fallback] ? fallback : "normal";
  }
  function bubble(role, text, mood, label = names[role]) {
    return `<div class="dialogue" data-role="${role}" data-mood="${mood}">${character(role,mood,true,true)}<div><div class="speaker"><strong>${esc(label)}</strong><span class="emotion">${moods[mood]}</span></div><p>${esc(text)}</p></div></div>`;
  }
  function dialogue(role, text, mood = "normal", statePriority = false) {
    role = names[role] ? role : "you";
    text = root.PlainCopy ? root.PlainCopy.text(text) : String(text ?? "");
    // Scan balanced Japanese quotes so quoted words inside a line stay intact.
    const pattern = /(社長|店長|従業員|社員|店員|お客様|消費者|常連客|常連|森さん|客|あなた|悪魔)「/g;
    let at=0,html="",m;
    while((m=pattern.exec(text))){
      const begin=pattern.lastIndex;
      let end=begin,depth=1;
      for(;end<text.length;end++){
        if(text[end]==="「")depth++;
        if(text[end]==="」"&&--depth===0)break;
      }
      if(depth!==0)break;
      const prefix=text.slice(at,m.index).replace(/^[。・\s]+|[。・\s]+$/g,"");
      if(prefix)html+=`<p class="dialogue-aside">${esc(prefix)}</p>`;
      const line=text.slice(begin,end),who=aliases[m[1]], feeling=statePriority&&who===role?mood:emotion(line,who===role?mood:"normal");
      html+=bubble(who,line,feeling,m[1]);at=end+1;pattern.lastIndex=at;
    }
    if(!html)return bubble(role,text,mood);
    const tail=text.slice(at).replace(/^[。・\s]+|[。・\s]+$/g,"");
    if(tail)html+=`<p class="dialogue-aside">${esc(tail)}</p>`;
    return `<div class="conversation">${html}</div>`;
  }
  function narrative(text) {
    text = root.PlainCopy ? root.PlainCopy.text(text) : String(text ?? "");
    return /(社長|店長|従業員|社員|店員|お客様|消費者|常連客|常連|森さん|客|あなた|悪魔)「/.test(text) ? dialogue("you",text) : `<p>${esc(text)}</p>`;
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
    scene, guests, policyIcon,
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
