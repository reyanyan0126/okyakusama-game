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
    store,
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
  function render(html, withNav = false) {
    main.dataset.screen = screen;
    main.dataset.nav = String(withNav);
    main.innerHTML = html + (withNav ? nav() : "");
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
      `<section class="title"><span class="eyebrow">30週間の経営再建</span><h1><img class="pixel-logo" src="assets/pixel/logo.svg" width="136" height="20" alt="お客様のために。"></h1><p class="tagline">可愛い店で、黒い経営。</p>${store(G.initial(1), true)}<div class="buttons">${button("titleStart", "はじめる", "primary")}${hasSave && !loadError ? button("titleResume", "つづきから") : ""}${button("titleHelp", "遊び方", "quiet")}</div>${loadError ? '<p class="warn">セーブを読み込めませんでした。元データは上書きしていません。記録から書き出して保管できます。</p><button data-go="records">バックアップへ</button>' : ""}<p class="version">PIXEL EDITION · 3.2.1</p></section>`,
    );
  }
  function contracts() {
    render(
      `${header("新しい依頼", "title")}<section class="stack">${store(G.initial(1))}<div class="panel stack"><h2>モグモグマート</h2>${dialogue("manager", "来月の給料も厳しいんです。相談だけでも、できますか。", "confused")}${list(
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
      `${header("はじまり", "contracts")}<div class="stack"><div class="prologue-figure">${prologue === 4 ? store(G.initial(1)) : `<figure class="store"><img src="assets/pixel/scene-${prologue === 6 ? "night" : prologue === 5 ? "contract" : prologue === 3 ? "meeting" : "office"}.svg" width="144" height="80" alt="${prologue === 6 ? "夜の事務所" : prologue === 5 ? "再建契約書" : "小さな事務所"}"></figure>`}${character(prologue === 3 ? "manager" : prologue === 6 ? "devil" : "you", ["sad", "sad", "surprised", "confused", "sad", "normal", "smug"][prologue])}</div><div class="dots" aria-label="${prologue + 1} / 7">${C.PROLOGUE.map((_, i) => `<i class="${i === prologue ? "active" : ""}"></i>`).join("")}</div><div class="panel stack"><small>${esc(p.speaker)}</small><h2>${esc(p.title)}</h2><p>${esc(p.text)}</p></div>${button("prologueNext", prologue === 6 ? "契約を始める" : "次へ", "primary")}</div>`,
    );
  }
  function home() {
    const brief = G.weeklyBrief(game);
    render(
      `<header><span class="brand">お客様のために。</span><span class="week">第${Math.min(game.week, G.campaignWeeks(game))}週 / ${G.campaignWeeks(game)}</span></header><div class="rule"><i style="width:${Math.min(100, ((game.week - 1) / G.campaignWeeks(game)) * 100)}%"></i></div><section class="stack"><div class="row"><h1>モグモグマート</h1><small>${esc({ normal: "営業中", busy: "繁盛", shortstaff: "人手不足", fire: "炎上", crisis: "資金危機", closed: "閉店" }[U.storeState(game)])}</small></div>${store(game)}<div class="stats"><button class="stat" data-finance="store"><span>${icon("store")}店の資金</span><strong>${(game.cash / 10000).toFixed(1)}<small>万円</small></strong></button><button class="stat" data-finance="personal"><span>${icon("wallet")}自分の財布</span><strong>${(game.personalCash / 10000).toFixed(1)}<small>万円</small></strong></button><div class="stat"><span>${icon("heart")}評判</span><strong>${game.storeRep}<small> / 100</small></strong></div></div><article class="task panel"><small>今週の課題</small><h2>${esc(brief.title)}</h2>${dialogue("boss", brief.quote, U.stateMood(game, "boss"), true)}${button("openProposals", game.rescuePending ? "再建を相談する" : game.finished ? "結末を見る" : "作戦を選ぶ", "primary")}</article><div class="home-tools"><button data-go="status" class="quiet">店舗の詳細</button>${game.lastResult ? button("lastReport", "前週の決算", "quiet") : ""}</div></section>`,
      true,
    );
  }
  function forecastPanel() {
    const f=window.DecisionForecast.estimate(G,game,game.selected,{project,devil});
    return details("収支の見通し",list([["営業利益の平均",money(f.profit.mean)],["利益の目安幅",money(f.profit.low)+" 〜 "+money(f.profit.high)],["店の期末資金・平均",money(f.cash.mean)],["評判の平均",f.rep.mean+" / 100"]])+`<p class="hint">64通りの試算。幅は試算の10〜90％点で、保証ではありません。追加投資・取引を含み、事故への追加対応と救済は含みません。</p>`);
  }
  function forecastReview(h) {
    const f=game.presentation?.forecast;
    if(!window.DecisionForecast.valid(f,h.week)||f.actionId!==h.actionId)return "";
    return details("予測と実績",list([["営業利益・予測平均",money(f.profit.mean)],["営業利益・実績",money(h.profit)],["予測との差",signed(h.profit-f.profit.mean)+"円"],["店の資金・予測平均",money(f.cash.mean)],["店の資金・実績",money(h.cashAfter)]])+`<p class="hint">事故・成否によって幅の外にも出ます。事故の追加対応や救済は実績だけに含まれます。</p>`);
  }
  function choices() {
    const offers = G.weeklyOffers(game);
    if (!offers.some((a) => a.id === game.selected))
      game.selected = offers[0].id;
    const a = offers.find((x) => x.id === game.selected),
      odds = G.performanceOdds(game, a.id),
      d = G.rootDiagnosis(game),
      demand = G.boardroomDemand(game);
    render(
      `${header("作戦を選ぶ")}<div class="stack"><div class="row"><small>店の資金 ${money(game.cash)}</small></div><div id="actions" class="choices" role="radiogroup" aria-label="今週の4つの作戦">${offers.map((a, i) => `<button class="choice action-option" role="radio" aria-checked="${a.id === game.selected}" data-choice="${esc(a.id)}"><strong>${esc(a.name)}</strong><span class="cost">${esc(U.costLabel(G, a.id))}</span><span class="effect">${esc(a.effect)}</span><span class="risk">${U.risk(G.previewRisk(game, a.id))}</span></button>`).join("")}</div><div id="selectedDetail" class="selected"><div class="odds"><span>失敗 ${odds.failure}%</span><span>成功 ${odds.success}%</span><span>大成功 ${odds.great}%</span></div>${a.id === "loan" ? '<p class="warn">借入20万円（失敗時16万円）。毎週、元金・利息を返済。</p>' : ""}${details("作戦の詳細", `<p>${esc(window.PlainCopy.choiceDetail(a))}</p><p class="hint">施策費は家賃・仕入れ・投資とは別。削減額は成否で変動。炎上は別判定。</p>`)}${demand ? `<p class="hint">社長の推し「${esc(demand.actionName)}」で報酬 +${money(demand.bonus)}（店負担）</p>` : ""}</div>${details("経営会議・現場の証言", dialogue("manager", d.active ? (d.solved ? "根本原因は改善済み。" : d.clue + " " + d.witness) : G.boardroomSignal(game), "confused") + `<p>${esc(G.currentMacro(game).detail)}</p>`)}${details("追加投資・悪魔の取引", extras(), "extras")}${forecastPanel()}${project || devil ? `<p id="optionalSummary" class="hint">${[project ? "投資：" + esc(G.PROJECTS.find((x) => x.id === project).name) : "", devil ? "契約：" + esc(G.DEVIL_OFFERS.find((x) => x.id === devil).name) : ""].filter(Boolean).join(" ／ ")}</p>` : ""}${button("advanceButton", "営業する", "primary")}</div>`,
    );
  }
  function extras() {
    return `<h3>${icon("tools")} 追加投資</h3><div class="optional" role="radiogroup" aria-label="追加投資"><button data-project="" role="radio" aria-checked="${!project}">投資しない · 0円</button>${G.availableProjects(
      game,
    )
      .map(
        (p) =>
          `<button data-project="${p.id}" role="radio" aria-checked="${project === p.id}" ${p.nextCost === null || p.nextCost > game.cash ? "disabled" : ""}><strong>${esc(p.name)} · Lv${p.level}/2</strong><small>${p.nextCost === null ? "最大レベル" : money(p.nextCost) + "・今週支払い・継続効果あり"}<br>${esc(p.desc)}</small></button>`,
      )
      .join(
        "",
      )}</div><h3>${icon("document")} 悪魔の取引</h3><p class="hint">契約 ${game.pactCount}/2${game.pacts.length ? " · 契約中は追加不可" : ""}</p><div class="optional" role="radiogroup" aria-label="悪魔の契約"><button data-devil="" role="radio" aria-checked="${!devil}">契約しない</button>${G.DEVIL_OFFERS.map((p) => `<button data-devil="${p.id}" role="radio" aria-checked="${devil === p.id}" ${!G.pactAvailable(game) ? "disabled" : ""}><strong>${esc(p.name)}</strong><small>${esc(p.desc)}</small><span class="cost-flow"><span>今週<strong>${p.gain ? money(p.gain) : "集客 +35%"}</strong></span><span>→</span><span>第${game.week + p.dueOffset}週<strong>${p.price ? "返済 " + money(p.price) : "信用問題が再燃"}</strong></span></span></button>`).join("")}</div>`;
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
    render(`<section class="stack working"><div class="row"><h1>営業中</h1><span class="week">第${game.lastResult.week}週</span></div>${store(game)}<div class="actors">${character("worker", U.stateMood(game, "worker"))}${character("customer", U.stateMood(game, "customer"))}</div><div class="week-progress"><div class="row"><strong id="workingPhase" aria-live="polite">仕入れ・開店</strong><span id="workingPercent">0%</span></div><div class="work-track" aria-hidden="true"><span id="workingFill" style="width:0%;background-color:#c56a12"></span></div><progress id="workingProgress" class="progress-sr" aria-label="1週間の営業の経過" max="100" value="0"></progress></div>${button("workingSkip", "結果へ進む", "primary")}</section>`);
    const began = performance.now(), duration = 4200;
    let phase = 0;
    const tick = (now) => {
      if (screen !== "working") return;
      const percent = Math.min(100, Math.floor((now - began) / duration * 100));
      document.getElementById("workingProgress").value = percent;
      document.getElementById("workingPercent").textContent = percent + "%";
      const fill = document.getElementById("workingFill");
      fill.style.width = percent + "%";
      const next = percent < 30 ? 0 : percent < 75 ? 1 : percent < 100 ? 2 : 3;
      fill.style.backgroundColor = ["#c56a12", "#176fb1", "#8050b4", "#258046"][next];
      if (next !== phase) {
        phase = next;
        document.getElementById("workingPhase").textContent = ["仕入れ・開店", "接客・販売", "売上を集計", "営業終了"][phase];
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
    render(
      `<section class="stack"><div class="result-heading">${character("manager", tier === "failure" ? "sad" : tier === "great" ? "surprised" : "happy")}<span class="eyebrow">第${h.week}週・作戦の結果</span><h1>${{ failure: "失敗…", success: "成功！", great: "大成功！" }[tier]}</h1></div><h2>${esc(h.actionName)}</h2>${U.narrative(G.STORIES.POLICIES_BY_ID[h.actionId]?.[tier] || h.storyEvent?.text || { failure: "現場は手順に追われ、狙った効果を十分に出せなかった。", success: "方針を共有し、計画どおりに実行できた。", great: "現場の工夫がかみ合い、想定を上回る手応えがあった。" }[tier])}${details(
        "作戦単独の効果・会話",
        `${
          h.actionImpact
            ? list([
                ["評判", signed(h.actionImpact.rep)],
                ["満足度", signed(h.actionImpact.sat)],
                ["炎上度", signed(h.actionImpact.fire)],
              ])
            : "<p>旧セーブには作戦単独の記録がありません。</p>"
        }${U.narrative(h.storyEvent?.quote || h.ceo)}${U.narrative(C.resultSatire(h))}${h.performanceOdds ? `<p>失敗 ${h.performanceOdds.failure}% ／ 成功 ${h.performanceOdds.success}% ／ 大成功 ${h.performanceOdds.great}%</p>` : ""}`,
      )}${button("outcomeNext", T.news(h, G).length ? "ニュースを見る" : "決算を見る", "primary")}</section>`,
    );
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
      `<section class="stack"><span class="eyebrow">ニュース ${newsIndex + 1} / ${items.length}</span><div class="result-heading">${icon(item.kind === "positive" ? "star" : item.visualId === "devil" ? "document" : "warning")}${character(item.visualId === "devil" ? "devil" : "worker", item.kind === "positive" ? "happy" : "surprised")}</div><h1>${esc(item.title)}</h1>${U.narrative(item.text)}${decision ? `<div class="panel stack"><h2>事故への対応</h2><p class="hint">補償：評判 +3・満足 +2・炎上 −3・不満 −5。補償代をケチる：評判 −2・炎上 +3・不満 +4。</p><button id="accidentRepair" ${game.cash < cost ? "disabled" : ""}>補償しろ。ケチるな −${money(cost)}</button>${button("accidentIgnore", "補償代をケチる。苦情は覚悟だ")}</div>` : button("newsNext", "次へ", "primary")}</section>`,
    );
  }
  function afterNews() {
    go(game.rescuePending ? "rescue" : "report");
  }
  function rescue() {
    setStage("rescue");
    render(
      `<section class="stack"><h1>資金ショート</h1>${dialogue("boss", "閉店か、代償を払って続けるか。", "sad")}${list(
        [
          ["店の資金", money(game.cash)],
          ["借入残高", money(game.debt)],
        ],
      )}<div class="optional">${G.rescueOptions(game)
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
  function report() {
    const h = game.lastResult;
    if (!h) return go("home");
    if (pending()) return go("news");
    if (game.rescuePending) return go("rescue");
    if (returnScreen !== "history") setStage("report");
    render(
      `<section class="stack"><div class="result-heading"><span class="eyebrow">第${h.week}週の決算</span><h1>${esc(h.title)}</h1></div><div class="delta-grid">${delta("店の資金", h.deltaCash)}${h.personalCashBefore === undefined ? '<div class="delta">自分の財布 <small>旧記録：増減不明</small></div>' : delta("自分の財布", h.personalCashAfter - h.personalCashBefore)}${delta("評判", h.deltaRep, "")}</div>${U.narrative(h.body)}${forecastReview(h)}${details(
        "決算の内訳",
        ledger(h, "store") +
          ledger(h, "personal") +
          list([
            ["営業利益", money(h.profit)],
            [
              "施策による評判変化",
              h.actionImpact ? signed(h.actionImpact.rep) : "旧記録：不明",
            ],
            ["社会情勢", h.macroName || "旧記録：不明"],
          ]) +
          `<p>${esc(h.workforceNote || "")}</p><p>${esc(h.macroDetail || "")}</p><p>${esc(h.crisisResponse || "")}</p><p>${esc(h.devilNote || "")}</p><p>${esc(h.rescueText || "")}</p>`,
      )}${details("社長の反応", dialogue("boss", C.resultSatire(h), h.fireHit ? "angry" : h.profit < 0 ? "sad" : "happy"))}${button("reportContinue", returnScreen === "history" ? "経営に戻る" : game.finished ? "結末を見る" : "次の週へ", "primary")}</section>`,
    );
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
    render(
      `<section class="stack"><div class="result-heading">${character("you", e.passed ? "happy" : "sad")}<span class="eyebrow">契約終了</span><h1>${esc(e.name)}</h1></div>${store({ ...game, sat: e.passed ? 80 : game.sat })}<div class="panel stack">${list(
        [
          [
            "累計利益 / 目標",
            `${money(g.profit)} / ${money(game.contractGoal)}`,
          ],
          ["評判 / 条件", game.storeRep + " / 50"],
          ["累計報酬", money(game.pay)],
          ["財布", money(game.personalCash)],
          ["養育費未払い", money(game.arrears)],
          ["炎上", game.history.filter((h) => h.fireHit).length + "回"],
          ["悪魔の契約", game.pactCount + "回"],
        ],
      )}</div><p>${esc(e.line)}</p>${e.legacyName ? details("従来の契約評価", `<p>${esc(e.legacyName)}</p><p>${esc(e.legacyLine)}</p>`) : ""}${details("事件の結末", (game.storyJournal || []).map((x) => `<p>${esc(x.summary)}</p>`).join("") || "<p>記録された後日談はありません。</p>")}${button("endRestart", "もう一度はじめる", "primary")}<button data-go="records">記録を見る</button></section>`,
    );
  }
  function voice() {
    const comments = game.history
      .slice(-8)
      .reverse()
      .map((h, i) => {
        const arr = [
          ...(C.REACTIONS[h.actionId] || ["次の決算を見ようか。"]),
          ...(C.EXTRA_REACTIONS[h.actionId] || []),
        ];
        return `<p><small>第${h.week}週 · ${esc(C.PUBLIC_NAMES[(h.week * 3 + i) % C.PUBLIC_NAMES.length])}</small><br>${esc(arr[(h.week + i) % arr.length])}</p>`;
      });
    render(
      `${header("世論")}<section class="stack">${dialogue("customer", game.fire >= 50 ? "社長の謝罪より、商品の説明が聞きたい。" : game.frust >= 60 ? "お客様のために？ 誰のお客様？" : game.sat >= 75 ? "最近ちょっといいじゃない！" : "悪くはない。褒めてないけど。", game.fire >= 50 ? "angry" : game.sat >= 75 ? "happy" : "normal")}${meter("評判", game.storeRep)}${comments[0] || '<p class="hint">口コミなし</p>'}${details("もっと見る", meter("満足度", game.sat) + meter("不満", game.frust) + meter("炎上", game.fire) + comments.slice(1).join(""))}</section>`,
      true,
    );
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
    const h = game.history,
      a = window.PixelLedger.analyze(game);
    render(
      `${header("経営記録")}<section class="stack">${list([
        ["記録", h.length + "週"],
        ["累計利益", money(G.goalStatus(game).profit)],
        ["累計報酬", money(game.pay)],
      ])}${chart()}${h.length >= 2 ? details("売上・利益・評判の推移",chart("sales","売上")+chart("profit","営業利益")+chart("repAfter","評判")) : ""}${details("周回実績", `<p>${achievements().length} / 8 達成</p>${Object.entries(G.MANAGEMENT.ENDINGS).map(([id,e])=>`<p>${achievements().includes(id)?"達成":"未達"} · ${esc(e[0])}</p>`).join("")}<p class="hint">実績は端末間で引き継げません。</p>`)}${details(
        "作戦の成績",
        list([
          [
            "成功・大成功率",
            a.successShare === null
              ? "未集計"
              : a.successShare + "%（判定あり " + a.assessed + "週）",
          ],
          ["黒字の週", a.profitable + "週"],
          ["赤字の週", a.lossWeeks + "週"],
          ["最長連続赤字", a.worstStreak + "週"],
          ["炎上", a.fires + "回"],
          ["事故", a.incidents + "回"],
          ["過去の施策の再燃", a.memories + "回"],
        ]),
      )}<div>${
        [...h]
          .reverse()
          .map((x) =>
            details(
              `第${x.week}週 · ${x.actionName}`,
              `<p>${esc(x.title)}</p><p>${esc(x.body)}</p>${list([
                ["店の資金", money(x.cashAfter)],
                ["営業利益", money(x.profit)],
                ["評判の増減", signed(x.deltaRep)],
                [
                  "施策単独 / その他",
                  x.actionImpact
                    ? signed(x.actionImpact.rep) +
                      " / " +
                      signed(x.deltaRep - x.actionImpact.rep)
                    : "旧記録：内訳なし",
                ],
              ])}${ledger(x, "store")}${ledger(x, "personal")}${x.storyEvent ? `<p>${esc(x.storyEvent.text)}</p><p>${esc(x.storyEvent.quote)}</p>` : ""}${(x.storyEcho || []).map((e) => `<p>${esc(e.text)}</p>`).join("")}`,
            ),
          )
          .join("")
      }</div>${details("セーブ・設定", `<div class="backup">${button("exportSave", "セーブを書き出す")}<label><span>セーブを読み込む</span><input type="file" id="importSave" accept=".json,application/json"></label></div><p class="hint">読み込むと現在のセーブを置き換えます。</p><button data-go="title">タイトルへ</button>${button("showCast", "登場人物")}`)}</section>`,
      true,
    );
  }
  function status() {
    const d = G.rootDiagnosis(game),
      macro = G.currentMacro(game);
    render(
      `${header("店舗の詳細")}<section class="stack">${meter("評判", game.storeRep)}${meter("満足度", game.sat)}${meter("不満", game.frust)}${meter("炎上", game.fire)}${game.workforce ? `<div class="panel">${character("worker", U.stateMood(game,"worker"))}${meter("士気",game.workforce.morale)}${meter("疲労",game.workforce.fatigue)}<p>離職率 ${game.workforce.turnover}% · 退職 ${game.workforce.departures}回</p><p>難易度：${esc(G.MANAGEMENT.DIFFICULTIES[game.difficulty].name)}</p></div>` : ""}${list(
        [
          ["商品価格", money(game.price)],
          ["内容量", game.size + "g"],
          ["品質", game.quality + "/100"],
          ["営業利益率", game.sales ? (game.profit/game.sales*100).toFixed(1)+"%" : "売上なし"],
          ["スタッフ", game.staff + "/100"],
          ["有能さ", game.skill + "/100"],
          ["悪名", game.notoriety + "/100"],
          ["借入残高", money(game.debt)],
          ["累計利益", money(G.goalStatus(game).profit)],
          ["契約目標", money(game.contractGoal)],
        ],
      )}${details(
        "現場の証言・人間関係",
        dialogue(
          "worker",
          d.active ? d.clue + " " + d.witness : "いつもの売り場に戻りました。",
          d.solved ? "happy" : "confused",
        ) +
          list([
            ["社長の信頼", game.cast?.boss || 0],
            ["店長の信頼", game.cast?.manager || 0],
            ["常連の信頼", game.cast?.customers || 0],
          ]) +
          `<p>${esc(macro.name)}：${esc(macro.detail)}</p>`,
      )}${button("statusDone", "経営に戻る", "primary")}</section>`,
    );
  }
  let moneyKind = "store";
  function finance() {
    const personal = moneyKind === "personal",
      due = G.PERSONAL.dueWeeks.find((w) => w >= game.week);
    render(
      `${header("お金")}<section class="stack"><div class="row"><button id="moneyStoreTab" aria-pressed="${!personal}">店の資金</button><button id="moneyPersonalTab" aria-pressed="${personal}">自分の財布</button></div><div class="panel"><span class="eyebrow">現在残高</span><h1>${money(personal ? game.personalCash : game.cash)}</h1></div>${
        personal
          ? list([
              ["毎週の生活費", money(G.PERSONAL.living)],
              [
                "次の養育費",
                due
                  ? "第" + due + "週 " + money(G.PERSONAL.support)
                  : "支払済み",
              ],
              ["未払い", money(game.arrears)],
            ])
          : list([
              ["借入残高", money(game.debt)],
              [
                "基本固定費（見込み）",
                money(
                  155000 - (60 - game.staff) * 800 + G.currentMacro(game).fixed,
                ),
              ],
            ])
      }${game.pacts.length ? `<div class="warn">${game.pacts.map((p) => `第${p.due}週：${esc(G.DEVIL_OFFERS.find((x) => x.id === p.id)?.name)} ${p.price ? money(p.price) : "信用問題が再燃"}`).join("<br>")}</div>` : ""}${details("入出金の内訳", ledger(game.lastResult, moneyKind))}${button("moneyDone", "経営に戻る", "primary")}</section>`,
    );
  }
  function help() {
    render(
      `${header("遊び方", "title")}<div class="stack"><p>毎週、4つの作戦から1つ選んで営業。</p>${list([
        ["契約期間", "30週間"],
        ["目標", "累計利益の目標達成 ＋ 評判50以上"],
      ])}${details("経営のコツ", "<p>人員削減は経費が減る一方、士気低下・疲労・離職につながります。</p><p>作戦の成否と事故・炎上は別判定。過去の選択も後の週に影響します。</p><p>営業利益と資金の増減は別。借入・投資・報酬も資金を動かします。生活費と養育費は自分の財布から支払います。</p>")}${details("保存・移行", "<p>このブラウザに自動保存。別端末へ移すときは「記録 → セーブ・設定」で書き出し・読み込みができます。実績は移せません。</p>")}<p class="hint">企業・事件・数字はフィクションです。</p>${button("aboutClose", "戻る", "primary")}</div>`,
    );
  }
  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    const d = b.dataset;
    try {
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
        document.getElementById("extras").open = true;
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
            game = G.initial(Date.now(), {difficulty});
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
                  `<section class="panel"><h2>${n}</h2>${character(id)}<div class="expression-grid">${Object.keys(U.moods).map((m) => `<figure>${character(id, m, true)}<figcaption>${U.moods[m]}</figcaption></figure>`).join("")}</div></section>`,
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
