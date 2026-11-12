// No Excuses: all the math. Pure functions only (no DOM), so it can be tested.
// Rules come from solution.md, "How the numbers work".
(function (root) {
  var CATS = ['a', 'b'];
  var DAY = 24 * 60 * 60 * 1000;

  // Start of calendar week k (k = 0 is block 1, week 1). Uses setDate so 8:00 AM survives DST.
  function weekStart(startTs, k) {
    var d = new Date(startTs);
    d.setDate(d.getDate() + 7 * k);
    return d.getTime();
  }

  // Which calendar week a timestamp falls in. -1 = before tracking starts.
  function weekIndex(startTs, ts) {
    if (ts < startTs) return -1;
    var k = Math.floor((ts - startTs) / (7 * DAY));
    while (k > 0 && weekStart(startTs, k) > ts) k--;
    while (weekStart(startTs, k + 1) <= ts) k++;
    return k;
  }

  // Percentage for a block. Block 1 = measuring (null). Tough love: drops every block, hit or miss.
  function blockPct(b) {
    if (b <= 1) return null;
    return Math.max(50, 100 - 10 * (b - 1));
  }

  // Walk calendar weeks 0..upTo and label each one: { k, block, skipped, counted }.
  // A block is 4 counted weeks. A skipped week belongs to the block in progress and makes it 1 week longer.
  function weekMap(state, upTo) {
    var skips = state.skips || [];
    var out = [];
    var counted = 0;
    for (var k = 0; k <= upTo; k++) {
      var ws = weekStart(state.startTs, k);
      var skipped = skips.indexOf(ws) !== -1;
      var block = Math.floor(counted / 4) + 1;
      out.push({ k: k, start: ws, block: block, skipped: skipped, weekInBlock: skipped ? null : (counted % 4) + 1 });
      if (!skipped) counted++;
    }
    return out;
  }

  function sum(list) {
    return list.reduce(function (a, p) { return a + p.amount; }, 0);
  }

  // Everything the screens need, computed for time `now`.
  function compute(state, now) {
    var cur = weekIndex(state.startTs, now);
    var res = { started: cur >= 0, now: now, startTs: state.startTs };
    if (!res.started) return res;

    var map = weekMap(state, cur);
    var w = map[cur];
    res.week = w;
    res.block = w.block;
    res.pct = blockPct(w.block);
    res.weekStart = w.start;
    res.weekEnd = weekStart(state.startTs, cur + 1);
    res.skipped = w.skipped;

    var purchases = state.purchases || [];
    function inWeeks(filterFn) {
      return purchases.filter(function (p) {
        var k = weekIndex(state.startTs, p.ts);
        if (k < 0 || k > cur) return false;
        var m = map[k];
        return !m.skipped && filterFn(m);
      });
    }

    // Skips: 1 per block.
    var skipUsed = map.some(function (m) { return m.block === w.block && m.skipped; });
    var thisWeek = inWeeks(function (m) { return m.k === cur; });
    res.skipUsedThisBlock = skipUsed;
    res.canSkip = !w.skipped && !skipUsed && thisWeek.length === 0;
    res.canUndoSkip = w.skipped;

    // Starting numbers = block 1 totals. Only final once block 1 is over.
    var block1 = inWeeks(function (m) { return m.block === 1; });
    res.cats = {};
    CATS.forEach(function (c) {
      var mine = purchases.filter(function (p) { return p.cat === c; });
      var counted = inWeeks(function () { return true; }).filter(function (p) { return p.cat === c; });
      var start = sum(block1.filter(function (p) { return p.cat === c; }));
      var spentWeek = sum(thisWeek.filter(function (p) { return p.cat === c; }));
      var spentBlock = sum(inWeeks(function (m) { return m.block === w.block; }).filter(function (p) { return p.cat === c; }));
      var avg = counted.length ? sum(counted) / counted.length : 0;
      var info = { start: start, spentWeek: spentWeek, spentBlock: spentBlock, avg: avg, count: mine.length };
      if (res.pct !== null) {
        info.limit = round2(start / 4 * res.pct / 100);
        info.left = round2(info.limit - spentWeek);
        info.over = info.left < 0 ? round2(-info.left) : 0;
        info.tripsLeft = tripsLeft(info.left, avg);
        info.blockTarget = round2(start * res.pct / 100);
      }
      res.cats[c] = info;
    });

    // Block-end report for the block that just finished (shown once per block).
    if (w.block >= 2) {
      var prev = w.block - 1;
      var report = { block: prev, newPct: res.pct, cats: {} };
      CATS.forEach(function (c) {
        var total = sum(inWeeks(function (m) { return m.block === prev; }).filter(function (p) { return p.cat === c; }));
        var r = { total: round2(total) };
        var pp = blockPct(prev);
        if (pp !== null) {
          r.target = round2(res.cats[c].start * pp / 100);
          r.hit = total <= r.target + 0.005;
          r.missedBy = r.hit ? 0 : round2(total - r.target);
        }
        report.cats[c] = r;
      });
      report.finalCheck = prev >= 6;
      res.report = report;
    }
    return res;
  }

  function tripsLeft(left, avg) {
    if (!(avg > 0)) return null;      // nothing logged yet, so no average
    if (left <= 0) return 0;
    return Math.floor(left / avg + 1e-9);
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  // Mondays at 8:00 AM to offer in Setup: the most recent one, plus the next 8.
  function mondayOptions(now) {
    var d = new Date(now);
    d.setHours(8, 0, 0, 0);
    var back = (d.getDay() + 6) % 7; // days since Monday
    d.setDate(d.getDate() - back);
    if (d.getTime() > now) d.setDate(d.getDate() - 7);
    var out = [];
    for (var i = 0; i < 9; i++) {
      var x = new Date(d);
      x.setDate(x.getDate() + 7 * i);
      out.push(x.getTime());
    }
    return out;
  }

  // ---------- History, Plan, streak, money kept ----------

  // Starting numbers (block-1 totals). `final` = block 1 is over.
  function startingNumbers(state, map) {
    var out = {}, final = map.some(function (m) { return m.block >= 2; });
    CATS.forEach(function (c) { out[c] = 0; });
    (state.purchases || []).forEach(function (p) {
      var k = weekIndex(state.startTs, p.ts);
      if (k < 0 || k >= map.length) return;
      var m = map[k];
      if (!m.skipped && m.block === 1) out[p.cat] += p.amount;
    });
    CATS.forEach(function (c) { out[c] = round2(out[c]); });
    out.final = final;
    return out;
  }

  // One calendar week, for the History screen. k can be any week up to the current one.
  function weekSummary(state, k, now) {
    var cur = weekIndex(state.startTs, now);
    var map = weekMap(state, Math.max(cur, k));
    var m = map[k], starts = startingNumbers(state, map);
    var pct = m.skipped ? null : blockPct(m.block);
    var list = (state.purchases || []).filter(function (p) { return weekIndex(state.startTs, p.ts) === k; })
      .sort(function (a, b) { return b.ts - a.ts; });
    var cats = {};
    CATS.forEach(function (c) {
      var spent = round2(sum(list.filter(function (p) { return p.cat === c; })));
      var limit = pct === null ? null : round2(starts[c] / 4 * pct / 100);
      cats[c] = { spent: spent, limit: limit, under: limit === null ? null : spent <= limit + 0.005 };
    });
    return {
      k: k, start: m.start, end: weekStart(state.startTs, k + 1), block: m.block, skipped: m.skipped,
      weekInBlock: m.weekInBlock, pct: pct, cats: cats, purchases: list, isCurrent: k === cur, isPast: k < cur
    };
  }

  // Streak = finished weeks in a row (block 2+) where BOTH categories stayed under the limit. Skipped weeks don't break it.
  // Money kept = for finished weeks in block 2+, how far under your old pace (starting number / 4) you spent. Can be negative.
  function stats(state, now) {
    var cur = weekIndex(state.startTs, now);
    if (cur < 1) return { streak: 0, best: 0, kept: 0, weeksJudged: 0 };
    var map = weekMap(state, cur), starts = startingNumbers(state, map);
    var streak = 0, best = 0, run = 0, kept = 0, judged = 0;
    for (var k = 0; k < cur; k++) {
      var m = map[k];
      if (m.skipped || m.block < 2) continue;
      var w = weekSummary(state, k, now);
      var ok = CATS.every(function (c) { return w.cats[c].under; });
      judged++;
      run = ok ? run + 1 : 0;
      if (run > best) best = run;
      CATS.forEach(function (c) { kept += starts[c] / 4 - w.cats[c].spent; });
    }
    streak = run;
    return { streak: streak, best: best, kept: round2(kept), weeksJudged: judged };
  }

  // Every block so far, for the Plan screen.
  function blocks(state, now) {
    var cur = weekIndex(state.startTs, now);
    if (cur < 0) return [];
    var map = weekMap(state, cur), starts = startingNumbers(state, map);
    var curBlock = map[cur].block, out = [];
    for (var b = 1; b <= Math.max(6, curBlock); b++) {
      var pct = blockPct(b), weeks = map.filter(function (m) { return m.block === b; });
      var row = { block: b, pct: pct, status: b < curBlock ? 'done' : b === curBlock ? 'now' : 'next',
        skipUsed: weeks.some(function (m) { return m.skipped; }), cats: {} };
      CATS.forEach(function (c) {
        var total = 0;
        (state.purchases || []).forEach(function (p) {
          var k = weekIndex(state.startTs, p.ts);
          if (k >= 0 && k <= cur && !map[k].skipped && map[k].block === b && p.cat === c) total += p.amount;
        });
        var target = pct === null ? null : round2(starts[c] * pct / 100);
        row.cats[c] = { total: round2(total), target: target,
          hit: target === null || row.status !== 'done' ? null : total <= target + 0.005,
          weeklyLimit: pct === null || !starts.final ? null : round2(starts[c] / 4 * pct / 100) };
      });
      out.push(row);
    }
    return { rows: out, starts: starts };
  }

  // Quick-amount buttons: your 3 most-used amounts for this category, filled out with sensible defaults.
  function quickAmounts(state, cat) {
    var counts = {};
    (state.purchases || []).forEach(function (p) { if (p.cat === cat) counts[p.amount] = (counts[p.amount] || 0) + 1; });
    var mine = Object.keys(counts).map(Number).sort(function (a, b) { return counts[b] - counts[a] || b - a; }).slice(0, 3);
    var defaults = [10, 20, 30];
    defaults.forEach(function (d) { if (mine.length < 3 && mine.indexOf(d) === -1) mine.push(d); });
    return mine.sort(function (a, b) { return a - b; });
  }

  // Older saves used fixed 'pizza' / 'cash' categories. Move them into the generic slots a / b.
  function migrate(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    var map = { pizza: 'a', cash: 'b' };
    if (Array.isArray(obj.purchases)) obj.purchases.forEach(function (p) { if (p && map[p.cat]) p.cat = map[p.cat]; });
    var h = obj.habits;
    var ok = h && CATS.every(function (c) { return h[c] && typeof h[c].name === 'string' && h[c].name.trim(); });
    if (!ok) obj.habits = { a: { name: 'Pizza', emoji: '🍕' }, b: { name: 'Cash', emoji: '💵' } };
    return obj;
  }

  // Backup file: validate before restoring so a bad file can't wipe real data.
  function validBackup(obj) {
    return !!obj && typeof obj.startTs === 'number' && Array.isArray(obj.purchases) && Array.isArray(obj.skips || []) &&
      obj.purchases.every(function (p) { return p && CATS.indexOf(p.cat) !== -1 && typeof p.amount === 'number' && p.amount > 0 && typeof p.ts === 'number'; });
  }

  root.NoExcuses = {
    CATS: CATS, weekStart: weekStart, weekIndex: weekIndex, blockPct: blockPct,
    weekMap: weekMap, compute: compute, tripsLeft: tripsLeft, mondayOptions: mondayOptions,
    weekSummary: weekSummary, stats: stats, blocks: blocks, quickAmounts: quickAmounts, validBackup: validBackup, migrate: migrate
  };
})(typeof window !== 'undefined' ? window : globalThis);
