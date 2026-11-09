/*
 * What the fuse leads to: a different thing every day (dynamite, bomb, volcano,
 * cake, watermelon). Each prop draws itself whole and blown up on the static
 * canvas and says how its explosion looks. The fuse always starts at (1262, 566).
 * ES5 for Tizen 3.0.
 */
var Props = (function () {
  "use strict";
  var CX = 1262, FLOOR = 1000;

  function oval(c, x, y, rx, ry) {
    c.save(); c.translate(x, y); c.scale(1, ry / rx); c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.restore();
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  // repeatable "random" so a repaint draws the same sprinkles and seeds
  function seeded(seed) {
    return function (a, b) { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };
  }
  function scorch(c, alpha) {
    var r = c.createRadialGradient(CX, 990, 20, CX, 990, 420);
    r.addColorStop(0, "rgba(0,0,0," + alpha + ")"); r.addColorStop(0.6, "rgba(10,6,6," + alpha * 0.6 + ")"); r.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = r; c.fillRect(CX - 460, 600, 920, 480);
  }
  function splats(c, cols, n, seed, area) {
    var R = seeded(seed);
    for (var i = 0; i < n; i++) {
      var x = R(area[0], area[1]), y = R(area[2], area[3]), r = R(10, 34);
      c.fillStyle = cols[i % cols.length];
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      for (var j = 0; j < 5; j++) {
        var a = R(0, Math.PI * 2), d = r * R(0.9, 1.6);
        c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * R(0.15, 0.35), 0, Math.PI * 2); c.fill();
      }
    }
  }

  // ------------------------------------------------------------ dynamite
  function stick(c, x, top, w, h) {
    var ry = 20, g = c.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#5c0907"); g.addColorStop(0.3, "#e0392b"); g.addColorStop(0.45, "#f26050");
    g.addColorStop(0.75, "#b51d17"); g.addColorStop(1, "#4d0605");
    c.fillStyle = g;
    c.fillRect(x, top, w, h);
    oval(c, x + w / 2, top + h, w / 2, ry); c.fill();
    oval(c, x + w / 2, top, w / 2, ry); c.fillStyle = "#f58474"; c.fill();
    oval(c, x + w / 2, top, w / 2 - 16, ry - 6); c.fillStyle = "#c63326"; c.fill();
  }
  function band(c, x, y, w, hgt) {
    var g = c.createLinearGradient(0, y, 0, y + hgt);
    g.addColorStop(0, "#3a3640"); g.addColorStop(0.5, "#1c1a21"); g.addColorStop(1, "#0d0c10");
    c.fillStyle = g; c.fillRect(x, y, w, hgt);
  }
  function drawTNT(c) {
    var sw = 150, sh = 430, top = FLOOR - sh, xm = CX - sw / 2;
    stick(c, xm - sw + 12, top + 18, sw, sh - 18);
    stick(c, xm + sw - 12, top + 18, sw, sh - 18);
    stick(c, xm, top, sw, sh);
    var x0 = xm - sw + 12, wAll = 3 * sw - 24;
    band(c, x0, top + 70, wAll, 44);
    band(c, x0, FLOOR - 110, wAll, 44);
    var lx = CX - 190, ly = top + 168, lw = 380, lh = 140;
    c.fillStyle = "rgba(0,0,0,0.3)"; roundRect(c, lx + 6, ly + 8, lw, lh, 14); c.fill();
    c.fillStyle = "#f4ecd8"; roundRect(c, lx, ly, lw, lh, 14); c.fill();
    c.font = "bold 118px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 10; c.strokeStyle = "#1a0c0c"; c.strokeText("TNT", CX, ly + lh / 2 + 6);
    c.fillStyle = "#d3191c"; c.fillText("TNT", CX, ly + lh / 2 + 6);
  }
  function stubs(c) {
    // what is left of the sticks: three charred stubs
    for (var s = -1; s <= 1; s++) {
      var x = CX - 75 + s * 138, h = s ? 70 : 100, g = c.createLinearGradient(x, 0, x + 150, 0);
      g.addColorStop(0, "#120c0c"); g.addColorStop(0.4, "#3a1d18"); g.addColorStop(1, "#0d0909");
      c.fillStyle = g; c.fillRect(x, FLOOR - h, 150, h);
      c.fillStyle = "#1a0f0d";
      c.beginPath(); c.moveTo(x, FLOOR - h);
      for (var j = 0; j <= 6; j++) c.lineTo(x + j * 25, FLOOR - h - (j % 2 ? 26 : 4));
      c.lineTo(x + 150, FLOOR - h); c.fill();
      oval(c, x + 75, FLOOR, 75, 20); c.fillStyle = "#0d0909"; c.fill();
    }
  }
  function rubble(c, col, seed) {
    var R = seeded(seed);
    c.fillStyle = col;
    for (var i = 0; i < 9; i++) {
      c.save(); c.translate(CX - 220 + i * 55, FLOOR + (i % 3) * 6); c.rotate(R(-0.6, 0.6));
      c.fillRect(-18, -10, 36 + (i % 4) * 10, 14); c.restore();
    }
  }

  // ------------------------------------------------------------ cartoon bomb
  function drawBomb(c) {
    var cy = 790, r = 212;
    var g = c.createRadialGradient(CX - 70, cy - 80, 20, CX, cy, r);
    g.addColorStop(0, "#6b6f80"); g.addColorStop(0.35, "#2c2f3a"); g.addColorStop(1, "#07080b");
    c.fillStyle = g; c.beginPath(); c.arc(CX, cy, r, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(CX - 95, cy - 108); c.rotate(-0.6);
    oval(c, 0, 0, 48, 20); c.fillStyle = "rgba(255,255,255,0.28)"; c.fill(); c.restore();
    var m = c.createLinearGradient(CX - 50, 0, CX + 50, 0);
    m.addColorStop(0, "#4a4d58"); m.addColorStop(0.4, "#b9bcc8"); m.addColorStop(1, "#3a3c45");
    c.fillStyle = m; roundRect(c, CX - 50, 556, 100, 50, 10); c.fill();
    oval(c, CX, 558, 50, 12); c.fillStyle = "#d6d8e0"; c.fill();
    oval(c, CX, 558, 26, 6); c.fillStyle = "#2a2b30"; c.fill();
  }
  function bombRemains(c) {
    scorch(c, 0.85);
    c.fillStyle = "#14151a";
    var R = seeded(7);
    for (var i = 0; i < 7; i++) {          // curved shell shards
      var x = CX - 260 + i * 85 + R(-20, 20), y = FLOOR - R(4, 14), r = R(36, 60), a = R(3.4, 4.2);
      c.beginPath(); c.arc(x, y + r * 0.7, r, a, a + R(0.8, 1.4)); c.lineTo(x, y + r * 0.7); c.closePath(); c.fill();
    }
    c.fillStyle = "#6b6e78"; roundRect(c, CX + 120, FLOOR - 34, 70, 32, 8); c.fill();
  }

  // ------------------------------------------------------------ volcano
  function cone(c, topY, half) {
    var g = c.createLinearGradient(CX - 300, 0, CX + 300, 0);
    g.addColorStop(0, "#2a1c16"); g.addColorStop(0.45, "#7a5236"); g.addColorStop(0.7, "#5a3a26"); g.addColorStop(1, "#24170f");
    c.fillStyle = g;
    c.beginPath(); c.moveTo(CX - 300, FLOOR);
    c.quadraticCurveTo(CX - 190, 830, CX - half, topY);
    c.lineTo(CX + half, topY);
    c.quadraticCurveTo(CX + 190, 830, CX + 300, FLOOR); c.closePath(); c.fill();
    var R = seeded(11);
    c.fillStyle = "rgba(0,0,0,0.18)";
    for (var i = 0; i < 14; i++) { oval(c, CX + R(-200, 200), R(topY + 80, 970), R(14, 30), R(6, 12)); c.fill(); }
  }
  function lava(c, topY, flows, glow) {
    c.fillStyle = "#ff6a10";
    for (var i = 0; i < flows.length; i++) {
      var x = CX + flows[i][0], len = flows[i][1], w = flows[i][2];
      c.beginPath(); c.moveTo(x - w, topY);
      c.quadraticCurveTo(x - w * 1.4, topY + len * 0.6, x - w * 0.4, topY + len);
      c.arc(x, topY + len, w * 0.4, Math.PI, 0, true);
      c.quadraticCurveTo(x + w * 1.2, topY + len * 0.5, x + w, topY); c.closePath(); c.fill();
    }
    if (glow) {
      var r = c.createRadialGradient(CX, topY, 10, CX, topY, 260);
      r.addColorStop(0, "rgba(255,140,40,0.55)"); r.addColorStop(1, "rgba(255,90,0,0)");
      c.fillStyle = r; c.fillRect(CX - 300, topY - 260, 600, 520);
    }
  }
  function drawVolcano(c) {
    cone(c, 600, 100);
    oval(c, CX, 600, 100, 22); c.fillStyle = "#2a1a14"; c.fill();
    oval(c, CX, 602, 78, 15); c.fillStyle = "#140c09"; c.fill();
  }

  // No fuse: the volcano fills with lava from the bottom (lvl 0..1) and erupts
  // when it reaches the crater. Cooled = doused by the cat, the lava turns to rock.
  // Drawn every frame on the effects canvas; returns the middle of the surface.
  function volcanoFill(c, lvl, now, cooled) {
    var top = 600, y = FLOOR - lvl * (FLOOR - top);
    if (lvl <= 0.003) return { x: CX, y: FLOOR };
    c.save();
    c.beginPath(); c.moveTo(CX - 300, FLOOR);
    c.quadraticCurveTo(CX - 190, 830, CX - 100, top); c.lineTo(CX + 100, top);
    c.quadraticCurveTo(CX + 190, 830, CX + 300, FLOOR); c.closePath(); c.clip();
    var g = c.createLinearGradient(0, y, 0, FLOOR);
    if (cooled) { g.addColorStop(0, "#8a7a72"); g.addColorStop(0.3, "#4a3a34"); g.addColorStop(1, "#2a201c"); }
    else { g.addColorStop(0, "#fff1a0"); g.addColorStop(0.06, "#ffb02e"); g.addColorStop(0.4, "#ff5a10"); g.addColorStop(1, "#a81c04"); }
    c.fillStyle = g;
    var wave = cooled ? 0 : 7;
    c.beginPath(); c.moveTo(CX - 320, FLOOR + 5);
    for (var x = CX - 320; x <= CX + 320; x += 20) c.lineTo(x, y + Math.sin(x / 40 + now / 300) * wave);
    c.lineTo(CX + 320, FLOOR + 5); c.closePath(); c.fill();
    if (!cooled) {                                  // bubbles rising through the lava
      c.fillStyle = "rgba(255,236,160,0.75)";
      for (var i = 0; i < 9; i++) {
        var ph = (now / 1700 + i * 0.37) % 1, by = FLOOR - ph * (FLOOR - y);
        c.beginPath(); c.arc(CX - 200 + ((i * 131) % 400), by, 5 + (i % 3) * 3, 0, Math.PI * 2); c.fill();
      }
    }
    c.restore();
    return { x: CX, y: y };
  }
  function volcanoRemains(c) {
    cone(c, 760, 170);
    lava(c, 760, [[-150, 200, 30], [-80, 240, 34], [-10, 180, 40], [70, 230, 36], [140, 200, 28]], true);
    oval(c, CX, 760, 170, 26); c.fillStyle = "#ffb030"; c.fill();
    rubble(c, "#2a1c16", 5);
  }

  // ------------------------------------------------------------ cake
  function tier(c, x0, x1, y0, y1, R) {
    var g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, "#e889ad"); g.addColorStop(0.4, "#ffc2da"); g.addColorStop(1, "#d06d95");
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    var cx = (x0 + x1) / 2, rx = (x1 - x0) / 2;
    oval(c, cx, y1, rx, 16); c.fill();
    oval(c, cx, y0, rx, 16); c.fillStyle = "#ffe3ee"; c.fill();
    c.fillStyle = "#fffaf4";                    // cream drips along the top edge
    for (var x = x0 + 10; x < x1 - 10; x += 34) {
      var d = R(14, 42);
      c.fillRect(x - 9, y0, 18, d); c.beginPath(); c.arc(x, y0 + d, 9, 0, Math.PI * 2); c.fill();
    }
    var cols = ["#ffd23a", "#5aa9ff", "#7be07b", "#ffffff", "#b38cff"];
    for (var i = 0; i < (x1 - x0) / 9; i++) {   // sprinkles
      c.fillStyle = cols[i % cols.length];
      c.save(); c.translate(R(x0 + 12, x1 - 12), R(y0 + 50, y1 - 8)); c.rotate(R(0, 3));
      c.fillRect(-7, -2.5, 14, 5); c.restore();
    }
  }
  function drawCake(c) {
    var R = seeded(3);
    oval(c, CX, 998, 300, 26); c.fillStyle = "#e8e8f0"; c.fill();
    tier(c, CX - 240, CX + 240, 850, 990, R);
    tier(c, CX - 175, CX + 175, 735, 850, R);
    tier(c, CX - 110, CX + 110, 628, 735, R);
    for (var i = -1; i <= 1; i += 2) {
      c.fillStyle = "#d81b3c"; c.beginPath(); c.arc(CX + i * 70, 622, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(255,255,255,0.6)"; c.beginPath(); c.arc(CX + i * 70 - 5, 617, 4, 0, Math.PI * 2); c.fill();
    }
    for (var y = 566; y < 630; y += 16) {        // striped candle; the fuse is its wick
      c.fillStyle = (y / 16) % 2 < 1 ? "#ffffff" : "#e53950"; c.fillRect(CX - 13, y, 26, 16);
    }
  }
  function cakeRemains(c) {
    oval(c, CX, 998, 300, 26); c.fillStyle = "#e8e8f0"; c.fill();
    var R = seeded(9);
    c.fillStyle = "#f6d7a8";
    for (var i = 0; i < 16; i++) { c.beginPath(); c.arc(CX + R(-260, 260), 990 - R(0, 30), R(8, 22), 0, Math.PI * 2); c.fill(); }
    splats(c, ["#fffaf4", "#ffc2da", "#ffe3ee", "#e889ad"], 26, 21, [CX - 520, CX + 420, 420, 990]);
  }

  // ------------------------------------------------------------ watermelon
  function drawMelon(c) {
    var cy = 815, rx = 268, ry = 185;
    var g = c.createRadialGradient(CX - 80, cy - 70, 30, CX, cy, rx);
    g.addColorStop(0, "#7fd35a"); g.addColorStop(0.6, "#3b9a35"); g.addColorStop(1, "#1d5e1f");
    oval(c, CX, cy, rx, ry); c.fillStyle = g; c.fill();
    c.save(); oval(c, CX, cy, rx, ry); c.clip();
    c.fillStyle = "#1e5f22";
    for (var i = -5; i <= 5; i++) {
      var x = CX + i * 52;
      c.beginPath(); c.moveTo(x - 10, cy - ry);
      for (var y = cy - ry; y <= cy + ry; y += 20) c.lineTo(x + Math.sin(y / 18 + i) * 9 - 10 + (y - cy) * i * 0.05, y);
      for (y = cy + ry; y >= cy - ry; y -= 20) c.lineTo(x + Math.sin(y / 18 + i) * 9 + 10 + (y - cy) * i * 0.05, y);
      c.closePath(); c.fill();
    }
    c.restore();
    c.save(); c.translate(CX - 120, cy - 110); c.rotate(-0.5);
    oval(c, 0, 0, 60, 18); c.fillStyle = "rgba(255,255,255,0.22)"; c.fill(); c.restore();
    c.strokeStyle = "#6b4a22"; c.lineWidth = 14; c.lineCap = "round";
    c.beginPath(); c.moveTo(CX, 636); c.quadraticCurveTo(CX - 6, 600, CX, 570); c.stroke();
  }
  function halfMelon(c, x, flip) {
    c.save(); c.translate(x, FLOOR - 4); c.scale(flip, 1);
    c.beginPath(); c.arc(0, 0, 130, Math.PI, 0); c.closePath(); c.fillStyle = "#2f7d32"; c.fill();
    c.beginPath(); c.arc(0, 0, 112, Math.PI, 0); c.closePath(); c.fillStyle = "#e8384f"; c.fill();
    c.fillStyle = "#1a1a1a";
    var R = seeded(13);
    for (var i = 0; i < 12; i++) { var a = R(Math.PI * 1.1, Math.PI * 1.9), d = R(30, 90); oval(c, Math.cos(a) * d, Math.sin(a) * d, 4, 7); c.fill(); }
    c.restore();
  }
  function melonRemains(c) {
    splats(c, ["#e8384f", "#ff6b7a", "#c41d36"], 22, 33, [CX - 520, CX + 420, 440, 990]);
    halfMelon(c, CX - 160, 1);
    halfMelon(c, CX + 180, -1);
  }

  var list = [
    { id: "tnt", name: "dynamit", acc: "go", bum: "BUM!", draw: drawTNT,
      remains: function (c) { scorch(c, 0.85); stubs(c); rubble(c, "#0b0a0c", 1); },
      fire: ["#fffbe0", "#ffd23a", "#ff7a1a", "#b8260f"], debris: ["#c62b20", "#8e1612", "#1d1a1f", "#f4ecd8", "#5c0907"], smoke: "40,36,46" },
    { id: "bomba", name: "bomba", acc: "ją", bum: "BUM!", draw: drawBomb, remains: bombRemains,
      fire: ["#fffbe0", "#ffd23a", "#ff7a1a", "#b8260f"], debris: ["#1d1a1f", "#2c2f3a", "#55586a", "#8a8d99"], smoke: "40,36,46" },
    { id: "wulkan", name: "wulkan", acc: "go", bum: "BUUUM!", draw: drawVolcano, remains: volcanoRemains, smokes: true,
      fill: volcanoFill,
      fire: ["#fff2b0", "#ffb02e", "#ff5a10", "#9e1d05"], debris: ["#3b2a22", "#ff6a10", "#2a1c16", "#ff9a30", "#5a3a26"], smoke: "50,40,40" },
    { id: "tort", name: "tort", acc: "go", bum: "PLASK!", draw: drawCake, remains: cakeRemains, solid: true,
      fire: ["#ffffff", "#fff0f6", "#ffc2da", "#e889ad"], debris: ["#ffb6cf", "#ffffff", "#f6d7a8", "#d81b3c", "#8d5a3b"], smoke: "255,240,245" },
    { id: "arbuz", name: "arbuz", acc: "go", bum: "CHLUP!", draw: drawMelon, remains: melonRemains, solid: true,
      fire: ["#ffd0d6", "#ff6b7a", "#e8384f", "#b0142a"], debris: ["#2e7d32", "#e8384f", "#ff6b7a", "#1b5e20", "#111111"], smoke: "255,200,210" }
  ];

  // A different prop every day, the same one all day long. Days count from
  // 1970, so Mon-Fri never repeats and next Monday gets a different one.
  function forDay(d) {
    var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return n % list.length;
  }

  return { list: list, forDay: forDay, oval: oval, roundRect: roundRect };
})();
