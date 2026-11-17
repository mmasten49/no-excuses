// No Excuses: all the math. Pure functions only (no DOM), so it can be tested.
// Rules come from solution.md, "How the numbers work".
(function (root) {
  var DEFAULT_CATS = ['a', 'b'];
  var MAX_HABITS = 5;
  var DAY = 24 * 60 * 60 * 1000;

  // ---------- habits ----------
  // The user's habits, in display order. Each habit can join the plan late (startK = the calendar week it joined).
  function cats(state) {
    var h = (state && state.habits) || {};
    var order = state && Array.isArray(state.order) ? state.order.filter(function (c) { return h[c]; }) : [];
    Object.keys(h).forEach(function (c) { if (order.indexOf(c) === -1) order.push(c); });
    return order.length ? order : DEFAULT_CATS.slice();
  }
  function hStartK(state, c) {
    var h = state.habits && state.habits[c];
    return h && typeof h.startK === 'number' && h.startK > 0 ? h.startK : 0;
  }

  // Start of calendar week k (k = 0 is the plan's first week). Uses setDate so 8:00 AM survives DST.
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

  // The plan's calendar weeks 0..upTo: { k, start, block, skipped, weekInBlock }.
  // A block is 4 counted weeks. A skipped week belongs to the block in progress and makes it 1 week longer.
  // Skips are plan-wide (a break week is a break for every habit). 1 skip per plan block.
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

  // One habit's own schedule over the plan's weeks. null before the habit joined.
  function habitMap(state, c, map) {
    var s = hStartK(state, c), out = [], counted = 0;
    for (var k = 0; k < map.length; k++) {
      if (k < s) { out.push(null); continue; }
      var m = map[k], block = Math.floor(counted / 4) + 1;
      out.push({ k: k, block: block, skipped: m.skipped, weekInBlock: m.skipped ? null : (counted % 4) + 1 });
      if (!m.skipped) counted++;
    }
    return out;
  }

  function sum(list) { return list.reduce(function (a, p) { return a + p.amount; }, 0); }
  function round2(n) { return Math.round(n * 100) / 100; }

  // Purchases of habit c that count: inside the plan, at or after the habit joined, not in a skipped week.
  // Each comes back with its habit-week info attached as `hw`.
  function countedBuys(state, c, map, hm, upTo) {
    var out = [];
    (state.purchases || []).forEach(function (p) {
      if (p.cat !== c) return;
      var k = weekIndex(state.startTs, p.ts);
      if (k < 0 || k > upTo || k >= hm.length) return;
      var hw = hm[k];
      if (!hw || hw.skipped) return;
      out.push({ p: p, k: k, hw: hw });
    });
    return out;
  }
  function total(list) { return round2(list.reduce(function (a, x) { return a + x.p.amount; }, 0)); }

  // Starting number per habit = its block-1 total. `final` once the habit is in block 2+.
  function habitStarts(state, map) {
    var out = {};
    cats(state).forEach(function (c) {
      var hm = habitMap(state, c, map), last = hm[hm.length - 1];
      var b1 = countedBuys(state, c, map, hm, map.length - 1).filter(function (x) { return x.hw.block === 1; });
      out[c] = { amount: total(b1), final: !!last && last.block >= 2 };
    });
    return out;
  }

  // Everything the screens need, computed for time `now`.
  function compute(state, now) {
    var cur = weekIndex(state.startTs, now);
    var res = { started: cur >= 0, now: now, startTs: state.startTs, order: cats(state) };
    if (!res.started) return res;

    var map = weekMap(state, cur), w = map[cur];
    res.week = w;
    res.block = w.block;                 // plan block (used for skips)
    res.pct = blockPct(w.block);         // plan-level, for habits that started with the plan
    res.weekStart = w.start;
    res.weekEnd = weekStart(state.startTs, cur + 1);
    res.skipped = w.skipped;

    var thisWeekAny = (state.purchases || []).filter(function (p) { return weekIndex(state.startTs, p.ts) === cur; });
    var skipUsed = map.some(function (m) { return m.block === w.block && m.skipped; });
    res.skipUsedThisBlock = skipUsed;
    res.canSkip = !w.skipped && !skipUsed && thisWeekAny.length === 0;
    res.canUndoSkip = w.skipped;

    res.cats = {};
    var pcts = {};
    res.order.forEach(function (c) {
      var hm = habitMap(state, c, map), hw = hm[cur];
      if (!hw) { res.cats[c] = { notStarted: true }; return; }
      var buys = countedBuys(state, c, map, hm, cur);
      var start = total(buys.filter(function (x) { return x.hw.block === 1; }));
      var spentWeek = total(buys.filter(function (x) { return x.k === cur; }));
      var spentBlock = total(buys.filter(function (x) { return x.hw.block === hw.block; }));
      var avg = buys.length ? total(buys) / buys.length : 0;
      var pct = blockPct(hw.block);
      var info = { block: hw.block, weekInBlock: hw.weekInBlock, pct: pct, start: start, startFinal: hw.block >= 2,
        spentWeek: spentWeek, spentBlock: spentBlock, avg: avg, count: buys.length };
      if (pct !== null) {
        info.limit = round2(start / 4 * pct / 100);
        info.left = round2(info.limit - spentWeek);
        info.over = info.left < 0 ? round2(-info.left) : 0;
        info.tripsLeft = tripsLeft(info.left, avg);
        info.blockTarget = round2(start * pct / 100);
      }
      // Block-end report for this habit's block that just finished.
      if (hw.block >= 2) {
        var prev = hw.block - 1, pp = blockPct(prev);
        var rep = { cat: c, block: prev, newPct: pct, total: total(buys.filter(function (x) { return x.hw.block === prev; })), finalCheck: prev >= 6 };
        if (pp !== null) {
          rep.target = round2(start * pp / 100);
          rep.hit = rep.total <= rep.target + 0.005;
          rep.missedBy = rep.hit ? 0 : round2(rep.total - rep.target);
        }
        info.report = rep;
      }
      res.cats[c] = info;
      pcts[String(pct) + '|' + hw.block] = true;
    });
    res.samePace = Object.keys(pcts).length <= 1;
    return res;
  }

  function tripsLeft(left, avg) {
    if (!(avg > 0)) return null;      // nothing logged yet, so no average
    if (left <= 0) return 0;
    return Math.floor(left / avg + 1e-9);
  }

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

  // One calendar week, for the History screen. k can be any week up to the current one.
  function weekSummary(state, k, now) {
    var cur = weekIndex(state.startTs, now);
    var map = weekMap(state, Math.max(cur, k));
    var m = map[k], starts = habitStarts(state, map);
    var list = (state.purchases || []).filter(function (p) { return weekIndex(state.startTs, p.ts) === k; })
      .sort(function (a, b) { return b.ts - a.ts; });
    var out = {};
    cats(state).forEach(function (c) {
      var hm = habitMap(state, c, map), hw = hm[k];
      if (!hw) { out[c] = { notYet: true, spent: 0, limit: null, under: null }; return; }
      var spent = round2(sum(list.filter(function (p) { return p.cat === c; })));
      var pct = hw.skipped ? null : blockPct(hw.block);
      var limit = pct === null ? null : round2(starts[c].amount / 4 * pct / 100);
      out[c] = { spent: spent, limit: limit, pct: pct, block: hw.block, weekInBlock: hw.weekInBlock, under: limit === null ? null : spent <= limit + 0.005 };
    });
    return {
      k: k, start: m.start, end: weekStart(state.startTs, k + 1), block: m.block, skipped: m.skipped,
      weekInBlock: m.weekInBlock, pct: m.skipped ? null : blockPct(m.block), cats: out, purchases: list, isCurrent: k === cur, isPast: k < cur
    };
  }

  // Streak = finished weeks in a row where EVERY habit that has a limit stayed under it. Skipped weeks don't break it.
  // Money kept = for finished weeks with limits, how far under your old pace (starting number / 4) you spent. Can be negative.
  function stats(state, now) {
    var cur = weekIndex(state.startTs, now);
    if (cur < 1) return { streak: 0, best: 0, kept: 0, weeksJudged: 0 };
    var map = weekMap(state, cur), starts = habitStarts(state, map);
    var best = 0, run = 0, kept = 0, judged = 0;
    for (var k = 0; k < cur; k++) {
      if (map[k].skipped) continue;
      var w = weekSummary(state, k, now);
      var withLimit = cats(state).filter(function (c) { return w.cats[c].limit !== null && w.cats[c].limit !== undefined; });
      if (!withLimit.length) continue;
      var ok = withLimit.every(function (c) { return w.cats[c].under; });
      judged++;
      run = ok ? run + 1 : 0;
      if (run > best) best = run;
      withLimit.forEach(function (c) { kept += starts[c].amount / 4 - w.cats[c].spent; });
    }
    return { streak: run, best: best, kept: round2(kept), weeksJudged: judged };
  }

  // One habit's ladder, for the Plan screen: its own blocks 1..max(6, current).
  function habitBlocks(state, now, c) {
    var cur = weekIndex(state.startTs, now);
    if (cur < 0) return null;
    var map = weekMap(state, cur), hm = habitMap(state, c, map), hw = hm[cur];
    if (!hw) return null;
    var starts = habitStarts(state, map), start = starts[c];
    var buys = countedBuys(state, c, map, hm, cur), rows = [];
    for (var b = 1; b <= Math.max(6, hw.block); b++) {
      var pct = blockPct(b);
      var tot = total(buys.filter(function (x) { return x.hw.block === b; }));
      var target = pct === null ? null : round2(start.amount * pct / 100);
      var status = b < hw.block ? 'done' : b === hw.block ? 'now' : 'next';
      rows.push({ block: b, pct: pct, status: status, total: tot, target: target,
        skipUsed: hm.some(function (x) { return x && x.block === b && x.skipped; }),
        hit: target === null || status !== 'done' ? null : tot <= target + 0.005,
        weeklyLimit: pct === null || !start.final ? null : round2(start.amount / 4 * pct / 100) });
    }
    return { rows: rows, start: start.amount, final: start.final, block: hw.block };
  }

  // Plan-wide ladder (kept for older callers): rows with every habit's numbers for that block number.
  function blocks(state, now) {
    var order = cats(state), per = {};
    order.forEach(function (c) { per[c] = habitBlocks(state, now, c); });
    var n = 0;
    order.forEach(function (c) { if (per[c]) n = Math.max(n, per[c].rows.length); });
    if (!n) return [];
    var map = weekMap(state, weekIndex(state.startTs, now)), starts = {}, rows = [];
    for (var i = 0; i < n; i++) {
      var first = order.map(function (c) { return per[c] && per[c].rows[i]; }).filter(Boolean)[0];
      var row = { block: i + 1, pct: blockPct(i + 1), status: first.status, skipUsed: first.skipUsed, cats: {} };
      order.forEach(function (c) { if (per[c] && per[c].rows[i]) row.cats[c] = per[c].rows[i]; });
      rows.push(row);
    }
    order.forEach(function (c) { starts[c] = per[c] ? per[c].start : 0; });
    starts.final = order.every(function (c) { return !per[c] || per[c].final; });
    return { rows: rows, starts: starts, map: map.length };
  }

  // Quick-amount buttons: your 3 most-used amounts for this habit, filled out with sensible defaults.
  function quickAmounts(state, cat) {
    var counts = {};
    (state.purchases || []).forEach(function (p) { if (p.cat === cat) counts[p.amount] = (counts[p.amount] || 0) + 1; });
    var mine = Object.keys(counts).map(Number).sort(function (a, b) { return counts[b] - counts[a] || b - a; }).slice(0, 3);
    [10, 20, 30].forEach(function (d) { if (mine.length < 3 && mine.indexOf(d) === -1) mine.push(d); });
    return mine.sort(function (a, b) { return a - b; });
  }

  // ---------- Resist button ----------
  var RESIST_MS = 10 * 60 * 1000;
  // What one buy of this habit usually costs (average of logged buys; $20 until there's history).
  function typicalBuy(state, cat) {
    var mine = (state.purchases || []).filter(function (p) { return p.cat === cat; });
    return mine.length ? round2(sum(mine) / mine.length) : 20;
  }
  // Any pending resist whose 10 minutes are up becomes a win. Returns the ones that just resolved.
  function resolveResists(state, now) {
    var done = [];
    (state.resists || []).forEach(function (r) {
      if (r.status === 'pending' && now >= r.until) { r.status = 'won'; done.push(r); }
    });
    return done;
  }
  function resistStats(state, from, to) {
    var won = (state.resists || []).filter(function (r) { return r.status === 'won' && r.ts >= from && r.ts < to; });
    return { count: won.length, value: round2(won.reduce(function (a, r) { return a + r.amount; }, 0)) };
  }

  // ---------- Cost in hours ----------
  function workTime(amount, wage) {
    if (!(wage > 0) || !(amount > 0)) return null;
    var mins = Math.round(amount / wage * 60);
    if (mins < 60) return mins + ' min';
    var h = Math.round(mins / 6) / 10;
    return h + (h === 1 ? ' hour' : ' hours');
  }

  // ---------- Yearly pace ----------
  // Average of the habit's last (up to) 4 finished counted weeks × 52. Also its old pace (starting number ÷ 4 × 52).
  function yearlyPace(state, now, cat) {
    var cur = weekIndex(state.startTs, now);
    if (cur < 1) return null;
    var map = weekMap(state, cur), hm = habitMap(state, cat, map), starts = habitStarts(state, map), weeks = [];
    for (var k = cur - 1; k >= 0 && weeks.length < 4; k--) if (hm[k] && !hm[k].skipped) weeks.push(k);
    if (!weeks.length) return null;
    var t = 0;
    (state.purchases || []).forEach(function (p) {
      if (p.cat === cat && weeks.indexOf(weekIndex(state.startTs, p.ts)) !== -1) t += p.amount;
    });
    return { now: Math.round(t / weeks.length * 52), old: starts[cat].final ? Math.round(starts[cat].amount / 4 * 52) : null, weeks: weeks.length };
  }

  // ---------- Adding / deleting habits ----------
  // Words that usually show up on a card statement for common habits. Used to spot habit buys in an imported statement.
  var KEYWORDS = [
    [/pizza/, ['pizza', 'domino', 'papa john', 'little caesar', 'pizza hut', 'marco', 'larosa', 'donatos', 'blaze pizza', 'mod pizza']],
    [/coffee|latte|cafe|starbucks/, ['coffee', 'starbucks', 'dunkin', 'dutch bros', 'peet', 'tim horton', 'cafe', 'caribou']],
    [/cash|atm/, ['atm', 'cash withdrawal', 'withdrawal']],
    [/fast ?food|burger|food run|drive/, ['mcdonald', 'burger king', 'wendy', 'five guys', 'chick-fil', 'taco bell', 'chipotle', 'culver', 'raising cane', 'popeyes', 'kfc', 'sonic', 'arby', 'skyline', 'gold star', 'white castle']],
    [/deliver|door|uber ?eat|grubhub|takeout/, ['doordash', 'uber eats', 'ubereats', 'grubhub', 'postmates', 'instacart']],
    [/uber|lyft|ride/, ['uber trip', 'uber *trip', 'lyft']],
    [/beer|alcohol|drink|bar|liquor|wine/, ['liquor', 'spirits', 'wine', 'beer', 'pub', 'tavern', 'brewing', 'brewery', 'bar & grill']],
    [/game|gaming|steam|xbox|playstation/, ['steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'roblox']],
    [/shop|amazon|clothes|online/, ['amazon', 'amzn', 'target', 'shein', 'temu', 'etsy']],
    [/snack|candy|gas station|convenience|energy/, ['7-eleven', 'speedway', 'circle k', 'wawa', 'sheetz', 'united dairy', 'udf', 'walgreens', 'cvs']],
    [/boba|tea|smoothie/, ['boba', 'tea', 'smoothie', 'tropical smoothie', 'kung fu tea']]
  ];
  function suggestKeywords(name) {
    var n = String(name || '').toLowerCase().trim(), out = [];
    if (n.length >= 3) out.push(n);
    KEYWORDS.forEach(function (row) { if (row[0].test(n)) row[1].forEach(function (k) { if (out.indexOf(k) === -1) out.push(k); }); });
    return out;
  }
  function newHabitId(state) {
    var used = Object.keys(state.habits || {}), i = 1;
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    for (var j = 0; j < letters.length; j++) if (used.indexOf(letters[j]) === -1) return letters[j];
    while (used.indexOf('h' + i) !== -1) i++;
    return 'h' + i;
  }
  // Adds a habit. If the plan has started, the habit joins this week and gets its own 4 measuring weeks.
  function addHabit(state, name, emoji, now) {
    if (cats(state).length >= MAX_HABITS) return null;
    var id = newHabitId(state), k = state.startTs ? weekIndex(state.startTs, now) : -1;
    state.habits = state.habits || {};
    state.habits[id] = { name: String(name).trim().slice(0, 16), emoji: emoji || '•', startK: Math.max(0, k), keywords: suggestKeywords(name) };
    state.order = cats(state).filter(function (c) { return c !== id; }).concat([id]);
    state.seen = state.seen || {};
    state.seen[id] = 1;
    return id;
  }
  // Deletes a habit and everything logged for it. Never deletes the last habit.
  function deleteHabit(state, c) {
    if (!state.habits || !state.habits[c] || cats(state).length <= 1) return false;
    delete state.habits[c];
    state.order = cats(state).filter(function (x) { return x !== c; });
    state.purchases = (state.purchases || []).filter(function (p) { return p.cat !== c; });
    state.resists = (state.resists || []).filter(function (r) { return r.cat !== c; });
    if (state.seen) delete state.seen[c];
    return true;
  }

  // ---------- Statement import ----------
  // Everything happens on the phone. Nothing is uploaded anywhere.

  function parseCSV(text) {
    var rows = [], row = [], f = '', q = false, i, ch;
    text = String(text || '').replace(/^﻿/, '');
    for (i = 0; i < text.length; i++) {
      ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { row.push(f); f = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(f); f = '';
        if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
        row = [];
      } else f += ch;
    }
    row.push(f);
    if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
    return rows;
  }

  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  // Statement dates → local noon timestamp. Dates without a year use the most recent past occurrence.
  function parseDate(s, now) {
    s = String(s || '').trim();
    var m, y, mo, d, nowD = new Date(now);
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +m[1]; mo = +m[2] - 1; d = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?(?!\d)/))) { mo = +m[1] - 1; d = +m[2]; y = m[3] ? +m[3] : null; }
    else if ((m = s.match(/^([A-Za-z]{3,4})\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/)) && MONTHS[m[1].toLowerCase()] !== undefined) { mo = MONTHS[m[1].toLowerCase()]; d = +m[2]; y = m[3] ? +m[3] : null; }
    else return null;
    if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
    if (y !== null && y < 100) y += 2000;
    if (y === null) { y = nowD.getFullYear(); if (new Date(y, mo, d, 12).getTime() > now + DAY) y--; }
    var t = new Date(y, mo, d, 12, 0, 0, 0);
    return t.getMonth() === mo ? t.getTime() : null;
  }
  // "$1,234.56", "-12.00", "(12.00)", "12.00 CR" → signed number. Not a money value → NaN.
  function parseMoney(s) {
    s = String(s || '').trim();
    if (!/\d/.test(s) || !/^[\s\-\+\(\$]*[\d,]*\.?\d+\)?\s*(CR|DR)?$/i.test(s.replace(/\$/g, ''))) return NaN;
    var neg = /^\s*-|^\s*\(|\)\s*$|CR\s*$/i.test(s);
    var n = parseFloat(s.replace(/[^\d.]/g, ''));
    return isNaN(n) ? NaN : (neg ? -n : n);
  }
  // Payments, refunds and transfers aren't spending.
  var NOT_SPENDING = /payment|thank you|autopay|refund|return|credit adj|deposit|transfer|interest paid|cashback reward|statement credit|reversal|zelle from|venmo cashout|direct dep|payroll/i;

  // Bank CSV → [{ ts, desc, amount }] of purchases only.
  function statementFromCSV(text, now) {
    var rows = parseCSV(text);
    if (!rows.length) return { txns: [], skipped: 0, error: 'empty' };
    var hi = -1, cols = null;
    for (var i = 0; i < Math.min(rows.length, 15); i++) {
      var h = rows[i].map(function (x) { return x.toLowerCase().trim(); });
      var dateI = h.findIndex(function (x) { return /trans.*date|^date$|date$|^posted|posting date/.test(x); });
      var amtI = h.findIndex(function (x) { return /^amount|amount$|^amt/.test(x); });
      var debI = h.findIndex(function (x) { return /debit|withdrawal|charge/.test(x) && !/date/.test(x); });
      var credI = h.findIndex(function (x) { return /credit|deposit/.test(x) && !/date|card/.test(x); });
      var descI = h.findIndex(function (x) { return /description|merchant|payee|^name$|details|memo|^transaction$/.test(x); });
      if (dateI !== -1 && (amtI !== -1 || debI !== -1)) { hi = i; cols = { date: dateI, amt: amtI, deb: debI, cred: credI, desc: descI }; break; }
    }
    var body = hi === -1 ? rows : rows.slice(hi + 1);
    if (!cols) cols = guessColumns(body, now);
    if (!cols) return { txns: [], skipped: rows.length, error: 'columns' };
    var raw = [], skipped = 0;
    body.forEach(function (r) {
      var ts = parseDate(r[cols.date], now);
      var desc = cols.desc !== -1 && cols.desc !== undefined ? r[cols.desc] : longestText(r, cols);
      var amt;
      if (cols.deb !== -1 && cols.deb !== undefined && cols.amt === -1) {
        var dv = parseMoney(r[cols.deb]);
        amt = isNaN(dv) || dv === 0 ? NaN : Math.abs(dv);
        if (!isNaN(amt)) amt = -amt;   // treat debit columns as "money out" (negative), sign fixed below
      } else amt = parseMoney(r[cols.amt]);
      if (!ts || isNaN(amt) || amt === 0 || !desc) { skipped++; return; }
      raw.push({ ts: ts, desc: String(desc).trim(), amount: amt });
    });
    return finishTxns(raw, skipped);
  }
  function longestText(r, cols) {
    var best = '';
    r.forEach(function (x, i) { if (i !== cols.date && i !== cols.amt && i !== cols.deb && isNaN(parseMoney(x)) && x.length > best.length) best = x; });
    return best;
  }
  function guessColumns(rows, now) {
    var n = Math.max.apply(null, rows.map(function (r) { return r.length; })), dateI = -1, amtI = -1, descI = -1, bestD = 0, bestA = 0, bestT = 0;
    for (var c = 0; c < n; c++) {
      var d = 0, a = 0, t = 0;
      rows.forEach(function (r) { var v = r[c] || ''; if (parseDate(v, now)) d++; else if (!isNaN(parseMoney(v))) a++; else t += v.length; });
      if (d > bestD) { bestD = d; dateI = c; }
      if (a > bestA && c !== dateI) { bestA = a; amtI = c; }
      if (t > bestT) { bestT = t; descI = c; }
    }
    if (dateI === -1 || amtI === -1 || bestD < rows.length / 2) return null;
    return { date: dateI, amt: amtI, deb: -1, cred: -1, desc: descI };
  }

  // Pasted or PDF statement text → purchases. One transaction per line: a date first, money amounts after the description.
  function statementFromText(text, now) {
    var raw = [], skipped = 0;
    var dateRe = /^\s*(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|[A-Za-z]{3,4}\.?\s+\d{1,2}(?:,?\s+\d{4})?)\s+/;
    var moneyRe = /\(?-?\$?\s?\d{1,3}(?:,\d{3})*\.\d{2}\)?(?:\s?CR)?/gi;
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var dm = line.match(dateRe);
      if (!dm) return;
      var ts = parseDate(dm[1], now);
      var rest = line.slice(dm[0].length);
      // Some statements have a second (posting) date right after the first.
      var dm2 = rest.match(dateRe);
      if (dm2 && parseDate(dm2[1], now)) rest = rest.slice(dm2[0].length);
      var amounts = rest.match(moneyRe);
      if (!ts || !amounts) { skipped++; return; }
      // The first money value after the description is the transaction; a later one is usually a running balance.
      var first = amounts[0], idx = rest.indexOf(first);
      var desc = rest.slice(0, idx).replace(/\s+/g, ' ').trim();
      var amt = parseMoney(first.replace(/\s/g, ''));
      if (!desc || isNaN(amt) || amt === 0) { skipped++; return; }
      raw.push({ ts: ts, desc: desc, amount: amt });
    });
    return finishTxns(raw, skipped);
  }

  // Decide which sign means "money out" (most lines on a statement are purchases), drop payments/refunds, and dedupe.
  function finishTxns(raw, skipped) {
    var neg = raw.filter(function (t) { return t.amount < 0; }).length, pos = raw.length - neg;
    var outSign = neg > pos ? -1 : 1, seen = {}, txns = [];
    raw.forEach(function (t) {
      if (Math.sign(t.amount) !== outSign || NOT_SPENDING.test(t.desc)) { skipped++; return; }
      var tx = { ts: t.ts, desc: t.desc, amount: round2(Math.abs(t.amount)) };
      tx.key = importKey(tx);
      // The same line twice in one file is almost always a duplicate copy, not two buys.
      if (seen[tx.key]) { tx.key += '#' + (seen[tx.key]++); } else seen[tx.key] = 1;
      txns.push(tx);
    });
    txns.sort(function (a, b) { return a.ts - b.ts; });
    return { txns: txns, skipped: skipped };
  }
  function importKey(t) {
    var d = new Date(t.ts);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '|' + t.amount.toFixed(2) + '|' + String(t.desc).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // "SQ *LAROSAS PIZZA #123 CINCINNATI OH" → "Larosas Pizza".
  function merchantName(desc) {
    var s = String(desc || '').toLowerCase()
      .replace(/^(pos|dbt|debit card|debit|purchase|check card|card|recurring|visa|mc)\s+(purchase\s+)?(authorized\s+on\s+\d{1,2}\/\d{1,2}\s+)?/g, '')
      .replace(/^(sq|tst|pp|paypal|sp|py|dd|ub|ic|lyft|uber)\s?\*\s?/g, function (m) { return /lyft|uber/.test(m) ? m.replace('*', ' ') : ''; })
      .replace(/#\s?\d+/g, ' ').replace(/\b\d{3,}\b/g, ' ').replace(/[*_]/g, ' ')
      .replace(/\b(oh|ky|in|ca|ny|tx|fl|il|pa|mi|ga|nc|wa|co|az|ma|nj|va|tn|mo|wi|mn)\b\s*$/g, '')
      .replace(/\s+/g, ' ').trim();
    var words = s.split(' ').filter(function (w) { return w && !/\d/.test(w) && !/\.com$/.test(w); }).slice(0, 3);
    if (!words.length) return 'Unknown';
    return words.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  // Which habit a statement line belongs to (first habit whose keyword appears), or null.
  function matchHabit(state, desc) {
    var d = String(desc || '').toLowerCase(), order = cats(state);
    for (var i = 0; i < order.length; i++) {
      var h = state.habits[order[i]], kws = h.keywords && h.keywords.length ? h.keywords : suggestKeywords(h.name);
      for (var j = 0; j < kws.length; j++) if (kws[j] && d.indexOf(String(kws[j]).toLowerCase()) !== -1) return order[i];
    }
    return null;
  }
  // A statement line that's probably a buy you already logged by hand: same habit, within a day, within $1.
  function looksLogged(state, t) {
    if (!t.cat) return false;
    return (state.purchases || []).some(function (p) {
      return p.src !== 'import' && p.cat === t.cat && Math.abs(p.ts - t.ts) <= 1.5 * DAY && Math.abs(p.amount - t.amount) <= 1;
    });
  }
  // Where the money went: per-habit totals, weekly averages, and the biggest merchants that aren't tracked yet.
  function analyzeStatement(state, txns) {
    var order = cats(state), by = {}, other = {}, totalAll = 0;
    order.forEach(function (c) { by[c] = { count: 0, total: 0, txns: [] }; });
    txns.forEach(function (t) {
      totalAll += t.amount;
      var c = matchHabit(state, t.desc);
      t.cat = c;
      if (c) {
        by[c].count++; by[c].total += t.amount; by[c].txns.push(t);
        t.logged = looksLogged(state, t);
        if (t.logged && t.off === undefined) t.off = true;   // unchecked by default so it isn't counted twice
      }
      else {
        var m = merchantName(t.desc);
        other[m] = other[m] || { merchant: m, count: 0, total: 0, sample: t.desc };
        other[m].count++; other[m].total += t.amount;
      }
    });
    var from = txns.length ? txns[0].ts : null, to = txns.length ? txns[txns.length - 1].ts : null;
    var weeks = from ? Math.max(1, (to - from) / (7 * DAY)) : 1;
    order.forEach(function (c) { by[c].total = round2(by[c].total); by[c].perWeek = round2(by[c].total / weeks); });
    var unmatched = Object.keys(other).map(function (k) { other[k].total = round2(other[k].total); return other[k]; })
      .sort(function (a, b) { return b.total - a.total; });
    return { from: from, to: to, weeks: round2(weeks), count: txns.length, total: round2(totalAll), byHabit: by, unmatched: unmatched };
  }
  // Adds matched statement lines to the log as real buys. Skips duplicates and anything outside the plan.
  function applyImport(state, txns, now, importId) {
    var have = {}, added = 0, dupes = 0, outside = 0;
    (state.purchases || []).forEach(function (p) { if (p.key) have[p.key] = true; });
    txns.forEach(function (t) {
      if (!t.cat || !state.habits[t.cat]) return;
      var k = weekIndex(state.startTs, t.ts);
      if (k < 0 || t.ts > now || k < hStartK(state, t.cat)) { outside++; return; }
      if (have[t.key]) { dupes++; return; }
      have[t.key] = true;
      state.purchases.push({ id: 'imp-' + importId + '-' + added, cat: t.cat, amount: t.amount, ts: t.ts, src: 'import', desc: String(t.desc).slice(0, 60), key: t.key, importId: importId });
      added++;
    });
    return { added: added, dupes: dupes, outside: outside };
  }
  function undoImport(state, importId) {
    var before = state.purchases.length;
    state.purchases = state.purchases.filter(function (p) { return p.importId !== importId; });
    return before - state.purchases.length;
  }

  // ---------- Money kept for one week (used by the goal jar) ----------
  // For a finished week: how far under your old pace (starting number ÷ 4) you spent, across habits that had a limit.
  function weekKept(state, k, now) {
    var cur = weekIndex(state.startTs, now);
    if (k < 0 || k > cur) return 0;
    var map = weekMap(state, Math.max(cur, k)), starts = habitStarts(state, map), w = weekSummary(state, k, now), kept = 0;
    if (w.skipped) return 0;
    cats(state).forEach(function (c) { var x = w.cats[c]; if (x.limit !== null && x.limit !== undefined) kept += starts[c].amount / 4 - x.spent; });
    return round2(kept);
  }

  // ---------- Goal jar ----------
  // Only money the user says they actually moved counts. The app can't see a bank, so it never pretends.
  function goalSaved(state) {
    return round2(((state.goal && state.goal.moves) || []).reduce(function (a, m) { return a + (m.amount > 0 ? m.amount : 0); }, 0));
  }
  // Monday suggestion: last finished week's money kept (never negative). 0 = nothing to suggest.
  function suggestMove(state, now) {
    var cur = weekIndex(state.startTs, now);
    if (cur < 1) return { amount: 0, k: -1 };
    var k = cur - 1;
    return { amount: Math.max(0, weekKept(state, k, now)), k: k, weekStart: weekStart(state.startTs, k) };
  }

  // ---------- Quick-log links (Apple Pay automation, Back Tap, NFC) ----------
  // ?log            → open the log sheet (habit picked from the merchant, or the first habit)
  // ?log=Pizza      → open it for that habit (name or id)
  // &amount=19.42   → prefill the amount ("$19.42" and "19,42" also work)
  // &merchant=...   → shown on the sheet, used to pick the habit, saved with the buy
  // Never saves anything by itself: the user always confirms.
  function parseQuickLog(search, state) {
    var p;
    try { p = new URLSearchParams(String(search || '').replace(/^\?/, '')); } catch (e) { return null; }
    if (!p.has('log')) return null;
    var want = (p.get('log') || '').trim().toLowerCase(), order = cats(state), cat = null;
    if (want) order.forEach(function (c) { if (!cat && (c === want || state.habits[c].name.toLowerCase() === want)) cat = c; });
    var merchant = (p.get('merchant') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    var auto = false;
    if (!cat && merchant) { cat = matchHabit(state, merchant); auto = !!cat; }
    var raw = (p.get('amount') || '').replace(/[^\d.,\-]/g, '');
    if (/^\d+,\d{2}$/.test(raw)) raw = raw.replace(',', '.');       // "19,42"
    raw = raw.replace(/,/g, '');
    var amt = raw ? Math.abs(parseFloat(raw)) : NaN;
    return { cat: cat || order[0], matched: !!cat, autoMatched: auto, amount: amt > 0 && amt < 10000 ? round2(amt) : null, merchant: merchant };
  }

  // ---------- Report card link ----------
  // A week's summary packed into the link after "#" (never sent to any server). Numbers only, no purchase list.
  function cardData(state, k, now) {
    var w = weekSummary(state, k, now), st = stats(state, now), res = resistStats(state, w.start, w.end), h = [];
    cats(state).forEach(function (c) {
      var x = w.cats[c]; if (x.notYet) return;
      h.push([state.habits[c].emoji, state.habits[c].name, x.spent, x.limit, x.pct === undefined ? null : x.pct]);
    });
    var g = state.goal && state.goal.target > 0 ? [state.goal.target, goalSaved(state)] : null;
    return { v: 1, d: state.demo ? 1 : 0, ws: w.start, pw: k + 1, c: w.isCurrent ? 1 : 0, sk: w.skipped ? 1 : 0, h: h,
      st: [st.streak, st.best, st.kept, st.weeksJudged], r: [res.count, res.value], why: state.why || '', g: g };
  }
  function b64urlEncode(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function encodeCard(data) { return b64urlEncode(JSON.stringify(data)); }
  // Anything in a link can be forged or broken, so every field is checked and clamped. Bad input → null.
  function decodeCard(s) {
    var o;
    try { o = JSON.parse(b64urlDecode(s)); } catch (e) { return null; }
    if (!o || o.v !== 1 || !Array.isArray(o.h)) return null;
    var num = function (x, lo, hi) { x = Number(x); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : 0; };
    var str = function (x, n) { return typeof x === 'string' ? x.slice(0, n) : ''; };
    var h = o.h.slice(0, MAX_HABITS).filter(Array.isArray).map(function (r) {
      return { emoji: str(r[0], 8), name: str(r[1], 16), spent: num(r[2], 0, 1e5),
        limit: r[3] === null || r[3] === undefined ? null : num(r[3], 0, 1e5), pct: r[4] === null || r[4] === undefined ? null : num(r[4], 0, 100) };
    });
    var st = Array.isArray(o.st) ? o.st : [], rr = Array.isArray(o.r) ? o.r : [];
    return { demo: !!o.d, weekStart: num(o.ws, 0, 9e15), planWeek: num(o.pw, 1, 9999), current: !!o.c, skipped: !!o.sk, habits: h,
      streak: num(st[0], 0, 9999), best: num(st[1], 0, 9999), kept: num(st[2], -1e6, 1e6), judged: num(st[3], 0, 9999),
      resisted: num(rr[0], 0, 9999), resistedValue: num(rr[1], 0, 1e6), why: str(o.why, 40),
      goal: Array.isArray(o.g) ? { target: num(o.g[0], 0, 1e6), saved: num(o.g[1], 0, 1e6) } : null };
  }

  // ---------- Demo mode ----------
  // Sample data for testers: week 7 of the plan (block 2, week 3). Block 1 had pizza $60/wk and cash $40/wk,
  // so the limits are $54 and $36. Two finished block-2 weeks under the limit = a 2-week streak.
  // This week: one cash buy, no pizza yet → 2 Pizza buys left. Log a ~$20 pizza → "Last one this week."
  function makeDemo(now) {
    var thisMon = mondayOptions(now)[0];
    var d = new Date(thisMon); d.setDate(d.getDate() - 42);
    var start = d.getTime(), P = [], n = 0;
    function buy(k, cat, amount, dayOffset, hour) {
      var t = new Date(weekStart(start, k)); t.setDate(t.getDate() + dayOffset); t.setHours(hour, 0, 0, 0);
      P.push({ id: 'demo-' + (n++), cat: cat, amount: amount, ts: t.getTime() });
    }
    for (var k = 0; k < 4; k++) {               // block 1: measuring
      buy(k, 'a', 22, 1, 19); buy(k, 'a', 19, 3, 20); buy(k, 'a', 19, 5, 21);
      buy(k, 'b', 20, 2, 17); buy(k, 'b', 20, 5, 16);
    }
    buy(4, 'a', 20, 1, 19); buy(4, 'a', 19, 4, 20); buy(4, 'b', 20, 3, 17);   // under: 39/54, 20/36
    buy(5, 'a', 21, 2, 19); buy(5, 'a', 18, 5, 21); buy(5, 'b', 15, 3, 16);   // under: 39/54, 15/36
    var cur = new Date(thisMon); cur.setHours(9, 0, 0, 0);
    P.push({ id: 'demo-' + (n++), cat: 'b', amount: 15, ts: Math.min(cur.getTime(), now) });
    var t = now - 2 * DAY;
    return {
      demo: true, startTs: start, purchases: P, skips: [], seen: { a: 2, b: 2 }, wage: 20, why: 'Spring break fund',
      habits: { a: { name: 'Pizza', emoji: '🍕', startK: 0, keywords: suggestKeywords('Pizza') },
                b: { name: 'Cash', emoji: '💵', startK: 0, keywords: suggestKeywords('Cash') } },
      order: ['a', 'b'],
      resists: [{ id: 'demo-r1', cat: 'a', ts: t, until: t + RESIST_MS, amount: 20, status: 'won' }],
      sharedWeeks: [],
      goal: { target: 400, moves: [{ id: 'demo-m1', amount: 21, ts: weekStart(start, 5) + DAY }, { id: 'demo-m2', amount: 15, ts: weekStart(start, 6) + 2 * 3600e3 }], asked: [weekStart(start, 4), weekStart(start, 5)] }
    };
  }

  // Bring any older save up to date: generic habit ids, display order, per-habit start week, keywords, block reports.
  function migrate(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    var old = { pizza: 'a', cash: 'b' };
    if (Array.isArray(obj.purchases)) obj.purchases.forEach(function (p) { if (p && old[p.cat]) p.cat = old[p.cat]; });
    var h = obj.habits && typeof obj.habits === 'object' ? obj.habits : null;
    var valid = h && Object.keys(h).some(function (c) { return h[c] && typeof h[c].name === 'string' && h[c].name.trim(); });
    if (!valid) obj.habits = h = { a: { name: 'Pizza', emoji: '🍕' }, b: { name: 'Cash', emoji: '💵' } };
    Object.keys(h).forEach(function (c) {
      if (!h[c] || typeof h[c].name !== 'string' || !h[c].name.trim()) { delete h[c]; return; }
      if (typeof h[c].startK !== 'number' || h[c].startK < 0) h[c].startK = 0;
      if (!Array.isArray(h[c].keywords)) h[c].keywords = suggestKeywords(h[c].name);
      if (!h[c].emoji) h[c].emoji = '•';
    });
    obj.order = cats(obj);
    if (!obj.seen || typeof obj.seen !== 'object') {
      obj.seen = {};
      obj.order.forEach(function (c) { obj.seen[c] = typeof obj.seenReport === 'number' ? obj.seenReport : 1; });
    }
    return obj;
  }

  // Backup file: validate before restoring so a bad file can't wipe real data.
  function validBackup(obj) {
    if (!obj || typeof obj.startTs !== 'number' || !Array.isArray(obj.purchases) || !Array.isArray(obj.skips || [])) return false;
    var ids = obj.habits ? Object.keys(obj.habits) : DEFAULT_CATS;
    return obj.purchases.every(function (p) { return p && ids.indexOf(p.cat) !== -1 && typeof p.amount === 'number' && p.amount > 0 && typeof p.ts === 'number'; });
  }

  root.NoExcuses = {
    CATS: DEFAULT_CATS, MAX_HABITS: MAX_HABITS, cats: cats, weekStart: weekStart, weekIndex: weekIndex, blockPct: blockPct,
    weekMap: weekMap, habitMap: habitMap, compute: compute, tripsLeft: tripsLeft, mondayOptions: mondayOptions,
    weekSummary: weekSummary, stats: stats, blocks: blocks, habitBlocks: habitBlocks, quickAmounts: quickAmounts,
    validBackup: validBackup, migrate: migrate,
    RESIST_MS: RESIST_MS, typicalBuy: typicalBuy, resolveResists: resolveResists, resistStats: resistStats,
    workTime: workTime, yearlyPace: yearlyPace, makeDemo: makeDemo,
    suggestKeywords: suggestKeywords, addHabit: addHabit, deleteHabit: deleteHabit,
    parseCSV: parseCSV, parseDate: parseDate, parseMoney: parseMoney, statementFromCSV: statementFromCSV, statementFromText: statementFromText,
    merchantName: merchantName, looksLogged: looksLogged, weekKept: weekKept, goalSaved: goalSaved, suggestMove: suggestMove,
    parseQuickLog: parseQuickLog, cardData: cardData, encodeCard: encodeCard, decodeCard: decodeCard, matchHabit: matchHabit, analyzeStatement: analyzeStatement, applyImport: applyImport, undoImport: undoImport
  };
})(typeof window !== 'undefined' ? window : globalThis);
