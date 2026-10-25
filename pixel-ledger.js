/* v2.3 decision ledger + v2.4 strategy statistics. Read-only, no invented causation. */
(function (root) {
  "use strict";
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const numtext = (v) => Math.round(v).toLocaleString("ja-JP");
  const yen = (v) => (num(v) === null ? "記録なし" : numtext(v) + "円");
  const sign = (v) =>
    num(v) === null ? "不明" : (v > 0 ? "+" : "") + numtext(v);
  const VERDICT = { failure: "失敗", success: "成功", great: "大成功" };
  const safe = (v) => String(v ?? "");
  function weekly(h) {
    const impact = h.actionImpact;
    function split(field, delta) {
      const a = num(impact?.[field]),
        total = num(h[delta]);
      return {
        action: a,
        total,
        other: a === null || total === null ? null : total - a,
      };
    }
    const factors = [];
    if (h.accidentId)
      factors.push(
        (h.accidentPositive ? "好材料" : "事故") +
          "：" +
          safe(h.accidentTitle || "臨時イベント"),
      );
    if (h.fireHit) factors.push("炎上イベント");
    if (h.memoryEvent) factors.push("過去の施策の再燃");
    if (h.boycottActive) factors.push("不買運動");
    if ((h.macroPenalty || 0) > 0)
      factors.push("景気・環境による追加費用 " + yen(h.macroPenalty));
    if ((h.macroBonus || 0) > 0)
      factors.push("景気・環境による補助金 " + yen(h.macroBonus));
    if ((h.investment || 0) > 0) factors.push("設備投資 " + yen(h.investment));
    if (h.devilId) factors.push("悪魔の契約");
    if (h.storyEvent?.headline)
      factors.push("物語：" + safe(h.storyEvent.headline));
    if (Array.isArray(h.storyEcho) && h.storyEcho.length)
      factors.push("過去の選択による後日談 " + h.storyEcho.length + "件");
    if (h.responseText) factors.push("事故対応：" + safe(h.responseText));
    return {
      week: h.week,
      action: safe(h.actionName || h.actionId || "施策不明"),
      tier: VERDICT[h.performanceTier] || "判定記録なし",
      rep: split("rep", "deltaRep"),
      sat: split("sat", "deltaSat"),
      fire: split("fire", "deltaFire"),
      sales: num(h.sales),
      profit: num(h.profit),
      cash: num(h.cashAfter),
      deltaCash: num(h.deltaCash),
      personalCash: num(h.personalCashAfter),
      factors,
      story: safe(h.storyEvent?.text || ""),
      summary: safe(h.title || ""),
    };
  }
  function analyze(state) {
    const hs = Array.isArray(state?.history)
      ? state.history
          .filter(
            (h) => h && Number.isInteger(h.week) && h.week >= 1 && h.week <= 30,
          )
          .slice(0, 30)
      : [];
    const entries = hs.map(weekly),
      count = (p) => hs.filter(p).length,
      total = (f) => hs.reduce((v, h) => v + (num(h[f]) || 0), 0);
    const assessed = hs.filter((h) => VERDICT[h.performanceTier]);
    let consecutive = 0,
      worstStreak = 0;
    for (const h of hs) {
      if (num(h.profit) !== null && h.profit < 0) {
        consecutive++;
        worstStreak = Math.max(worstStreak, consecutive);
      } else consecutive = 0;
    }
    const sales = total("sales"),
      profit = total("profit");
    return {
      played: hs.length,
      entries,
      sales,
      profit,
      avgSales: hs.length ? Math.round(sales / hs.length) : 0,
      profitable: count((h) => num(h.profit) !== null && h.profit > 0),
      lossWeeks: count((h) => num(h.profit) !== null && h.profit < 0),
      fires: count((h) => !!h.fireHit),
      incidents: count((h) => !!h.accidentId && !h.accidentPositive),
      memories: count((h) => !!h.memoryEvent),
      worstStreak,
      assessed: assessed.length,
      successShare: assessed.length
        ? Math.round(
            (100 *
              assessed.filter((h) => h.performanceTier !== "failure").length) /
              assessed.length,
          )
        : null,
      last: entries.at(-1) || null,
    };
  }
  root.PixelLedger = { weekly, analyze };
})(typeof window !== "undefined" ? window : globalThis);
