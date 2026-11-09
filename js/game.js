/*
 * Poranne TNT - a stick of dynamite whose fuse burns down to the time the kid
 * has to leave for kindergarten. "Wychodzimy!" before the deadline douses the
 * fuse and earns a star; miss it and it goes BUM.
 * ES5 only: the TV runs WebKit 538 (Tizen 3.0).
 */
(function () {
  "use strict";

  var W = 1920, H = 1080;
  var DAY_SETS = [
    { k: "pnpt", t: "pon.–pt.", d: [1, 2, 3, 4, 5] },
    { k: "pnsb", t: "pon.–sob.", d: [1, 2, 3, 4, 5, 6] },
    { k: "all", t: "codziennie", d: [0, 1, 2, 3, 4, 5, 6] }
  ];
  var DEFAULTS = { name: "", leave: "08:30", start: "07:45", days: "pnpt", sound: true, autostart: true, city: "Warszawa" };
  var WEEKDAYS = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  var WD_SHORT = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];
  var MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia",
                "września", "października", "listopada", "grudnia"];
  var AFTER_DEADLINE_MS = 60 * 60000;   // explode if opened up to 1 h late; later = idle
  var EXIT_AFTER_MS = 5 * 60000;        // leave the TV alone after a finished morning
  var DEMO_MS = 60000;

  // id = what tnt.tasks remembers as done; days = only on these weekdays (5 = Friday)
  var TASKS = [
    { id: "siku", t: "Siku", svg: '<rect x="58" y="8" width="30" height="40" rx="5" fill="#e8eef5"/>' +
        '<path d="M12 52h76q0 26-26 32l4 10H34l4-10Q12 78 12 52z" fill="#fff"/><rect x="9" y="45" width="82" height="10" rx="5" fill="#9fd3ff"/>' +
        '<path d="M30 18q-8 12 0 14q8-2 0-14z" fill="#5aa9ff"/>' },
    { id: "ubranie", t: "Ubranie", svg: '<path d="M35 12L20 18 6 36l14 10 6-6v50h48V40l6 6 14-10-14-18-15-6Q50 26 35 12z" fill="#5aa9ff"/>' },
    { id: "sniadanie", t: "Śniadanie", svg: '<rect x="58" y="8" width="9" height="46" rx="4" fill="#d9d9d9" transform="rotate(28 62 31)"/>' +
        '<path d="M10 48h80q-2 36-40 40Q12 84 10 48z" fill="#ffb347"/><ellipse cx="50" cy="48" rx="40" ry="9" fill="#fff3d6"/>' },
    { id: "zeby", t: "Zęby", svg: '<g transform="rotate(-38 50 50)"><rect x="8" y="46" width="76" height="13" rx="6" fill="#4fd1c5"/>' +
        '<rect x="60" y="28" width="26" height="18" rx="4" fill="#fff"/><path d="M63 28v-6M69 28v-6M75 28v-6M81 28v-6" stroke="#bfefff" stroke-width="3"/></g>' },
    { id: "buty", t: "Buty", svg: '<path d="M8 72V36q0-8 8-8h18q4 20 24 24l26 6q10 3 10 14v6H8z" fill="#e05a5a"/>' +
        '<rect x="8" y="78" width="86" height="9" rx="3" fill="#333"/><path d="M38 40l8-4M42 47l8-4" stroke="#fff" stroke-width="3"/>' },
    { id: "kurtka", t: "Kurtka", svg: '<path d="M34 10q16 12 32 0l18 10 10 60-16 2-2 10H24l-2-10-16-2 10-60z" fill="#8a6cff"/>' +
        '<path d="M50 20v72" stroke="#2a1f66" stroke-width="4"/><circle cx="40" cy="60" r="3" fill="#2a1f66"/><circle cx="60" cy="60" r="3" fill="#2a1f66"/>' },
    { id: "zabawka", t: "Zabawka", days: [5], svg: '<circle cx="28" cy="20" r="11" fill="#b87a45"/><circle cx="72" cy="20" r="11" fill="#b87a45"/>' +
        '<circle cx="24" cy="66" r="10" fill="#a86c3a"/><circle cx="76" cy="66" r="10" fill="#a86c3a"/>' +
        '<circle cx="36" cy="90" r="9" fill="#a86c3a"/><circle cx="64" cy="90" r="9" fill="#a86c3a"/>' +
        '<ellipse cx="50" cy="70" rx="25" ry="22" fill="#b87a45"/><ellipse cx="50" cy="74" rx="13" ry="12" fill="#e8c39e"/>' +
        '<circle cx="50" cy="36" r="24" fill="#c4874f"/><ellipse cx="50" cy="45" rx="10" ry="7" fill="#e8c39e"/>' +
        '<circle cx="41" cy="32" r="3" fill="#2b1a0e"/><circle cx="59" cy="32" r="3" fill="#2b1a0e"/><circle cx="50" cy="42" r="3.5" fill="#2b1a0e"/>' },
    { id: "wyzwanie", t: "Wyzwanie", extra: true, svg: '<path d="M50 6l13 27 30 4-22 21 5 30-26-14-26 14 5-30L7 37l30-4z" fill="#ffd23a"/>' +
        '<path d="M50 22l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#ffe98a"/>' }
  ];

  // The jacket and shoe tiles follow the weather (see Weather.summary().wear).
  var WEAR = {
    cold: { t: "Kurtka i czapka", svg: '<path d="M16 64q0-48 34-48t34 48z" fill="#e05a5a"/><rect x="12" y="58" width="76" height="20" rx="9" fill="#c43c3c"/>' +
        '<circle cx="50" cy="14" r="10" fill="#fff"/><path d="M28 42q22-9 44 0" stroke="#ff9a9a" stroke-width="5" fill="none"/>' },
    hoodie: { t: "Bluza", svg: '<path d="M34 10q16 12 32 0l18 10 10 60-16 2-2 10H24l-2-10-16-2 10-60z" fill="#3fb37f"/>' +
        '<path d="M32 10q18 26 36 0" fill="#2c8a5f"/><rect x="38" y="60" width="24" height="14" rx="4" fill="#2c8a5f"/>' },
    cap: { t: "Czapka z daszkiem", svg: '<path d="M16 62q0-42 36-42t36 42z" fill="#5aa9ff"/><path d="M50 62h46q4 10-8 12H50z" fill="#2f6fb3"/>' +
        '<circle cx="52" cy="20" r="6" fill="#2f6fb3"/>' }
  };
  var SHOES = {
    rain: { t: "Kalosze", svg: '<path d="M26 10h36v54l26 8q8 3 8 12v6H20V16q0-6 6-6z" fill="#ffd23a"/><rect x="20" y="88" width="76" height="7" rx="2" fill="#333"/>' +
        '<path d="M26 26h36" stroke="#e0a800" stroke-width="5"/>' },
    snow: { t: "Śniegowce", svg: '<path d="M24 28h38v38l24 8q10 3 10 12v6H18V34q0-6 6-6z" fill="#4a6fa5"/><rect x="18" y="12" width="48" height="20" rx="10" fill="#fff"/>' +
        '<rect x="18" y="88" width="78" height="7" rx="2" fill="#222"/>' }
  };

  // One per day; the cat reads it out and the star tile ticks it off.
  var CHALLENGES = [
    "Zrób 10 żabich skoków!", "Przytul kogoś z rodziny!", "Powiedz komuś coś miłego!", "Załóż skarpetkę, stojąc na jednej nodze!",
    "Zrób 10 przysiadów!", "Policz do 20!", "Zaśpiewaj ulubioną piosenkę!", "Wypij szklankę wody!", "Pościel łóżko!",
    "Zanieś talerz do zlewu!", "Zrób minę tygrysa w lustrze!", "Stój na jednej nodze i policz do 10!", "Zrób 10 pajacyków!",
    "Powiedz po angielsku: Good morning!", "Odłóż piżamę na miejsce!", "Przejdź 5 kroków jak pingwin!", "Podskocz 10 razy jak kangur!",
    "Pokaż 3 rzeczy w kolorze czerwonym!", "Wymień 3 zwierzęta na literę K!", "Zrób pozę superbohatera!", "Przejdź przez pokój na palcach!",
    "Zgaś światło w swoim pokoju!", "Uśmiechnij się do lustra!", "Narysuj palcem w powietrzu słońce!", "Daj buziaka na do widzenia!",
    "Zamiaucz jak kotek strażak!", "Zrób 5 obrotów jak baletnica!", "Policz, ile masz guzików!", "Wymień wszystkie dni tygodnia!",
    "Zrób 5 pompek!", "Przybij piątkę komuś z domu!", "Powiedz, co dziś zjadłeś na śniadanie!"
  ];

  // ------------------------------------------------------------ storage
  function load(key, def) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      if (v && typeof v === "object") {
        for (var p in def) if (!(p in v)) v[p] = def[p];
        return v;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(def));
  }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  var cfg = load("tnt.cfg", DEFAULTS);
  var hist = load("tnt.hist", {});            // "2026-11-02" -> {r: "ok"|"boom", early: minutes}
  var taskState = load("tnt.tasks", { day: "", done: [] });
  var wxCache = load("tnt.wx", { city: "", at: 0, h: null });   // last Open-Meteo hourly forecast

  // ------------------------------------------------------------ time
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; }
  function fmtHM(min) { min = (min + 1440) % 1440; return Math.floor(min / 60) + ":" + pad(min % 60); }
  function at(d, s) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, hm(s)).getTime(); }
  function dayKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function daySet() { for (var i = 0; i < DAY_SETS.length; i++) if (DAY_SETS[i].k === cfg.days) return DAY_SETS[i]; return DAY_SETS[0]; }
  function schoolDay(d) { return daySet().d.indexOf(d.getDay()) >= 0; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function $(id) { return document.getElementById(id); }

  // ------------------------------------------------------------ state
  var demo = null;          // {start, end, result}
  var mode = "";            // free | waiting | burning | defused | boom | idle
  var anim = { boomAt: 0, defuseAt: 0 };
  var lastInput = Date.now(), finishedAt = 0;

  function window_(now) {
    if (demo) return { s: demo.start, e: demo.end };
    var d = new Date(now);
    return { s: at(d, cfg.start), e: at(d, cfg.leave) };
  }

  function computeMode(now) {
    if (demo) return demo.result || (now < demo.end ? "burning" : "boom");
    var d = new Date(now), rec = hist[dayKey(d)];
    if (rec) return rec.r === "ok" ? "defused" : "boom";
    if (!schoolDay(d)) return "free";
    var w = window_(now);
    if (now < w.s) return "waiting";
    if (now < w.e) return "burning";
    if (now - w.e < AFTER_DEADLINE_MS) return "boom";
    return "idle";
  }

  function fuseFrac(now) {
    var w = window_(now);
    return clamp((w.e - now) / (w.e - w.s), 0, 1);
  }

  // ------------------------------------------------------------ fuse geometry
  var FUSE_CTRL = [[1262, 566], [1254, 492], [1284, 428], [1370, 400], [1476, 424], [1572, 400],
                   [1640, 338], [1630, 272], [1560, 246], [1490, 270], [1478, 326], [1524, 352]];
  var fuse = (function () {
    var pts = [], P = FUSE_CTRL, i, j;
    function cr(p0, p1, p2, p3, t) {
      var t2 = t * t, t3 = t2 * t;
      return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
    }
    for (i = 0; i < P.length - 1; i++) {
      var p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
      for (j = 0; j < 24; j++) {
        var t = j / 24;
        pts.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]);
      }
    }
    pts.push(P[P.length - 1]);
    var len = [0];
    for (i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.sqrt(Math.pow(pts[i][0] - pts[i - 1][0], 2) + Math.pow(pts[i][1] - pts[i - 1][1], 2)));
    return { pts: pts, len: len, total: len[len.length - 1] };
  })();

  // Index of the last point within `l` px of the fuse base, plus the exact point.
  function fuseAt(l) {
    var L = fuse.len, i = 1;
    while (i < L.length - 1 && L[i] < l) i++;
    var a = fuse.pts[i - 1], b = fuse.pts[i], f = (l - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    f = clamp(f, 0, 1);
    return { i: i, x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
  }

  // ------------------------------------------------------------ static scene
  var bg = $("bg").getContext("2d"), fx = $("fx").getContext("2d");
  var TNT = { cx: 1262, base: 1000, sw: 150, sh: 430 };

  function drawBackground(c) {
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1b1638"); g.addColorStop(1, "#2d2147");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var r = c.createRadialGradient(TNT.cx, 760, 40, TNT.cx, 760, 620);
    r.addColorStop(0, "rgba(255,210,150,0.18)"); r.addColorStop(1, "rgba(255,210,150,0)");
    c.fillStyle = r; c.fillRect(0, 0, W, H);
    c.fillStyle = "#171226"; c.fillRect(0, 1000, W, 80);
    c.fillStyle = "rgba(0,0,0,0.35)";
    c.beginPath(); c.ellipse ? c.ellipse(TNT.cx, 1004, 300, 26, 0, 0, Math.PI * 2) : c.arc(TNT.cx, 1004, 26, 0, Math.PI * 2); c.fill();
  }

  function oval(c, x, y, rx, ry) { Props.oval(c, x, y, rx, ry); }

  // Today's thing at the end of the fuse (a demo shows the next one each time).
  var demoProps = 0;
  function prop() {
    var i = Props.forDay(new Date());
    if (demo) i += demo.prop;
    return Props.list[i % Props.list.length];
  }

  // garden hose from the bucket to the cat (both are DOM elements on top)
  function drawHose(c) {
    c.lineCap = "round";
    c.beginPath(); c.moveTo(1812, 980); c.bezierCurveTo(1790, 1010, 1730, 1006, 1700, 950);
    c.lineWidth = 16; c.strokeStyle = "#7a1010"; c.stroke();
    c.lineWidth = 8; c.strokeStyle = "#c62828"; c.stroke();
  }

  function paintStatic() {
    drawBackground(bg);
    drawHose(bg);
    if (mode === "boom") prop().remains(bg); else prop().draw(bg);
  }

  // ------------------------------------------------------------ particles
  var parts = [];
  function spawn(p) { if (parts.length < 900) parts.push(p); }

  function emitSparks(x, y, dt, urgency) {
    var n = (50 + 220 * urgency) * dt;
    while (n > 0) {
      if (n >= 1 || Math.random() < n) {
        var a = rnd(0, Math.PI * 2), sp = rnd(80, 340 + 300 * urgency);
        spawn({ k: "spark", x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: rnd(0.25, 0.6), age: 0 });
      }
      n -= 1;
    }
    if (Math.random() < dt * (2 + 4 * urgency))
      spawn({ k: "smoke", x: x + rnd(-6, 6), y: y - 10, vx: rnd(-15, 15), vy: rnd(-70, -40), r: rnd(10, 18), gr: 26, life: rnd(1.6, 2.6), age: 0, c: "200,200,210", a: 0.35 });
  }

  function explode() {
    var cx = TNT.cx, cy = 800, i, a, sp, pr = prop();
    for (i = 0; i < 70; i++) {
      a = rnd(0, Math.PI * 2); sp = rnd(150, 900);
      spawn({ k: "fire", x: cx + rnd(-60, 60), y: cy + rnd(-120, 120), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8 - 120,
              r: rnd(40, 110), life: rnd(0.6, 1.5), age: 0, pal: pr.fire, solid: pr.solid });
    }
    var cols = pr.debris;
    for (i = 0; i < 90; i++) {
      a = rnd(-Math.PI, 0); sp = rnd(400, 1500);
      spawn({ k: "debris", x: cx + rnd(-150, 150), y: cy + rnd(-150, 150), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              w: rnd(10, 46), h: rnd(8, 24), rot: rnd(0, 6), vr: rnd(-12, 12), c: cols[i % cols.length], life: rnd(1.5, 3), age: 0 });
    }
    for (i = 0; i < 26; i++)
      spawn({ k: "smoke", x: cx + rnd(-260, 260), y: cy + rnd(-160, 200), vx: rnd(-40, 40), vy: rnd(-90, -30),
              r: rnd(70, 140), gr: 60, life: rnd(4, 8), age: -rnd(0, 0.6), c: pr.smoke, a: pr.solid ? 0.25 : 0.7 });
    spawn({ k: "ring", x: cx, y: cy, life: 0.7, age: 0 });
  }

  // The cat's hose: water flies in an arc from the nozzle and lands on the flame.
  var NOZZLE = { x: 1588, y: 849 }, G = 1400;
  function jet(tx, ty) {
    var T = rnd(0.45, 0.6), sx = NOZZLE.x + rnd(-4, 4), sy = NOZZLE.y + rnd(-4, 4);
    spawn({ k: "jet", x: sx, y: sy, vx: (tx + rnd(-14, 14) - sx) / T, vy: (ty - sy) / T - 0.5 * G * T, tx: tx, ty: ty, life: T, age: 0 });
  }

  function confetti() {
    var cols = ["#f7c331", "#7be07b", "#5aa9ff", "#ff6fa8", "#ffffff", "#ff8a3c", "#b38cff"];
    for (var i = 0; i < 240; i++)
      spawn({ k: "conf", x: rnd(0, W), y: rnd(-H, -20), vx: rnd(-40, 40), vy: rnd(160, 340), w: rnd(12, 22), h: rnd(6, 12),
              rot: rnd(0, 6), vr: rnd(-6, 6), sw: rnd(0, 6), c: cols[i % cols.length], life: 9, age: 0 });
  }

  function updateParts(dt) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.age += dt;
      if (p.age < 0) continue;
      if (p.age > p.life) { parts.splice(i, 1); continue; }
      if (p.k === "spark") { p.vy += 500 * dt; }
      else if (p.k === "debris") { p.vy += 1800 * dt; p.rot += p.vr * dt; if (p.y > 1000 && p.vy > 0) { p.y = 1000; p.vy *= -0.3; p.vx *= 0.6; p.vr *= 0.5; } }
      else if (p.k === "fire") { p.vx *= 1 - 2.5 * dt; p.vy *= 1 - 2.5 * dt; p.vy -= 60 * dt; }
      else if (p.k === "smoke") { p.r += p.gr * dt; }
      else if (p.k === "conf") { p.rot += p.vr * dt; p.sw += dt * 3; p.x += Math.sin(p.sw) * 40 * dt; if (p.y > H + 30) p.age = p.life; }
      else if (p.k === "jet") {
        p.vy += G * dt;
        if (p.age + dt >= p.life && Math.random() < 0.3)
          spawn({ k: "smoke", x: p.tx, y: p.ty, vx: rnd(-30, 30), vy: rnd(-120, -60), r: rnd(14, 26), gr: 40, life: rnd(1.2, 2.2), age: 0, c: "235,240,250", a: 0.55 });
      }
      p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
    }
  }

  function fire(c, p, t) {
    var pal = p.pal;
    c.globalAlpha = (1 - t) * 0.9;
    c.fillStyle = t < 0.15 ? pal[0] : t < 0.35 ? pal[1] : t < 0.6 ? pal[2] : pal[3];
    c.beginPath(); c.arc(p.x, p.y, p.r * (0.6 + t), 0, Math.PI * 2); c.fill();
  }

  function drawParts(c) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], t = p.age / p.life;
      if (p.age < 0) continue;
      if (p.k === "smoke") {
        c.globalAlpha = p.a * (1 - t); c.fillStyle = "rgb(" + p.c + ")";
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
      }
    }
    c.globalCompositeOperation = "lighter";
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; t = p.age / p.life;
      if (p.age < 0) continue;
      if (p.k === "spark") {
        c.globalAlpha = 1 - t; c.strokeStyle = t < 0.4 ? "#fff6c0" : "#ffb030"; c.lineWidth = 3;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); c.stroke();
      } else if (p.k === "fire" && !p.solid) {
        fire(c, p, t);
      } else if (p.k === "ring") {
        c.globalAlpha = 1 - t; c.strokeStyle = "#fff2c0"; c.lineWidth = 30 * (1 - t) + 2;
        c.beginPath(); c.arc(p.x, p.y, 1500 * t, 0, Math.PI * 2); c.stroke();
      }
    }
    c.globalCompositeOperation = "source-over";
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; t = p.age / p.life;
      if (p.age < 0) continue;
      if (p.k === "debris" || p.k === "conf") {
        c.globalAlpha = p.k === "debris" ? Math.min(1, (1 - t) * 3) : 1;
        c.fillStyle = p.c;
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.k === "conf" ? p.h * Math.abs(Math.cos(p.sw * 2)) + 1 : p.h);
        c.restore();
      } else if (p.k === "fire" && p.solid) {
        fire(c, p, t);
      } else if (p.k === "jet") {
        c.globalAlpha = 0.85; c.strokeStyle = "#7cc4ff"; c.lineWidth = 12; c.lineCap = "round";
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); c.stroke();
      }
    }
    c.globalAlpha = 1;
  }

  // ------------------------------------------------------------ fuse rendering
  function drawFuse(c, frac, lit, now) {
    var remain = fuse.total * frac, end = fuseAt(remain), P = fuse.pts, i;
    if (remain > 1) {
      c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(P[0][0], P[0][1]);
      for (i = 1; i < end.i; i++) c.lineTo(P[i][0], P[i][1]);
      c.lineTo(end.x, end.y);
      c.lineWidth = 20; c.strokeStyle = "#5a4020"; c.stroke();
      c.lineWidth = 14; c.strokeStyle = "#d9b77a"; c.stroke();
      if (c.setLineDash) {
        c.setLineDash([4, 9]); c.lineWidth = 14; c.strokeStyle = "#9c7a44"; c.stroke(); c.setLineDash([]);
      }
    }
    if (!lit) return end;
    // short glowing ash right behind the flame
    var ash = fuseAt(Math.min(fuse.total, remain + 34));
    c.beginPath(); c.moveTo(end.x, end.y); c.lineTo(ash.x, ash.y);
    c.lineWidth = 8; c.strokeStyle = "#3a2a24"; c.stroke();
    var flick = 0.8 + 0.2 * Math.sin(now / 37) + 0.1 * Math.sin(now / 13);
    c.globalCompositeOperation = "lighter";
    var r = 70 * flick, g = c.createRadialGradient(end.x, end.y, 2, end.x, end.y, r);
    g.addColorStop(0, "rgba(255,250,220,1)"); g.addColorStop(0.25, "rgba(255,200,60,0.8)"); g.addColorStop(1, "rgba(255,90,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(end.x, end.y, r, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = "source-over";
    return end;
  }

  // ------------------------------------------------------------ UI text
  function plMin(n) {
    if (n === 1) return "minuta";
    var d = n % 10, dd = n % 100;
    return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? "minuty" : "minut";
  }

  function renderWeek(now) {
    var d = new Date(now), mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    var html = '<div class="days">', set = daySet().d;
    for (var i = 0; i < 7; i++) {
      var x = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
      if (set.indexOf(x.getDay()) < 0) continue;
      var rec = hist[dayKey(x)], cls = "day" + (dayKey(x) === dayKey(d) ? " today" : "") + (rec ? " " + rec.r + (rec.full ? " full" : "") : "");
      html += '<div class="' + cls + '">' + WD_SHORT[x.getDay()] + '<div class="dot">' + (rec ? (rec.r === "ok" ? "★" : "✕") : "") + "</div></div>";
    }
    html += "</div>";
    var s = streak(d);
    html += '<div class="streak">' + (s >= 2 ? "Seria: " + s + " dni z rzędu ★" : "") + "</div>";
    $("week").innerHTML = html;
  }

  function streak(d) {
    var n = 0, x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (!hist[dayKey(x)]) x.setDate(x.getDate() - 1);      // today still open: count from yesterday
    for (var guard = 0; guard < 400; guard++, x.setDate(x.getDate() - 1)) {
      if (!schoolDay(x)) continue;
      var r = hist[dayKey(x)];
      if (!r || r.r !== "ok") break;
      n++;
    }
    return n;
  }

  var lastText = "";
  // ", Imię" for greetings; nothing when no name is set
  function who() { return cfg.name ? ", " + esc(cfg.name) : ""; }
  function renderText(now) {
    var d = new Date(now), w = window_(now), big = $("big"), cls = "big", lbl = "", left = "", sub = "";
    $("hello").innerHTML = "Dzień dobry" + who() + "!";
    $("date").innerHTML = WEEKDAYS[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()] +
      " · " + d.getHours() + ":" + pad(d.getMinutes()) + (demo ? " · próba" : "");
    var ms = w.e - now, min = Math.ceil(ms / 60000);
    if (mode === "burning" || mode === "waiting") {
      lbl = "Do wyjścia zostało";
      if (ms < 60000) left = Math.max(0, Math.ceil(ms / 1000)) + " s";
      else left = min + " min";
      sub = mode === "waiting" ? (prop().fill ? "lawa zacznie rosnąć o " : "lont zapali się o ") + fmtHM(hm(cfg.start)) : "wyjście o " + fmtHM(hm(cfg.leave));
      if (demo) sub = "pokaz próbny";
      if (ms < 5 * 60000) cls += " hot"; else if (ms < 10 * 60000) cls += " warn";
    } else if (mode === "defused") {
      var rec = demo ? demo.rec : hist[dayKey(d)], e = rec ? rec.early : 0;
      lbl = "Brawo" + who() + "!";
      left = "Zdążyliśmy!";
      sub = e > 0 ? "wyjście " + e + " " + plMin(e) + " przed czasem ★" : "w ostatniej chwili! ★";
      cls += " good";
    } else if (mode === "boom") {
      lbl = "Ups, za późno…";
      left = "Spóźnienie";
      sub = "Jutro się uda" + who() + "!";
      cls += " bad";
    } else if (mode === "free") {
      lbl = "Dziś nie ma przedszkola";
      left = "Wolne!";
      sub = "Miłego dnia :)";
      cls += " good";
    } else {
      lbl = "Na dziś koniec";
      left = fmtHM(d.getHours() * 60 + d.getMinutes());
      sub = "jutro lont zapali się o " + fmtHM(hm(cfg.start));
    }
    if (mode === "defused" || mode === "boom") left = '<span style="font-size:' + (mode === "boom" ? 130 : 150) + 'px">' + left + "</span>";
    var key = cls + lbl + left + sub;
    if (key === lastText) return;
    lastText = key;
    big.className = cls;
    $("lbl").innerHTML = lbl; $("left").innerHTML = left; $("sub").innerHTML = sub;
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // ------------------------------------------------------------ tasks + focus
  var focus = 99;                // index into tasksToday(); its length (or more) = the "Wychodzimy!" button
  // a demo ticks on its own empty list, so it never touches the real morning
  function saveTasks() { if (!demo) save("tnt.tasks", taskState); }

  function todayTasks() {
    var k = dayKey(new Date());
    // older versions stored indices; a new day or such a list starts empty
    if (taskState.day !== k || typeof taskState.done[0] === "number") { taskState = { day: k, done: [] }; saveTasks(); }
    return taskState.done;
  }

  function dayIndex(d, n) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) % n; }
  function challenge() { return CHALLENGES[(dayIndex(new Date(), CHALLENGES.length) * 7) % CHALLENGES.length]; }

  function tasksToday() {
    var wd = new Date().getDay(), out = [], w = weather();
    for (var i = 0; i < TASKS.length; i++) {
      var t = TASKS[i];
      if (t.days && t.days.indexOf(wd) < 0) continue;
      var v = !w ? null : t.id === "kurtka" ? WEAR[w.wear] : t.id === "buty" ? SHOES[w.snow ? "snow" : w.rain ? "rain" : ""] : null;
      out.push(v ? { id: t.id, t: v.t, svg: v.svg } : t);
    }
    return out;
  }

  function doneCount() {
    var done = todayTasks(), list = tasksToday(), n = 0;
    for (var i = 0; i < list.length; i++) if (done.indexOf(list[i].id) >= 0) n++;
    return { n: n, of: list.length };
  }

  function nextTask() {
    var done = todayTasks(), list = tasksToday();
    for (var i = 0; i < list.length; i++) if (done.indexOf(list[i].id) < 0 && list[i].id !== "wyzwanie") return list[i];
    return null;
  }

  var playUI = false;
  function renderTasks() {
    var done = todayTasks(), list = tasksToday(), html = "";
    if (focus > list.length) focus = list.length;
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      html += '<div class="task' + (done.indexOf(t.id) >= 0 ? " done" : "") + (t.days || t.extra ? " extra" : "") +
        (t.t.length > 10 ? " long" : "") + (focus === i ? " sel" : "") + '">' +
        '<svg viewBox="0 0 100 100">' + t.svg + '</svg><div class="tl">' + t.t + '</div><div class="chk">✓</div></div>';
    }
    $("tasks").innerHTML = html;
    $("tasks").className = "tasks" + (list.length >= 8 ? " many" : "") + (playUI ? "" : " hidden");
    var go = $("go");
    go.className = "go" + (focus === list.length ? " sel" : "");
    renderChallenge(list, done);
  }

  // The bubble above the star tile; turns green once the challenge is done.
  function renderChallenge(list, done) {
    var el = $("chal"), i = 0;
    while (i < list.length && list[i].id !== "wyzwanie") i++;
    if (!playUI || i === list.length) { el.className = "chal hidden"; return; }
    var tile = $("tasks").children[i], ok = done.indexOf("wyzwanie") >= 0;
    $("chalT").innerHTML = ok ? "Zaliczone! ★" : challenge();
    el.className = "chal" + (ok ? " done" : "");
    el.style.left = (90 + tile.offsetLeft + tile.offsetWidth + 20 - 400) + "px";
  }

  var PRAISE = ["Brawo!", "Super!", "Ekstra!", "Tak trzymaj!", "Mistrz!", "Miau, świetnie!"];
  function toggleTask(i) {
    var done = todayTasks(), t = tasksToday()[i];
    if (!t) return;
    var p = done.indexOf(t.id);
    if (p >= 0) { done.splice(p, 1); actUntil = 0; $("cat").className = catClass(Date.now()); }
    else {
      done.push(t.id); Snd.ding();
      setTimeout(function () { Snd.meow(); }, 250);
      catDo(t.id);
      var c = doneCount(), nx = nextTask();
      if (t.id === "wyzwanie") say("Wyzwanie zaliczone! ★", 5000);
      else if (c.n === c.of) say("Wiadro pełne! Teraz: Wychodzimy!", 8000);
      else say(PRAISE[Math.floor(Math.random() * PRAISE.length)] + (nx ? "<br>Teraz: " + nx.t.toLowerCase() : ""), 5000);
    }
    saveTasks();
    renderTasks();
  }

  function showPlayUI(on) {
    playUI = on;
    $("tasks").className = "tasks" + (on ? "" : " hidden");
    $("go").style.display = on ? "" : "none";
    renderFoot();
  }

  function renderFoot() {
    var play = mode === "burning" || mode === "waiting";
    $("foot").innerHTML = (play ? "<i>◄ ►</i> wybierz <i>OK</i> zaznacz" : "") +
      "<i>C</i> ustawienia <i>D</i> " + (demo ? "koniec próby" : "pokaz próbny") + " <i>↩</i> wyjście";
  }

  // ------------------------------------------------------------ cat, bubble, bucket
  var sayText = "", sayUntil = 0, bubbleShown = "", cheerUntil = 0, bucketTarget = 0, bucketLevel = -1;
  var act = "", actUntil = 0;
  // what the cat acts out after a tick (index.html: .a-* groups); dressing up just sparkles
  var ACTS = { siku: "siku", sniadanie: "sniadanie", zeby: "zeby", wyzwanie: "wyzwanie puff",
               ubranie: "puff", buty: "puff", kurtka: "puff", zabawka: "puff" };

  function say(t, ms) { sayText = t; sayUntil = Date.now() + ms; renderBubble(Date.now()); }

  // The cat does the task with the kid and wears what the kid has put on.
  function catDo(id) {
    var el = $("cat"), now = Date.now();
    act = ACTS[id] || ""; actUntil = now + 3000;
    cheerUntil = act.indexOf("wyzwanie") >= 0 ? 0 : now + 700;
    el.className = "cat"; void el.offsetWidth; el.className = catClass(now);
  }

  function catClass(now) {
    var cls = "cat", i;
    if (mode === "free" || mode === "idle") return "cat sleep";       // in pyjamas
    var done = todayTasks(), w = weather();
    for (i = 0; i < done.length; i++) cls += " d-" + done[i];
    if (w && w.wear === "cold" && done.indexOf("kurtka") >= 0) cls += " d-scarf";
    if (mode === "boom") cls += " sooty";
    else if (mode === "defused") { if (demo || now - finishedAt < 20000) cls += " happy"; }
    else if (hurry(now)) cls += " worry";
    if (now < actUntil && act) {
      var a = act.split(" ");
      for (i = 0; i < a.length; i++) cls += " act-" + a[i];
    }
    if (now < cheerUntil) cls = cls.replace(/ (happy|worry|sooty)/, "") + " cheer";
    return cls;
  }

  function hurry(now) { return mode === "burning" && window_(now).e - now < (demo ? 15000 : 5 * 60000); }

  function bubbleMsgs(now) {
    var pr = prop(), n = who(), nx = nextTask(), w = weather();
    if (mode === "free") return ["Zzz… Dziś wolne!"];
    if (mode === "idle") return ["Zzz…"];
    if (mode === "boom") return ["Kaszl, kaszl…<br>Jutro na pewno zdążymy!"];
    if (mode === "defused") {
      var rec = demo ? demo.rec : hist[dayKey(new Date(now))];
      return [rec && rec.full ? "Pełne wiadro!<br>Super robota" + n + "!" : "Ugasiliśmy " + pr.acc + "!<br>Brawo" + n + "!"];
    }
    if (hurry(now))
      return ["Szybko" + n + "!<br>" + (nx ? "Jeszcze: " + nx.t.toLowerCase() : "Wychodzimy!")];
    var msgs = [pr.fill ? "Dziś wulkan!<br>Lawa rośnie… Ugasimy go?" : "Dziś na końcu lontu: " + pr.name + "!<br>Ugasimy " + pr.acc + "?"];
    if (w) msgs.push(w.tip);
    if (nx && mode === "burning") msgs.push("Teraz: " + nx.t.toLowerCase() + "!");
    return msgs;
  }

  function renderBubble(now) {
    var msgs = bubbleMsgs(now);
    var t = now < sayUntil ? sayText : msgs[Math.floor(now / 7000) % msgs.length];
    if (t === bubbleShown) return;
    bubbleShown = t;
    var b = $("bubble");
    $("bubbleT").innerHTML = t;
    b.className = "bubble"; void b.offsetWidth; b.className = "bubble pop";
  }

  function renderCat(now) {
    var cls = catClass(now), play = mode === "burning" || mode === "waiting", c = doneCount();
    if ($("cat").className !== cls) $("cat").className = cls;
    bucketTarget = play ? c.n / c.of : 0;
    var bc = "bucket" + (play && c.n === c.of ? " full" : "");
    if ($("bucket").className !== bc) $("bucket").className = bc;
    renderBubble(now);
  }

  // Water in the bucket: eases toward the share of tasks done; drains while the cat sprays.
  function drawBucket(now) {
    var target = bucketTarget;
    if (mode === "defused") target = anim.defuseAt ? (anim.bucketFrom || 0) * clamp(1 - (now - anim.defuseAt) / 1500, 0, 1) : 0;
    var lvl = bucketLevel < 0 ? target : bucketLevel + (target - bucketLevel) * 0.15;
    if (Math.abs(lvl - bucketLevel) < 0.002) return;
    bucketLevel = lvl;
    var yw = 124 - lvl * 96, k = 10 / 104;
    var pts = lvl < 0.01 ? "0,0" : [10 + (yw - 22) * k, yw, 100 - (yw - 22) * k, yw, 100 - 102 * k, 124, 10 + 102 * k, 124].join(",");
    $("water").setAttribute("points", pts);
  }

  // ------------------------------------------------------------ weather
  var wxSum = null, wxSumAt = 0, wxBusy = false, wxTried = -1e12;
  function weather() { return wxSum; }

  function renderWeather(now) {
    if (cfg.city && !wxBusy && (wxCache.city !== cfg.city || now - wxCache.at > 30 * 60000) && now - wxTried > 5 * 60000) {
      wxTried = now; wxBusy = true;
      Weather.fetch(cfg.city, function (h) {
        wxBusy = false;
        if (h) { wxCache = { city: cfg.city, at: Date.now(), h: h }; save("tnt.wx", wxCache); }
        wxSumAt = 0; renderWeather(Date.now());
      });
    }
    if (now - wxSumAt < 60000) return;
    wxSumAt = now;
    var fresh = cfg.city && wxCache.h && wxCache.city === cfg.city && now - wxCache.at < 12 * 3600000;
    var w = fresh ? Weather.summary(wxCache.h, new Date(now), hm(cfg.leave)) : null;
    var changed = JSON.stringify(w) !== JSON.stringify(wxSum);
    wxSum = w;
    if (!w) $("wx").className = "wx hidden";
    else {
      $("wx").className = "wx";
      $("wxIco").innerHTML = Weather.icon(w.kind);
      $("wxT").innerHTML = w.temp + "°";
      $("wxD").innerHTML = "odczuwalnie " + w.feel + "°<br>" + w.desc;
    }
    if (changed) renderTasks();
  }

  // ------------------------------------------------------------ actions
  function leave() {
    var now = Date.now();
    var early = Math.max(0, Math.floor((window_(now).e - now) / 60000));
    var c = doneCount();
    var rec = { r: "ok", early: early, frac: Math.round(fuseFrac(now) * 1000) / 1000, full: c.n === c.of };
    if (demo) { demo.result = "defused"; demo.rec = rec; demo.doneAt = now; }
    else { hist[dayKey(new Date(now))] = rec; save("tnt.hist", hist); }
    anim.defuseAt = now;
    anim.bucketFrom = c.n / c.of;
    setTimeout(function () { Snd.splash(); }, 450);
    setTimeout(function () { confetti(); Snd.fanfare(); }, 900);
    update(now);
  }

  function startDemo(ms) {
    var now = Date.now();
    demo = { start: now, end: now + (ms || DEMO_MS), prop: ++demoProps };
    taskState = { day: dayKey(new Date(now)), done: [] };
    parts = []; mode = ""; anim = { boomAt: 0, defuseAt: 0 };
    toast("Pokaz próbny: " + prop().name + (prop().fill ? ", lawa w 1 minutę" : ", lont na 1 minutę"));
    update(now);
  }
  function endDemo() {
    demo = null; parts = []; mode = ""; anim = { boomAt: 0, defuseAt: 0 }; $("bum").className = "bum";
    taskState = load("tnt.tasks", { day: "", done: [] });
    update(Date.now());
  }

  function enterMode(m, now) {
    var prev = mode;
    mode = m;
    sayUntil = 0;           // a new phase speaks for itself
    if (m === "boom") {
      var key = dayKey(new Date(now)), live = demo || !hist[key];
      if (!demo && !hist[key]) { hist[key] = { r: "boom" }; save("tnt.hist", hist); }
      if (live) {
        anim.boomAt = now;
        parts = [];
        explode(); Snd.boom();
        var b = $("bum");
        b.innerHTML = prop().bum;
        b.className = "bum"; void b.offsetWidth; b.className = "bum on";
        setTimeout(function () { b.className = "bum fade"; }, 2600);
      }
    }
    if (m === "burning" && !prop().fill) Snd.hissOn(); else Snd.hissOff();
    if (m === "defused" || m === "boom") finishedAt = now;
    paintStatic();
    showPlayUI(m === "burning" || m === "waiting");
    renderTasks();
    renderWeek(now);
    setScreenSaver(m !== "burning" && m !== "waiting");
    renderCat(now);
    return prev;
  }

  // ------------------------------------------------------------ main loop
  var lastFrame = 0, lastSec = -1, crackleAt = 0;

  function update(now) {
    var m = computeMode(now);
    if (m !== mode) enterMode(m, now);
    renderText(now);
    var sec = Math.floor(now / 1000);
    if (sec !== lastSec) {
      lastSec = sec;
      if (sec % 30 === 0) { renderWeek(now); if (taskState.day !== dayKey(new Date(now))) renderTasks(); }
      if (mode === "burning") {
        var ms = window_(now).e - now;
        if (ms < 60000) Snd.tick(ms < 10000);
        else if (ms < 5 * 60000 && sec % 2 === 0) Snd.tick(false);
      }
      renderCat(now);
      renderWeather(now);
      if (demo && now - (demo.doneAt || demo.end) > 15000) endDemo();
      if (!demo && finishedAt && now - finishedAt > EXIT_AFTER_MS && now - lastInput > EXIT_AFTER_MS) exitApp();
    }
  }

  function frame(ts) {
    var now = Date.now(), dt = lastFrame ? Math.min(0.05, (ts - lastFrame) / 1000) : 0.016;
    lastFrame = ts;
    update(now);

    fx.clearRect(0, 0, W, H);
    var frac = fuseFrac(now), msLeft = window_(now).e - now, pr = prop(), rumble = 0;
    if ((mode === "burning" || mode === "waiting") && pr.fill) {
      // the volcano has no fuse: it fills with lava instead
      var lvl = mode === "burning" ? 1 - frac : 0;
      pr.fill(fx, lvl, now, false);
      if (mode === "burning" && now > crackleAt) { Snd.blub(); crackleAt = now + rnd(300, 1400) * (1 - 0.7 * lvl); }
      if (mode === "burning" && lvl > 0.85) rumble = 4 * (lvl - 0.85) / 0.15;
    } else if (mode === "burning" || mode === "waiting") {
      var lit = mode === "burning", urg = clamp(1 - msLeft / (5 * 60000), 0, 1);
      var p = drawFuse(fx, frac, lit, now);
      if (lit) {
        emitSparks(p.x, p.y, dt, urg);
        Snd.hissLevel(urg);
        if (now > crackleAt) { Snd.crackle(); crackleAt = now + rnd(150, 900) * (1 - 0.7 * urg); }
      }
    } else if (mode === "defused") {
      // the fuse stays as long as it was when doused
      var since = now - anim.defuseAt, rec = demo ? demo.rec : hist[dayKey(new Date(now))];
      var rf = rec && rec.frac != null ? rec.frac : 1;
      // the cat aims at the flame, or at the lava surface (cooled once the water lands)
      var q = pr.fill ? pr.fill(fx, 1 - rf, now, !anim.defuseAt || since > 900) : drawFuse(fx, rf, since < 550, now);
      if (pr.fill) q = { x: q.x, y: Math.max(q.y, 610) };
      if (anim.defuseAt && since < 1500) for (var j = 0; j < 3; j++) jet(q.x, q.y);
      if (since < 550 && !pr.fill) emitSparks(q.x, q.y, dt, 0.3);
      else if (Math.random() < dt * 1.5)
        spawn({ k: "smoke", x: q.x, y: q.y - 6, vx: rnd(-8, 8), vy: -40, r: 6, gr: 14, life: 2.2, age: 0, c: "200,200,210", a: 0.3 });
    } else if (mode === "boom" && now - anim.boomAt > 4000 && Math.random() < dt * 0.8) {
      spawn({ k: "smoke", x: TNT.cx + rnd(-200, 200), y: 990, vx: rnd(-10, 10), vy: rnd(-40, -20), r: rnd(20, 40), gr: 20, life: 4, age: 0, c: "60,56,66", a: 0.35 });
    }
    if (prop().smokes && mode !== "boom" && Math.random() < dt * 2)
      spawn({ k: "smoke", x: TNT.cx + rnd(-30, 30), y: 590, vx: rnd(-10, 10), vy: rnd(-60, -30), r: rnd(16, 26), gr: 22, life: rnd(2.5, 4), age: 0, c: "120,110,110", a: 0.4 });
    updateParts(dt);
    drawParts(fx);
    drawBucket(now);

    // flash + shake right after the explosion
    var st = $("stage").style, sinceBoom = now - anim.boomAt;
    if (anim.boomAt && sinceBoom < 1600) {
      if (sinceBoom < 350) { fx.globalAlpha = 1 - sinceBoom / 350; fx.fillStyle = "#fff8e0"; fx.fillRect(0, 0, W, H); fx.globalAlpha = 1; }
      var amp = 40 * (1 - sinceBoom / 1600);
      st.webkitTransform = st.transform = "translate(" + rnd(-amp, amp).toFixed(1) + "px," + rnd(-amp, amp).toFixed(1) + "px)";
    } else if (rumble) {
      st.webkitTransform = st.transform = "translate(" + rnd(-rumble, rumble).toFixed(1) + "px," + rnd(-rumble, rumble).toFixed(1) + "px)";
    } else if (st.transform) {
      st.webkitTransform = st.transform = "";
    }
    raf(frame);
  }

  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
            function (cb) { return setTimeout(function () { cb(Date.now()); }, 33); };

  // ------------------------------------------------------------ settings
  var S_ROWS = [
    { k: "name", t: "Imię (jak się zwracamy)" },
    { k: "leave", t: "Wyjście o" },
    { k: "start", t: "Lont zapala się o" },
    { k: "days", t: "Dni" },
    { k: "sound", t: "Dźwięk" },
    { k: "autostart", t: "Autostart apki" },
    { k: "city", t: "Pogoda dla" },
    { k: "reset", t: "Restart dnia (wynik i zadania)" }
  ];
  var sSel = 0, sOpen = false, alarmNote = "";

  function sValue(k) {
    if (k === "name") return esc(cfg.name) || "(wpisz)";
    if (k === "leave" || k === "start") return fmtHM(hm(cfg[k]));
    if (k === "days") return daySet().t;
    if (k === "sound") return cfg.sound ? "włączony" : "wyłączony";
    if (k === "autostart") return (cfg.autostart ? "o " + fmtHM(hm(cfg.start)) : "wyłączony") + (alarmNote ? '<span class="note">' + alarmNote + "</span>" : "");
    if (k === "city") return cfg.city || "wyłączona";
    if (k === "reset") return hist[dayKey(new Date())] || todayTasks().length ? "wyczyść" : "nic do czyszczenia";
    return "";
  }
  function renderSettings() {
    var html = "";
    for (var i = 0; i < S_ROWS.length; i++)
      html += '<div class="s-row' + (i === sSel ? " sel" : "") + '"><div class="k">' + S_ROWS[i].t + '</div><div class="v">' + sValue(S_ROWS[i].k) + "</div></div>";
    $("sRows").innerHTML = html;
  }
  function openSettings(on) {
    sOpen = on;
    $("settings").className = "settings" + (on ? " on" : "");
    if (on) { alarmNote = ""; renderSettings(); }
    else {
      save("tnt.cfg", cfg); Snd.setEnabled(cfg.sound); scheduleAutostart();
      wxSumAt = 0; wxTried = -1e12; lastText = ""; mode = ""; update(Date.now());
    }
  }
  function changeSetting(dir) {
    var k = S_ROWS[sSel].k;
    if (k === "leave" || k === "start") {
      var v = (hm(cfg[k]) + dir * 5 + 1440) % 1440;
      cfg[k] = pad(Math.floor(v / 60)) + ":" + pad(v % 60);
      if (hm(cfg.start) >= hm(cfg.leave)) {   // keep the fuse at least 5 min long
        if (k === "leave") cfg.start = fmt5(hm(cfg.leave) - 5);
        else cfg.leave = fmt5(hm(cfg.start) + 5);
      }
    } else if (k === "days") {
      var i = 0; while (DAY_SETS[i].k !== cfg.days && i < DAY_SETS.length - 1) i++;
      cfg.days = DAY_SETS[(i + dir + DAY_SETS.length) % DAY_SETS.length].k;
    } else if (k === "sound") cfg.sound = !cfg.sound;
    else if (k === "autostart") cfg.autostart = !cfg.autostart;
    else if (k === "city") {
      var names = Weather.CITIES.map(function (c) { return c[0]; }).concat([""]), j = names.indexOf(cfg.city);
      cfg.city = names[(j + dir + names.length) % names.length];
    }
    else if (k === "reset") {
      delete hist[dayKey(new Date())]; save("tnt.hist", hist);
      taskState = { day: dayKey(new Date()), done: [] }; saveTasks();
      anim = { boomAt: 0, defuseAt: 0 }; parts = []; actUntil = 0;
      toast("Dzień od nowa – wszystkie zadania odznaczone");
    }
    else if (k === "name") { editName(); return; }
    renderSettings();
  }
  function fmt5(m) { m = (m + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }

  function editName() {
    var inp = $("nameInput");
    inp.value = cfg.name;
    inp.style.left = "-2000px";
    inp.focus();
    toast("Wpisz imię i zatwierdź");
  }
  $("nameInput").addEventListener("keydown", function (e) {
    var k = e.keyCode;
    if (k === 13 || k === 65376 || k === 65385 || k === 10009 || k === 27) {
      if (k !== 10009 && k !== 27 && this.value.replace(/\s/g, "")) cfg.name = this.value.replace(/^\s+|\s+$/g, "");
      e.stopPropagation(); e.preventDefault();
      this.blur(); renderSettings();
    }
  });

  // ------------------------------------------------------------ TV glue
  function scheduleAutostart() {
    if (!window.tizen || !tizen.alarm) { alarmNote = "(tylko na TV)"; return; }
    try {
      var appId = tizen.application.getCurrentApplication().appInfo.id;
      tizen.alarm.removeAll();
      if (!cfg.autostart) { alarmNote = ""; return; }
      var now = new Date(), t = at(now, cfg.start);
      if (t <= now.getTime()) t += 86400000;
      var codes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], days = daySet().d.map(function (d) { return codes[d]; });
      tizen.alarm.add(new tizen.AlarmAbsolute(new Date(t), days), appId);
      alarmNote = "";
    } catch (e) { alarmNote = "(błąd: " + e.name + ")"; }
  }

  function setScreenSaver(allow) {
    try {
      var st = webapis.appcommon.AppCommonScreenSaverState;
      webapis.appcommon.setScreenSaver(allow ? st.SCREEN_SAVER_ON : st.SCREEN_SAVER_OFF);
    } catch (e) {}
  }

  function exitApp() {
    try { tizen.application.getCurrentApplication().exit(); } catch (e) {}
  }

  var toastTimer = 0;
  function toast(msg) {
    var t = $("toast");
    t.innerHTML = msg; t.className = "toast on";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2500);
  }

  // ------------------------------------------------------------ keys
  var K = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, OK: 13, BACK: 10009, ESC: 27, BKSP: 8,
            RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406 };
  var DESK = { 82: K.RED, 71: K.GREEN, 89: K.YELLOW, 66: K.BLUE, 27: K.BACK, 8: K.BACK };

  document.addEventListener("keydown", function (e) {
    if (document.activeElement === $("nameInput")) return;
    var k = DESK[e.keyCode] || e.keyCode;
    lastInput = Date.now();
    Snd.setEnabled(cfg.sound);
    if (sOpen) {
      if (k === K.UP) sSel = (sSel + S_ROWS.length - 1) % S_ROWS.length;
      else if (k === K.DOWN) sSel = (sSel + 1) % S_ROWS.length;
      else if (k === K.LEFT) changeSetting(-1);
      else if (k === K.RIGHT || k === K.OK) changeSetting(1);
      else if (k === K.BACK || k === K.YELLOW) openSettings(false);
      if (sOpen) renderSettings();
      e.preventDefault();
      return;
    }
    var play = mode === "burning" || mode === "waiting";
    var nt = tasksToday().length;
    if (k === K.LEFT && play) { focus = Math.max(0, Math.min(focus, nt) - 1); renderTasks(); }
    else if (k === K.RIGHT && play) { focus = Math.min(nt, focus + 1); renderTasks(); }
    else if (k === K.UP && play) { focus = 0; renderTasks(); }
    else if (k === K.DOWN && play) { focus = nt; renderTasks(); }
    else if (k === K.OK && play) { if (focus < nt) toggleTask(focus); else leave(); }
    else if (k >= 49 && k < 49 + nt && play) toggleTask(k - 49);
    else if (k === K.YELLOW) openSettings(true);
    else if (k === K.BLUE) { if (demo) endDemo(); else startDemo(); }
    else if (k === K.BACK) { if (demo) endDemo(); else exitApp(); }
    else return;
    e.preventDefault();
  });

  function registerKeys() {
    var names = ["ColorF0Red", "ColorF1Green", "ColorF2Yellow", "ColorF3Blue", "1", "2", "3", "4", "5", "6", "7", "8"];
    for (var i = 0; i < names.length; i++) { try { tizen.tvinputdevice.registerKey(names[i]); } catch (e) {} }
  }

  // ------------------------------------------------------------ boot
  registerKeys();
  Snd.setEnabled(cfg.sound);
  scheduleAutostart();
  update(Date.now());
  raf(frame);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { mode = ""; update(Date.now()); } });

  window.TNT = { cfg: cfg, hist: hist, demo: startDemo, state: function () { return mode; },
                 fuse: fuse, now: Date.now };
})();
