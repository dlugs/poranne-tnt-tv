/*
 * Morning weather from Open-Meteo (free, no key). Plain http on purpose: the
 * TV's 2017 certificate store may not trust Let's Encrypt, which Open-Meteo uses.
 * Only the city's coordinates are sent. ES5 for Tizen 3.0.
 */
var Weather = (function () {
  "use strict";
  var CITIES = [
    ["Warszawa", 52.23, 21.01], ["Kraków", 50.06, 19.94], ["Łódź", 51.76, 19.46], ["Wrocław", 51.11, 17.03],
    ["Poznań", 52.41, 16.93], ["Gdańsk", 54.35, 18.65], ["Gdynia", 54.52, 18.53], ["Szczecin", 53.43, 14.55],
    ["Bydgoszcz", 53.12, 18.01], ["Toruń", 53.01, 18.60], ["Lublin", 51.25, 22.57], ["Białystok", 53.13, 23.16],
    ["Katowice", 50.26, 19.02], ["Częstochowa", 50.81, 19.12], ["Rzeszów", 50.04, 22.00], ["Kielce", 50.87, 20.63],
    ["Olsztyn", 53.78, 20.49], ["Opole", 50.67, 17.93], ["Zielona Góra", 51.94, 15.51], ["Gorzów Wlkp.", 52.73, 15.24]
  ];
  var RAIN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
  var SNOW = [71, 73, 75, 77, 85, 86];

  function city(name) {
    for (var i = 0; i < CITIES.length; i++) if (CITIES[i][0] === name) return CITIES[i];
    return null;
  }

  function fetch(name, cb) {
    var c = city(name);
    if (!c) { cb(null); return; }
    var url = "http://api.open-meteo.com/v1/forecast?latitude=" + c[1] + "&longitude=" + c[2] +
      "&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code" +
      "&timezone=Europe%2FWarsaw&forecast_days=2";
    var x = new XMLHttpRequest();
    x.open("GET", url, true);
    x.timeout = 15000;
    x.onload = function () {
      var d = null;
      try { d = JSON.parse(x.responseText).hourly; } catch (e) {}
      cb(d && d.time ? d : null);
    };
    x.onerror = x.ontimeout = function () { cb(null); };
    x.send();
  }

  function kind(code) {
    if (code >= 95) return "storm";
    if (SNOW.indexOf(code) >= 0) return "snow";
    if (RAIN.indexOf(code) >= 0) return "rain";
    if (code === 45 || code === 48) return "fog";
    if (code === 3) return "cloud";
    if (code === 2) return "partly";
    return "sun";
  }
  var DESC = { sun: "słonecznie", partly: "trochę chmur", cloud: "pochmurno", fog: "mgła",
               rain: "deszcz", snow: "śnieg", storm: "burza" };

  // What the morning looks like at leaving time and what to wear for the
  // whole kindergarten day (until 16:00). null when the data is not for today.
  function summary(h, date, leaveMin) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    var hour = Math.floor(leaveMin / 60);
    var key = date.getFullYear() + "-" + p(date.getMonth() + 1) + "-" + p(date.getDate()) + "T" + p(hour) + ":00";
    var i0 = h.time.indexOf(key);
    if (i0 < 0) return null;
    var rain = false, snow = false, later = "";
    for (var i = i0; i < h.time.length && i <= i0 + Math.max(0, 16 - hour); i++) {
      var k = kind(h.weather_code[i]), pp = h.precipitation_probability ? h.precipitation_probability[i] : 0;
      if (k === "snow") snow = true;
      else if (k === "rain" || k === "storm" || pp >= 60) rain = true;
      if (i > i0 && !later && (k === "rain" || k === "snow" || k === "storm") && kind(h.weather_code[i0]) !== k) later = k;
    }
    var temp = Math.round(h.temperature_2m[i0]), feel = Math.round(h.apparent_temperature[i0]);
    var now = kind(h.weather_code[i0]);
    var wear = feel <= 3 ? "cold" : feel <= 14 ? "jacket" : feel <= 22 ? "hoodie" : (now === "sun" || now === "partly") ? "cap" : "hoodie";
    var tip = snow ? "Śnieg! Śniegowce i rękawiczki." :
              rain ? "Będzie padać – kalosze!" :
              wear === "cold" ? (feel <= -3 ? "Mróz! Czapka, szalik i rękawiczki." : "Zimno – załóż czapkę!") :
              wear === "jacket" ? "Chłodno – kurtka zapięta!" :
              wear === "hoodie" ? "Ciepło – wystarczy bluza." : "Gorąco – czapka z daszkiem!";
    return { temp: temp, feel: feel, kind: now, rain: rain, snow: snow, wear: wear, tip: tip,
             desc: DESC[now] + (later ? ", potem " + DESC[later] : "") };
  }

  var CLOUD = '<path d="M26 72h48a16 16 0 0 0 0-32a22 22 0 0 0-42-6a19 19 0 0 0-6 38z" fill="#dfe6f2"/>';
  function up(svg) { return '<g transform="translate(0,-10)">' + svg + "</g>"; }
  var ICONS = {
    sun: '<g stroke="#ffd23a" stroke-width="6" stroke-linecap="round"><path d="M50 8v12M50 80v12M8 50h12M80 50h12M20 20l9 9M71 71l9 9M20 80l9-9M71 29l9-9"/></g>' +
         '<circle cx="50" cy="50" r="22" fill="#ffd23a"/>',
    partly: '<circle cx="64" cy="36" r="18" fill="#ffd23a"/><g stroke="#ffd23a" stroke-width="5" stroke-linecap="round"><path d="M64 8v8M88 36h8M81 19l6-6"/></g>' + CLOUD,
    cloud: CLOUD,
    fog: up(CLOUD) + '<path d="M18 80h64M26 92h48" stroke="#b9c3d6" stroke-width="6" stroke-linecap="round"/>',
    rain: up(CLOUD) + '<path d="M34 76l-5 12M52 76l-5 12M70 76l-5 12" stroke="#5aa9ff" stroke-width="6" stroke-linecap="round"/>',
    snow: up(CLOUD) + '<g fill="#fff"><circle cx="32" cy="80" r="5"/><circle cx="50" cy="90" r="5"/><circle cx="68" cy="80" r="5"/></g>',
    storm: up(CLOUD.replace("#dfe6f2", "#9aa3b5")) + '<path d="M52 62l-14 22h12l-6 16 18-24H50l6-14z" fill="#ffd23a"/>'
  };

  return { CITIES: CITIES, fetch: fetch, summary: summary,
           icon: function (k) { return '<svg viewBox="0 0 100 100">' + (ICONS[k] || ICONS.cloud) + "</svg>"; } };
})();
