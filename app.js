/* Pixel Edition: a single presentation layer over the unchanged v1 save/engine. */
(() => {
  "use strict";
  const G = window.GameEngine,
    U = window.PixelUI,
    T = window.WeekTheater,
    C = window.PixelCopy,
    F = window.FinanceLedger;
  const {
    esc,
    money,
    icon,
    character,
    meter,
    delta,
    dialogue,
    details,
  } = U;
  const KEY = "okyakusama.save.v1",
    main = document.getElementById("main");
  let game,
    screen = "title",
    difficulty = "normal",
    project = null,
    devil = null,
    prologue = 0,
    newsIndex = 0,
    workingTimer,
    workingFrame,
    noticeTimer,
    hasSave = false,
    loadError = false,
    returnScreen = "home";
  try {
    const raw = localStorage.getItem(KEY);
    hasSave = !!raw;
    game = raw ? G.validateSaved(JSON.parse(raw)) : G.initial(Date.now());
  } catch (e) {
    game = G.initial(Date.now());
    loadError = true;
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(game));
      hasSave = true;
      return true;
    } catch (e) {
      notify("保存できません。記録からバックアップしてください。");
      return false;
    }
  }
  function notify(text) {
    const n = document.getElementById("notice");
    n.textContent = text;
    n.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => (n.hidden = true), 7000);
  }
  const button = (id, text, cls = "") =>
    `<button type="button" id="${id}" class="${cls}">${text}</button>`;
  const header = (title, back = "home") =>
    `<header><h1>${esc(title)}</h1><button data-go="${back}" class="quiet">戻る</button></header>`;
  const nav = () =>
    `<nav class="nav" aria-label="ゲーム画面">${[
      ["home", "store", "経営"],
      ["voice", "people", "世論"],
      ["records", "chart", "記録"],
    ]
      .map(
        ([id, i, n]) =>
          `<button data-go="${id}" ${screen === id ? 'aria-current="page"' : ""}>${icon(i)}${n}</button>`,
      )
      .join("")}</nav>`;
  const list = (rows) =>
    `<dl class="number-list">${rows.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl>`;
  main.addEventListener("error", event => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.dataset.fallback) {
      if (/assets\/pixel\/(you|boss|manager|worker|customer|devil)-/.test(img.dataset.fallback)) {
        img.removeAttribute("src");
        delete img.dataset.fallback;
        return;
      }
      img.src = img.dataset.fallback;
      delete img.dataset.fallback;
    }
  }, true);
  function render(html, withNav = false) {
    main.dataset.screen = screen;
    main.dataset.nav = String(withNav);
    main.innerHTML = html + (withNav ? nav() : "");
    // Only single-step reading screens own the bottom action bar.
    // Move the existing button, preserving delegated handlers and game state.
    const readingCTA = {prologue:"prologueNext", working:"workingSkip", outcome:"outcomeNext", news:"newsNext", report:"reportContinue"}[screen];
    const next = !withNav && readingCTA && main.querySelector("#" + readingCTA);
    main.dataset.cta = String(Boolean(next));
    if (next) {
      const bar = document.createElement("div");
      bar.className = "action-bar";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "次の操作");
      bar.append(next);
      main.append(bar);
    }
    window.PlainCopy.apply(main);
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  function go(name) {
    clearTimeout(workingTimer);
    cancelAnimationFrame(workingFrame);
    screen = name;
    (
      ({
        title,
        contracts,
        prologue: showPrologue,
        home,
        choices,
        voice,
        records,
        status,
        finance,
        help,
        report,
        outcome,
        news,
        rescue,
        ending,
        working,
      })[name] || home
    )();
  }
  function title() {
    render(
      `<section class="title"><span class="eyebrow">30週間の経営再建</span><h1><img class="pixel-logo" src="assets/pixel/logo.svg" width="136" height="20" alt="お客様のために。"></h1><p class="tagline">可愛い店で、黒い経営。</p>${scene("title")}<div class="buttons">${button("titleStart", "はじめる", "primary")}${hasSave && !loadError ? button("titleResume", "つづきから") : ""}${button("titleHelp", "遊び方", "quiet")}</div>${loadError ? '<p class="warn">セーブを読み込めませんでした。元データは上書きしていません。記録から書き出して保管できます。</p><button data-go="records">バックアップへ</button>' : ""}<p class="version">PIXEL EDITION · 3.7.0</p></section>`,
    );
  }
  function contracts() {
    render(
      `${header("新しい依頼", "title")}<section class="stack"><div class="panel stack"><h2>モグモグマート</h2>${scene("contracts")}<p class="witness">店長「来月の給料も厳しいんです」</p>${list(
        [
          ["契約期間", "30週間"],
          ["累計利益の目標", money(G.MANAGEMENT.DIFFICULTIES[difficulty].target)],
          ["評判の条件", "50以上"],
          ["店の資金", money(G.MANAGEMENT.DIFFICULTIES[difficulty].cash)],
          ["自分の財布", "2万8,000円"],
        ],
      )}<label>難易度（途中変更不可）<select id="difficulty">${Object.entries(G.MANAGEMENT.DIFFICULTIES).map(([id,d])=>`<option value="${id}" ${difficulty===id?"selected":""}>${d.name}</option>`).join("")}</select></label>${hasSave ? '<p class="warn">新しく始めると現在のセーブを置き換えます。記録画面でバックアップできます。</p>' : ""}${button("acceptMarket", "依頼を受ける", "primary")}</div></section>`,
    );
  }
  function showPrologue() {
    const p = C.PROLOGUE[prologue];
    render(
      `${header("はじまり", "contracts")}<div class="stack"><div class="prologue-figure">${scene("prologue",{step:prologue})}</div><div class="dots" aria-label="${prologue + 1} / 7">${C.PROLOGUE.map((_, i) => `<i class="${i === prologue ? "active" : ""}"></i>`).join("")}</div><div class="panel stack"><small>${esc(p.speaker)}</small><h2>${esc(p.title)}</h2><p>${esc(p.text)}</p></div>${button("prologueNext", prologue === 6 ? "契約を始める" : "次へ", "primary")}</div>`,
    );
  }
  const scene = (phase, options = {}) => window.SceneComposer.render({phase, state:game, ...options});
  const compactYen = n => (n / 10000).toLocaleString("ja-JP",{maximumFractionDigits:1}) + "万円";
  function bossLine(h) {
    const lines = window.CharacterCanon.split(window.PlainCopy.text(C.resultSatire(h)));
    return lines.find(part => part.role === "boss")?.text || "次も頼んだぞ。";
  }
  function home() {
    const brief = G.weeklyBrief(game);

    const quote = window.CharacterCanon.split(window.PlainCopy.text(brief.quote)).find(part => part.speaker);
    const taskTitle = window.PlainCopy.text(brief.title).split(/(?:社長|店長)「/)[0].trim();
    const problemScene = scene("home", {problemId:brief.id, art:brief.art});
    render(
      `<header><span class="brand">モグモグマート</span><span class="week">第${Math.min(game.week, G.campaignWeeks(game))}週 / ${G.campaignWeeks(game)}</span></header><div class="rule"><i style="width:${Math.min(100, ((game.week - 1) / G.campaignWeeks(game)) * 100)}%"></i></div><section class="stack"><div class="stats"><button class="stat" data-finance="store"><span>${icon("store")}店の資金</span><strong>${(game.cash / 10000).toFixed(1)}<small>万円</small></strong></button><button class="stat" data-finance="personal"><span>${icon("wallet")}自分の財布</span><strong>${(game.personalCash / 10000).toFixed(1)}<small>万円</small></strong></button><div class="stat"><span>${icon("heart")}評判</span><strong>${game.storeRep}<small> / 100</small></strong></div></div><article class="task panel"><small>今週の課題</small><h1>${esc(taskTitle)}</h1>${problemScene}${quote ? `<p class="brief-note"><span class="speaker">${esc(quote.speaker)}</span>「${esc(quote.text)}」</p>` : ""}${button("openProposals", game.rescuePending ? "再建を相談する" : game.finished ? "結末を見る" : "作戦を選ぶ", "primary")}</article><div class="home-tools"><button data-go="status" class="quiet">店舗の詳細</button>${game.lastResult ? button("lastReport", "前週の決算", "quiet") : ""}</div></section>`,
      true,
    );
  }
  function forecastPanel() {
    const f=window.DecisionForecast.estimate(G,game,game.selected,{project,devil});
    return `<div class="estimate"><span>利益予測 <b>${compactYen(f.profit.low)}〜${compactYen(f.profit.high)}</b></span><span>炎上目安 <b>${Math.round(G.previewRisk(game,game.selected)*100)}%</b></span></div>`;

  }
  function forecastReview(h) {
    const f=game.forecastHistory?.[h.week] || game.presentation?.forecast;
    if(!window.DecisionForecast.valid(f,h.week)||f.actionId!==h.actionId)return "";
    return details("予測と実績",list([["営業利益・予測平均",money(f.profit.mean)],["営業利益・実績",money(h.profit)],["予測との差",signed(h.profit-f.profit.mean)+"円"],["店の資金・予測平均",money(f.cash.mean)],["店の資金・実績",money(h.cashAfter)]])+`<p class="hint">事故・成否によって幅の外にも出ます。事故の追加対応や救済は実績だけに含まれます。</p>`);
  }
  function policyEffect(action) {
    const rootEffects = {fix_people:"欠勤による損失 ↓",fix_fans:"常連客・評判 ↑",fix_equipment:"故障・食材の廃棄 ↓",loan:"資金 ↑ ／ 毎週返済",bills:"経費 ↓"};
    if (rootEffects[action.id]) return rootEffects[action.id];
    if (!action.delta) return action.effect;
    if (action.demand >= 1.18 && action.delta.fire > 0) {
      return "集客 ↑ ／ 炎上度 ↑";
    }
    const effects = [["staff","人員"],["storeRep","評判"],["fire","炎上度"],["sat","満足度"]];
    return effects.filter(([key]) => action.delta[key]).slice(0,2)
      .map(([key,label]) => label + (action.delta[key] > 0 ? " ↑" : " ↓")).join(" ／ ");
  }
  function choices() {
    const offers = G.weeklyOffers(game);
    if (!offers.some((a) => a.id === game.selected))
      game.selected = offers[0].id;
    const brief = G.weeklyBrief(game);
    const diagnosis = G.rootDiagnosis(game);
    const demand = G.boardroomDemand(game);
    const insight = demand ? `社長「${window.PlainCopy.choices[demand.actionId]?.name || demand.actionName}なら報酬を${money(demand.bonus)}上乗せだ」` : diagnosis.active && !diagnosis.solved ? diagnosis.witness : G.boardroomSignal(game);
    render(`${header("作戦を選ぶ")}<section class="decision stack">${scene("preview",{actionId:game.selected,art:brief.art})}
      <div id="actions" class="choices" role="radiogroup" aria-label="今週の4つの作戦">${offers.map(a=>`<button class="choice action-option" role="radio" aria-checked="${a.id===game.selected}" data-choice="${esc(a.id)}"><strong>${esc(window.PlainCopy.choices[a.id]?.name || a.name)}</strong><span class="cost">${esc(U.costLabel(G,a.id))}</span><span class="effect">${esc(policyEffect(a))}</span><span class="risk">${U.risk(G.previewRisk(game,a.id))}</span></button>`).join("")}</div>
      ${forecastPanel()}<p class="witness">${esc(insight)}</p>
      <div class="sub-decisions"><button data-sheet="project">追加投資 · ${esc(G.PROJECTS.find(x=>x.id===project)?.name || "なし")}</button><button data-sheet="devil">悪魔 · ${devil ? esc(G.DEVIL_OFFERS.find(p=>p.id===devil)?.name) : game.pacts.length ? "返済待ち" : "契約なし"}</button></div>
      ${button("advanceButton","営業する","primary")}</section>`);
  }
  function openSheet(kind) {
    const dlg = document.createElement("dialog");
    dlg.className = "decision-sheet";
    dlg.setAttribute("aria-label",kind==="project"?"追加投資":"悪魔の取引");
    dlg.innerHTML = extras(kind) + '<form method="dialog"><button autofocus>戻る</button></form>';
    main.append(dlg);
    window.PlainCopy.apply(dlg);
    dlg.addEventListener("close",()=>dlg.remove(),{once:true});
    dlg.showModal();
  }
  function extras(kind) {
    if (kind === "project")
    return `<h3>${icon("tools")} 追加投資</h3><div class="optional" role="radiogroup" aria-label="追加投資"><button data-project="" role="radio" aria-checked="${!project}">投資しない · 0円</button>${G.availableProjects(
      game,
    )
      .map(
        (p) =>
          `<button data-project="${p.id}" role="radio" aria-checked="${project === p.id}" ${p.nextCost === null || p.nextCost > game.cash ? "disabled" : ""}><strong>${esc(p.name)} Lv${Math.min(2,p.level+1)}</strong><small>${p.nextCost === null ? "最大レベル" : money(p.nextCost) + "・効果は翌週以降も継続"}<br>${esc(p.desc)}</small></button>`,
      )
      .join(
        "",
      )}</div>`;
    return `<h3>${icon("document")} 悪魔の取引</h3><p class="hint">契約 ${game.pactCount}/2${game.pacts.length ? " · 契約中は追加不可" : ""}</p><div class="optional" role="radiogroup" aria-label="悪魔の契約"><button data-devil="" role="radio" aria-checked="${!devil}">契約しない</button>${G.DEVIL_OFFERS.map((p) => `<button data-devil="${p.id}" role="radio" aria-checked="${devil === p.id}" ${!G.pactAvailable(game) ? "disabled" : ""}><strong>${esc(p.name)}</strong><span class="cost-flow"><span>今週<strong>${p.gain ? money(p.gain) : "集客 +35%"}</strong></span><span>→</span><span>第${game.week + p.dueOffset}週<strong>${p.price ? "返済 " + money(p.price) : "評判 −12・炎上度 +22・不満 +12"}</strong></span></span></button>`).join("")}</div>`;
  }
  function setStage(stage) {
    const forecast=game.presentation?.forecast;
    game.presentation = { week: game.lastResult.week, stage, newsIndex, ...(window.DecisionForecast.valid(forecast,game.lastResult.week)?{forecast}:{}) };
    save();
  }
  function start() {
    if (screen !== "choices" || game.finished) return;
    try {
      const forecast=window.DecisionForecast.estimate(G,game,game.selected,{project,devil});
      game = G.play(game, game.selected, { project, devil });
      game.forecastHistory = {...game.forecastHistory, [game.lastResult.week]:forecast};
      game.presentation={forecast};
      project = null;
      devil = null;
      newsIndex = 0;
      setStage("working");
      go("working");
    } catch (e) {
      notify(e.message);
    }
  }
  function working() {
    render(`<section class="stack working"><div class="row"><h1>営業中</h1><span class="week">第${game.lastResult.week}週</span></div><h2 id="workingPhase" class="phase-title" aria-live="polite">準備</h2><p class="working-summary">${esc(game.lastResult.actionName)}</p><div class="actors" id="workingActors">${scene("working",{actionId:game.lastResult.actionId,step:0})}</div><div class="week-progress"><div class="row"><strong>営業進行</strong><span id="workingPercent">0%</span></div><div class="work-track" aria-hidden="true"><span id="workingFill" style="width:0%;background-color:#c56a12"></span></div><progress id="workingProgress" class="progress-sr" aria-label="1週間の営業の経過" max="100" value="0"></progress></div>${button("workingSkip", "結果へ進む", "primary")}</section>`);
    const began = performance.now(), duration = 4200;
    let phase = 0;
    const tick = (now) => {
      if (screen !== "working") return;
      const percent = Math.min(100, Math.floor((now - began) / duration * 100));
      document.getElementById("workingProgress").value = percent;
      document.getElementById("workingPercent").textContent = percent + "%";
      const fill = document.getElementById("workingFill");
      fill.style.width = percent + "%";
      const next = Math.min(3, Math.floor(percent / 25));
      fill.style.backgroundColor = ["#c56a12", "#176fb1", "#8050b4", "#258046"][next];
      if (next !== phase) {
        phase = next;
        document.getElementById("workingActors").innerHTML = scene("working",{actionId:game.lastResult.actionId,step:phase});
        document.getElementById("workingPhase").textContent = ["準備", "実行", "客の反応", "集計"][phase];
      }
      if (percent < 100) workingFrame = requestAnimationFrame(tick);
      else {
        main.querySelector(".actors").classList.add("leaving");
        workingTimer = setTimeout(() => { setStage("outcome"); go("outcome"); }, 650);
      }
    };
    workingFrame = requestAnimationFrame(tick);
  }
  function outcome() {
    const h = game.lastResult,
      tier = h.performanceTier || "success";
    setStage("outcome");
    const impact = h.actionImpact;
    render(`<section class="stack result-summary">
      <div class="result-heading" data-tier="${esc(tier)}"><span class="eyebrow">第${h.week}週・作戦の結果</span>
        <h1>${{failure:"失敗…",success:"成功！",great:"大成功！"}[tier]}</h1></div>
      <div><h2>${esc(h.actionName)}</h2>${scene("outcome",{resultTier:tier,art:h.storyEvent?.art})}</div>
      ${impact ? `<dl class="impact-grid">${[["評判",impact.rep],["満足度",impact.sat],["炎上度",impact.fire]].map(([label,n]) => `<div><dt>${label}</dt><dd data-trend="${(label === "炎上度" ? -n : n) > 0 ? "better" : n === 0 ? "same" : "worse"}">${signed(n)}</dd></div>`).join("")}</dl>` : "<p>旧セーブには作戦単独の記録がありません。</p>"}
      <p class="witness"><b>社長</b>「${esc(bossLine(h))}」</p>
      ${button("outcomeNext", T.news(h, G).length ? "ニュースを見る" : "決算を見る", "primary")}
    </section>`);
  }
  const signed = (n) =>
    (n > 0 ? "+" : "") + Number(n || 0).toLocaleString("ja-JP");
  const pending = () =>
    !!game.lastResult?.accidentId &&
    !game.lastResult.accidentPositive &&
    game.lastResult.incidentCost > 0 &&
    game.lastResult.accidentResponse === null;
  function news() {
    const h = game.lastResult,
      items = T.news(h, G);
    if (newsIndex >= items.length) {
      if (pending())
        newsIndex = items.findIndex((i) => i.title === h.accidentTitle);
      else return afterNews();
    }
    const item = items[newsIndex];
    setStage("news");
    const decision = pending() && item.title === h.accidentTitle,
      cost = Math.min(28000, Math.round(h.incidentCost * 0.48) + 4000);
    render(
      `<section class="stack"><span class="eyebrow">ニュース ${newsIndex + 1} / ${items.length}</span><h1>${esc(item.title)}</h1>${scene("news",{visualId:item.visualId,eventId:h.accidentId,actionId:item.visualId==="memory" ? h.memoryActionId : h.actionId})}<p>${esc(item.text)}</p>${decision ? `<div class="panel stack"><h2>事故への対応</h2><p class="hint">補償すると評判 +3、見送ると評判 −2。</p><button id="accidentRepair" ${game.cash < cost ? "disabled" : ""}>補償する　−${money(cost)}</button>${button("accidentIgnore", "補償を見送る　0円")}</div>` : button("newsNext", "次へ", "primary")}</section>`,
    );
  }
  function afterNews() {
    go(game.rescuePending ? "rescue" : "report");
  }
  function rescue() {
    setStage("rescue");
    render(
      `<section class="stack"><h1>資金ショート</h1><strong class="cash-balance">店の残高　${money(game.cash)}</strong>${scene("rescue")}<div class="optional">${G.rescueOptions(game)
        .map(
          (o) =>
            `<button data-rescue="${o.id}"><strong>${esc(o.name)}</strong><small>${esc(o.detail)}</small></button>`,
        )
        .join(
          "",
        )}</div>${button("rescueGiveUp", "閉店する。もう金がない", "quiet")}</section>`,
    );
  }
  function ledger(h, kind) {
    if (!h) return '<p class="hint">決算なし</p>';
    const l = F.createLedger(h, kind);
    const note = /^(営業利益と口座|生活費と養育費)/.test(l.note) ? "" : l.note;
    return `<table class="ledger"><caption>第${l.week}週・${kind === "personal" ? "自分の財布" : "店の資金"}</caption><tbody><tr><th>期首</th><td>${money(l.start)}</td></tr>${l.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${signed(r.amount)}円</td></tr>`).join("")}<tr><th>期末</th><td>${money(l.end)}</td></tr></tbody></table>${note ? `<p class="hint">${esc(note)}</p>` : ""}`;
  }
  function profitBars(h) {
    const amounts = [h.sales, -(h.units*h.cost), -h.payroll, -h.extra];
    if (![...amounts,h.profit].every(Number.isFinite)) return '<p>この週の費目は旧記録にありません。</p>';
    const other = h.profit - amounts.reduce((sum,n)=>sum+n,0);
    const rows = ["売上","仕入れ","人件費","施策費","その他収支","営業利益"].map((label,i)=>[label,[...amounts,other,h.profit][i]]);
    const peak = Math.max(1,...rows.map(([,n])=>Math.abs(n)));
    return `<dl class="profit-bars">${rows.map(([label,n])=>`<div><dt>${label}</dt><dd><i class="${n<0?"out":"in"}" style="width:${100*Math.abs(n)/peak}%"></i><b>${signed(n)}円</b></dd></div>`).join("")}</dl>`;
  }
  function report() {
    const h = game.lastResult;
    if (!h) return go("home");
    if (pending()) return go("news");
    if (game.rescuePending) return go("rescue");
    if (returnScreen !== "history") setStage("report");
    render(`<section class="stack"><h1>第${h.week}週の決算</h1><div class="delta-grid">${delta("店の資金",h.deltaCash)}${h.personalCashBefore===undefined ? '<div>自分の財布 · 旧記録不明</div>' : delta("自分の財布",h.personalCashAfter-h.personalCashBefore)}${delta("評判",h.deltaRep,"")}</div>${profitBars(h)}<p class="witness">社長「${esc(window.CharacterCanon.split(C.resultSatire(h)).filter(x=>x.role==="boss").at(-1)?.text || bossLine(h))}」</p>${button("reportContinue",returnScreen==="history"?"経営に戻る":game.finished?"結末を見る":"次の週へ","primary")}</section>`);
  }
  function resume() {
    newsIndex = Number.isInteger(game.presentation?.newsIndex)
      ? Math.max(
          0,
          Math.min(
            game.presentation.newsIndex,
            T.news(game.lastResult || {}, G).length,
          ),
        )
      : 0;
    if (pending()) return go("news");
    if (game.rescuePending) return go("rescue");
    if (game.presentation && game.lastResult) {
      const stage = game.presentation.stage;
      return go(
        stage === "working"
          ? "outcome"
          : ["outcome", "news", "report"].includes(stage)
            ? stage
            : "report",
      );
    }
    go(game.finished ? "ending" : "home");
  }
  function achievements() {
    try { const a=JSON.parse(localStorage.getItem("okyakusama.achievements.v1")||"[]"); return Array.isArray(a)?a.filter(id=>Object.hasOwn(G.MANAGEMENT.ENDINGS,id)):[]; } catch { return []; }
  }
  function recordAchievement(e) {
    if(!e?.id)return;
    try { localStorage.setItem("okyakusama.achievements.v1",JSON.stringify([...new Set([...achievements(),e.id])])); }
    catch { notify("実績を保存できません。この画面の結末は確認できます。"); }
  }
  function ending() {
    const e = G.ending(game),
      g = G.goalStatus(game);
    recordAchievement(e);
    render(`<section class="stack"><small>契約終了</small><h1>${esc(e.name)}</h1>${scene("ending",{endingId:e.id})}<p>${esc(e.line)}</p>${list([["累計利益 / 目標",money(g.profit)+" / "+money(game.contractGoal)],["評判 / 条件",game.storeRep+" / 50"],["自分の財布",money(game.personalCash)]])}${button("endRestart","もう一度はじめる","primary")}<button data-go="records">記録を見る</button></section>`);
  }
  function reviewText(h) {
    const pool = [...(C.REACTIONS[h.actionId] || ["次の決算を見ようか。"]),...(C.EXTRA_REACTIONS[h.actionId] || [])];
    return pool[h.week % pool.length];
  }
  function voice() {
    const comments = game.history.slice(-3).reverse();
    render(`${header("世論")}<section class="stack"><div class="vitals">${meter("評判",game.storeRep)}${meter("満足",game.sat)}${meter("不満",game.frust)}${meter("炎上",game.fire)}</div>${comments.map(h=>`<article class="public-post"><small>第${h.week}週の口コミ</small><p>${esc(reviewText(h))}</p></article>`).join("") || "<p>最初の営業後に口コミが届きます。</p>"}</section>`,true);
  }
  function chart(key="cashAfter",label="店の資金") {
    const h = game.history.filter(x=>Number.isFinite(x[key]));
    if (h.length < 2)
      return '<p class="hint">グラフは2週目から</p>';
    const values = h.map((x) => x[key]),
      min = Math.min(0, ...values),
      max = Math.max(1, ...values),
      pts = values
        .map(
          (n, i) =>
            `${10 + (i * 280) / (h.length - 1)},${110 - ((n - min) / (max - min)) * 95}`,
        )
        .join(" ");
    return `<p>${esc(label)}：${Math.round(min).toLocaleString("ja-JP")} ～ ${Math.round(max).toLocaleString("ja-JP")}${key==="repAfter"?"点":"円"}</p><svg class="chart" viewBox="0 0 300 140" role="img" aria-label="${esc(label)}の推移"><path d="M10 10V115H290" fill="none" stroke="#d6d1bb"/><polyline points="${pts}" fill="none" stroke="#315c49" stroke-width="2"/><text x="10" y="135" font-size="10" fill="#667366">第${h[0].week}週</text><text x="250" y="135" font-size="10" fill="#667366">第${h[h.length-1].week}週</text></svg>`;
  }
  function records() {
    const rows = [...game.history].reverse();
    render(`${header("経営記録")}<section class="stack">${list([["営業週数",rows.length+"週"],["累計利益",money(G.goalStatus(game).profit)],["累計報酬",money(game.pay)]])}<div id="trendChart">${chart()}</div>
      ${rows.length>1 ? `<label>推移 <select id="recordTrend"><option value="cashAfter">店の資金</option><option value="sales">売上</option><option value="profit">営業利益</option><option value="repAfter">評判</option></select></label>` : ""}<div class="timeline">${rows.map(h=>`<button data-week="${h.week}"><small>第${h.week}週</small> ${esc(h.actionName)} <b>${compactYen(h.profit)}</b></button>`).join("")}</div>
      ${details("周回実績",Object.entries(G.MANAGEMENT.ENDINGS).map(([id,e])=>`<p>${achievements().includes(id)?"達成":"未達"} · ${esc(e[0])}</p>`).join(""))}
      ${details("セーブ・設定",`<div class="backup">${button("exportSave","セーブを書き出す")}<label>セーブを読み込む<input type="file" id="importSave" accept=".json,application/json"></label></div><p>読み込みで現在のセーブを置き換えます。</p><button data-go="title">タイトルへ</button>`)}
      ${button("showCast","登場人物")}</section>`,true);
  }
  function weekRecord(week) {
    const h = game.history.find(row=>row.week===week);
    if (!h) return;
    screen="record-week";
    render(`${header("第"+week+"週の記録","records")}<section class="stack"><h2>${esc(h.actionName)}</h2>${scene("outcome",{state:{...game,lastResult:h},actionId:h.actionId,resultTier:h.performanceTier,art:h.storyEvent?.art})}<p>${esc(h.body)}</p>
    ${[h.storyEvent?.text,h.storyEvent?.quote,...(h.storyEcho||[]).map(x=>x.text),h.crisisResponse,h.devilNote,h.rescueText].filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join("")}<p>口コミ「${esc(reviewText(h))}」</p>${forecastReview(h)}${ledger(h,"store")}${ledger(h,"personal")}</section>`);
  }
  function status() {
    const d = G.rootDiagnosis(game);
    const trust = [["社長","boss"],["店長","manager"],["常連","customers"]];
    render(`${header("店舗の詳細")}<section class="stack">${scene("status")}<div class="vitals">${meter("人員",game.staff)}${meter("満足",game.sat)}${meter("不満",game.frust)}${meter("炎上",game.fire)}${game.workforce?meter("士気",game.workforce.morale)+meter("疲労",game.workforce.fatigue):""}</div><p class="witness">${esc(d.active&&!d.solved ? d.witness || d.clue : "従業員「今日も売場を開けました」")}</p><div class="trust">${trust.map(([label,key])=>`<label>${label}の信頼 <b>${signed(game.cast?.[key])}</b><meter min="-100" max="100" value="${game.cast?.[key]||0}"></meter></label>`).join("")}</div>${button("statusDone","経営に戻る","primary")}</section>`);
  }
  let moneyKind = "store";
  function finance() {
    const personal = moneyKind === "personal",
      payments = [];
    if (personal) {
      for (const week of G.PERSONAL.dueWeeks.filter(w=>w>=game.week && w<=G.campaignWeeks(game))) payments.push([week,"養育費",money(G.PERSONAL.support)]);
    }
    for (const pact of game.pacts.filter(p=>(p.id==="personal")===personal))
      payments.push([pact.due,pact.price ? "悪魔へ返済" : "集客契約の代償",pact.price ? money(pact.price) : "評判 −12・炎上 +22・不満 +12"]);
    payments.sort((a,b)=>a[0]-b[0]);
    render(`${header("お金")}<section class="stack"><div class="wallet-tabs"><button id="moneyStoreTab" aria-pressed="${!personal}">店の資金<strong>${money(game.cash)}</strong></button><button id="moneyPersonalTab" aria-pressed="${personal}">自分の財布<strong>${money(game.personalCash)}</strong></button></div>
      ${personal?list([["毎週の生活費",money(G.PERSONAL.living)],["未払い",money(game.arrears)]]):list([["借入残高",money(game.debt)],["基本固定費の見込み",money(155000-(60-game.staff)*800+G.currentMacro(game).fixed)]])}
      <h2>支払い予定</h2><ol class="payline"><li>現在 · 第${game.week}週</li>${payments.map(([w,label,n])=>`<li><b>第${w}週</b> ${label}　${n}</li>`).join("") || "<li>臨時の支払い予定なし</li>"}</ol>
      ${details("前週の入出金",ledger(game.lastResult,moneyKind))}${button("moneyDone","経営に戻る","primary")}</section>`);
  }
  function help() {
    render(`${header("遊び方","title")}<section class="stack">${list([["毎週","4つの作戦から1つ選んで営業"],["30週の目標","契約の累計利益を達成し、評判50以上"],["お金","生活費と養育費は自分の財布から"]])}${button("aboutClose","戻る","primary")}</section>`);
  }
  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    const d = b.dataset;
    try {
      if (d.week) return weekRecord(Number(d.week));
      if (d.go) {
        if (["home", "voice", "records"].includes(d.go)) returnScreen = "home";
        go(d.go);
        return;
      }
      if (d.finance) {
        moneyKind = d.finance;
        go("finance");
        return;
      }
      if (d.sheet) return openSheet(d.sheet);
      if (d.choice) {
        game.selected = d.choice;
        save();
        const scroll = scrollY;
        choices();
        window.scrollTo(0, scroll);
        main
          .querySelector(`[data-choice="${d.choice}"]`)
          .focus({ preventScroll: true });
        return;
      }
      if ("project" in d || "devil" in d) {
        if ("project" in d) project = d.project || null;
        else devil = d.devil || null;
        const scroll = scrollY;
        choices();
        main.querySelector(`[data-sheet="${"project" in d ? "project" : "devil"}"]`).focus({preventScroll:true});
        window.scrollTo(0, scroll);
        return;
      }
      if (d.rescue) {
        game = G.resolveRescue(game, d.rescue);
        save();
        go("report");
        return;
      }
      switch (b.id) {
        case "titleStart":
          go("contracts");
          break;
        case "titleResume":
          resume();
          break;
        case "titleHelp":
          go("help");
          break;
        case "acceptMarket":
          if (
            hasSave &&
            !confirm("現在のセーブを置き換えて新しい依頼を始めますか？")
          )
            break;
          prologue = 0;
          go("prologue");
          break;
        case "prologueNext":
          if (++prologue < C.PROLOGUE.length) go("prologue");
          else {
            game = G.initial(Date.now(), {difficulty, choiceEdition:370});
            loadError = false;
            project = null;
            devil = null;
            save();
            go("home");
          }
          break;
        case "openProposals":
          go(
            game.rescuePending
              ? "rescue"
              : game.finished
                ? "ending"
                : "choices",
          );
          break;
        case "advanceButton":
          start();
          break;
        case "workingSkip":
          setStage("outcome");
          go("outcome");
          break;
        case "outcomeNext":
          newsIndex = 0;
          go("news");
          break;
        case "newsNext":
          newsIndex++;
          go("news");
          break;
        case "accidentRepair":
        case "accidentIgnore":
          game = G.handleAccident(
            game,
            b.id === "accidentRepair" ? "repair" : "ignore",
          );
          save();
          go("news");
          break;
        case "rescueGiveUp":
          if (confirm("再建を断念し、この契約を終了しますか？")) {
            game = G.resolveRescue(game, "giveup");
            save();
            go("report");
          }
          break;
        case "reportContinue":
          if (returnScreen === "history") {
            returnScreen = "home";
            go("home");
          } else {
            game.presentation = null;
            save();
            go(game.finished ? "ending" : "home");
          }
          break;
        case "lastReport":
          returnScreen = "history";
          go("report");
          break;
        case "endRestart":
          go("contracts");
          break;
        case "statusDone":
        case "moneyDone":
          go("home");
          break;
        case "moneyStoreTab":
          moneyKind = "store";
          go("finance");
          break;
        case "moneyPersonalTab":
          moneyKind = "personal";
          go("finance");
          break;
        case "aboutClose":
          go("title");
          break;
        case "exportSave": {
          const blob = new Blob(
              [
                loadError
                  ? localStorage.getItem(KEY)
                  : JSON.stringify(game, null, 2),
              ],
              { type: "application/json" },
            ),
            url = URL.createObjectURL(blob),
            a = document.createElement("a");
          a.href = url;
          a.download = "okyakusama-save.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          break;
        }
        case "showCast":
          screen="cast";
          render(
            `${header("登場人物", "records")}<div class="stack">${Object.entries(
              {
                you: "あなた・経営コンサル",
                boss: "社長",
                manager: "店長",
                worker: "従業員",
                customer: "森さん・常連客",
                devil: "悪魔",
              },
            )
              .map(
                ([id, n]) =>
                  `<section class="panel"><h2>${n}</h2><p>${esc(window.CharacterCanon.profiles[id].job)} · ${esc(window.CharacterCanon.profiles[id].personality)}</p><div class="expression-grid">${Object.keys(U.moods).map((m) => `<figure>${character(id, m, true)}<figcaption>${U.moods[m]}</figcaption></figure>`).join("")}</div></section>`,
              )
              .join("")}</div>`,
          );
          break;
      }
    } catch (err) {
      notify(err.message || "処理できませんでした。");
    }
  });
  main.addEventListener("change", async (e) => {
    if(e.target.id === "recordTrend"){document.getElementById("trendChart").innerHTML=chart(e.target.value,e.target.selectedOptions[0].textContent);return;}
    if(e.target.id === "difficulty"){difficulty=e.target.value;contracts();return;}
    if (e.target.id !== "importSave" || !e.target.files[0]) return;
    try {
      const file = e.target.files[0];
      if (file.size > 2000000) throw Error("ファイルが大きすぎます。");
      const s = G.validateSaved(JSON.parse(await file.text()));
      if (!confirm("現在の記録を、このバックアップで置き換えますか？")) return;
      // Commit to storage before replacing the live session; quota failures preserve both.
      localStorage.setItem(KEY, JSON.stringify(s));
      game = s;
      hasSave = true;
      loadError = false;
      project = null;
      devil = null;
      resume();
    } catch (err) {
      notify("復元できません：" + err.message);
    }
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch(() =>
        notify(
          "オフライン機能を準備できませんでした。通信状態をご確認ください。",
        ),
      );
    let controlled = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (controlled)
        notify("更新を準備しました。セーブ後に再読み込みすると反映されます。");
      controlled = true;
    });
  }
  go("title");
})();
