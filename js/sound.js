/* Synthesised sound effects (Web Audio, no files). ES5 for Tizen 3.0. */
var Snd = (function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, enabled = true, hiss = null, noise = null;

  function init() {
    if (ctx || !AC) return ctx;
    try { ctx = new AC(); } catch (e) { return null; }
    // Old WebKit names.
    if (!ctx.createGain) ctx.createGain = ctx.createGainNode;
    var b = ctx.sampleRate * 2, buf = ctx.createBuffer(1, b, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < b; i++) d[i] = Math.random() * 2 - 1;
    noise = buf;
    return ctx;
  }
  function start(n, t) { if (n.start) n.start(t); else n.noteOn(t); }
  function stop(n, t) { try { if (n.stop) n.stop(t); else n.noteOff(t); } catch (e) {} }
  function ok() {
    if (!enabled || !init()) return null;
    if (ctx.state === "suspended" && ctx.resume) ctx.resume();   // desktop autoplay policy
    return ctx;
  }

  function noiseSrc(loop) {
    var s = ctx.createBufferSource();
    s.buffer = noise; s.loop = !!loop;
    return s;
  }
  function filter(type, f, q) {
    var x = ctx.createBiquadFilter();
    x.type = type; x.frequency.value = f; if (q) x.Q.value = q;
    return x;
  }
  function env(peak, attack, decay, t) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }
  function tone(type, freq, peak, decay, delay) {
    if (!ok()) return;
    var t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = env(peak, 0.01, decay, t);
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    start(o, t); stop(o, t + decay + 0.05);
  }

  return {
    setEnabled: function (on) { enabled = on; if (!on) this.hissOff(); },

    // Burning fuse: band-passed noise; level 0..1 grows as time runs out.
    hissOn: function () {
      if (hiss || !ok()) return;
      var s = noiseSrc(true), f = filter("bandpass", 3500, 0.8), g = ctx.createGain();
      g.gain.value = 0.02;
      s.connect(f); f.connect(g); g.connect(ctx.destination);
      start(s, 0);
      hiss = { s: s, g: g };
    },
    hissLevel: function (v) { if (hiss) hiss.g.gain.value = 0.02 + 0.08 * v; },
    hissOff: function () { if (hiss) { stop(hiss.s, 0); hiss = null; } },

    crackle: function () {
      if (!ok()) return;
      var t = ctx.currentTime, s = noiseSrc(), f = filter("highpass", 2000), g = env(0.25, 0.002, 0.03, t);
      s.connect(f); f.connect(g); g.connect(ctx.destination);
      start(s, t); stop(s, t + 0.06);
    },
    tick: function (hi) { tone("square", hi ? 1500 : 1000, 0.12, 0.05); },

    boom: function () {
      if (!ok()) return;
      this.hissOff();
      var t = ctx.currentTime;
      var s = noiseSrc(), f = filter("lowpass", 4000), g = env(1.0, 0.005, 2.8, t);
      f.frequency.setValueAtTime(4000, t);
      f.frequency.exponentialRampToValueAtTime(60, t + 2.5);
      s.connect(f); f.connect(g); g.connect(ctx.destination);
      start(s, t); stop(s, t + 3);
      var o = ctx.createOscillator(), og = env(0.9, 0.005, 1.2, t);
      o.type = "sine";
      o.frequency.setValueAtTime(90, t);
      o.frequency.exponentialRampToValueAtTime(25, t + 1.2);
      o.connect(og); og.connect(ctx.destination);
      start(o, t); stop(o, t + 1.3);
    },
    splash: function () {
      if (!ok()) return;
      this.hissOff();
      var t = ctx.currentTime, s = noiseSrc(), f = filter("highpass", 1200), g = env(0.5, 0.02, 1.4, t);
      f.frequency.setValueAtTime(5000, t);
      f.frequency.exponentialRampToValueAtTime(800, t + 1.4);
      s.connect(f); f.connect(g); g.connect(ctx.destination);
      start(s, t); stop(s, t + 1.5);
    },
    fanfare: function () {
      var notes = [523, 659, 784, 1047], i;
      for (i = 0; i < notes.length; i++) tone("triangle", notes[i], 0.3, 0.25, 0.6 + i * 0.14);
      tone("triangle", 1047, 0.3, 1.0, 0.6 + 4 * 0.14);
      tone("triangle", 1319, 0.2, 1.0, 0.6 + 4 * 0.14);
    },
    // "miau": a buzzy tone whose pitch and vowel formant rise then fall
    meow: function () {
      if (!ok()) return;
      var t = ctx.currentTime, o = ctx.createOscillator(), f = filter("bandpass", 900, 4), g = env(0.35, 0.05, 0.55, t);
      o.type = "sawtooth";
      o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(760, t + 0.18); o.frequency.linearRampToValueAtTime(480, t + 0.6);
      f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(2200, t + 0.2); f.frequency.linearRampToValueAtTime(900, t + 0.6);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      start(o, t); stop(o, t + 0.7);
    },
    // lava bubble: a short low "blub"
    blub: function () {
      if (!ok()) return;
      var t = ctx.currentTime, o = ctx.createOscillator(), g = env(0.3, 0.01, 0.16, t);
      o.type = "sine";
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.16);
      o.connect(g); g.connect(ctx.destination);
      start(o, t); stop(o, t + 0.2);
    },
    ding: function () { tone("sine", 1320, 0.3, 0.4); tone("sine", 1760, 0.2, 0.5, 0.08); },
    click: function () { tone("sine", 700, 0.08, 0.05); }
  };
})();
