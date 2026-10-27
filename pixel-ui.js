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
  const icon = (name) =>
    `<img class="pixel-icon" src="assets/pixel/icon-${name}.svg" width="16" height="16" alt="">`;
  const names = {
    you: "あなた",
    boss: "社長",
    manager: "店長",
    worker: "従業員",
    customer: "森さん",
    devil: "悪魔",
  };
  const moods = {normal:"平常",happy:"喜び",angry:"怒り",confused:"困惑",surprised:"驚き",sad:"落胆"};
  const character = (role = "you", mood = "normal", face = false) => {
    role = names[role] ? role : "you"; mood = moods[mood] ? mood : "normal";
    const img = `<img class="${face ? "portrait" : "character"}" src="assets/pixel/${role}-${mood}${face ? "-face" : ""}.svg" width="${face ? 32 : 48}" height="${face ? 32 : 64}" alt="${names[role]}・${moods[mood]}">`;
    return face ? img : `<figure class="cast-member" data-role="${role}" data-mood="${mood}">${img}<figcaption><b>${names[role]}</b><span>${moods[mood]}</span></figcaption></figure>`;
  };
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
    return `<figure class="store ${large ? "large" : ""}"><img src="assets/pixel/store-${state}.svg" width="144" height="80" alt="モグモグマート・${{ closed: "閉店", fire: "炎上", crisis: "資金危機", shortstaff: "人手不足", busy: "繁盛", normal: "営業中" }[state]}"></figure>`;
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
    return `<div class="dialogue" data-role="${role}" data-mood="${mood}">${character(role,mood,true)}<div><div class="speaker"><strong>${esc(label)}</strong><span class="emotion">${moods[mood]}</span></div><p>${esc(text)}</p></div></div>`;
  }
  function dialogue(role, text, mood = "normal") {
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
      const line=text.slice(begin,end),who=aliases[m[1]], feeling=emotion(line,who===role?mood:"normal");
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
