// No Excuses: all the math. Pure functions only (no DOM), so it can be tested.
// Rules come from solution.md, "How the numbers work".
(function (root) {
  var CATS = ['pizza', 'cash'];
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

  root.NoExcuses = {
    CATS: CATS, weekStart: weekStart, weekIndex: weekIndex, blockPct: blockPct,
    weekMap: weekMap, compute: compute, tripsLeft: tripsLeft, mondayOptions: mondayOptions
  };
})(typeof window !== 'undefined' ? window : globalThis);
