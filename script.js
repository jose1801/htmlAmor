// ===== CONFIGURA AQUÍ =====
var START = new Date(2025, 9, 5, 0, 0, 0);
var AUDIO_SRC = ""; // canción en base64; si está vacío suena una melodía de caja musical
// ==========================

var S = document.querySelectorAll(".scene"),
  cur = 0,
  bar = document.getElementById("bar"),
  nx = document.getElementById("next"),
  started = false,
  last = S.length - 1;
var mo = document.getElementById("mo"),
  M = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"];
M.forEach(function (m, k) {
  var s = document.createElement("span");
  s.style.setProperty("--k", k);
  s.textContent = m;
  mo.appendChild(s);
});

function prep(s) {
  var t = 0.3;
  Array.prototype.forEach.call(s.children, function (c) {
    if (c.classList.contains("rv")) {
      if (!c.dataset.done) {
        c.dataset.done = 1;
        c.innerHTML = c.textContent
          .split(" ")
          .map(function (w) {
            return '<span class="w">' + w + "</span>";
          })
          .join(" ");
      }
      c.querySelectorAll(".w").forEach(function (w) {
        w.style.setProperty("--d", t + "s");
        t += 0.11;
      });
    } else {
      c.style.setProperty("--d", t + "s");
      t += c.id === "mo" ? 0.4 : 0.55;
    }
  });
}
function go(n) {
  if (n > last) n = 0;
  S[cur].classList.remove("on");
  cur = n;
  prep(S[cur]);
  void S[cur].offsetWidth;
  S[cur].classList.add("on");
  S[cur].scrollTop = 0;
  bar.style.width = (cur / last) * 100 + "%";
  nx.classList.toggle("hide", cur === 0);
  nx.textContent = cur === last ? "Volver a verlo" : "Continuar";
  sea = !!S[cur].dataset.sea;
  if (cur === last) show();
}
document.body.addEventListener("click", function (e) {
  if (cur === 0 && !started) {
    started = true;
    music();
    document.getElementById("snd").classList.remove("hide");
    go(1);
  }
});
nx.addEventListener("click", function (e) {
  e.stopPropagation();
  go(cur + 1);
});
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight" || e.key === "Enter") go(cur === 0 && !started ? 0 : cur + 1);
});
prep(S[0]);

function tick() {
  var t = Math.floor(Math.max(0, Date.now() - START) / 1000);
  var v = {
    d: Math.floor(t / 86400),
    h: Math.floor((t % 86400) / 3600),
    m: Math.floor((t % 3600) / 60),
    s: t % 60,
  };
  for (var k in v) document.getElementById(k).textContent = v[k];
  document.getElementById("lbl").textContent = "Y sigo contando cada segundo contigo.";
}
tick();
setInterval(tick, 1000);

// ===== música =====
var ac,
  master,
  au,
  muted = false;
function music() {
  if (AUDIO_SRC) {
    au = new Audio(AUDIO_SRC);
    au.loop = true;
    au.play();
    return;
  }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain();
  master.gain.value = 0.33;
  var dl = ac.createDelay();
  dl.delayTime.value = 0.45;
  var fb = ac.createGain();
  fb.gain.value = 0.42;
  var wet = ac.createGain();
  wet.gain.value = 0.55;
  master.connect(ac.destination);
  master.connect(dl);
  dl.connect(fb);
  fb.connect(dl);
  dl.connect(wet);
  wet.connect(ac.destination);
  var ch = [
      [57, 60, 64, 69],
      [53, 57, 60, 65],
      [48, 52, 55, 60],
      [55, 59, 62, 67],
    ],
    st = 0,
    mel = [76, 79, 81, 84, 79];
  function nt(m, t, d, v) {
    var o = ac.createOscillator(),
      g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + d);
  }
  function bar() {
    var c = ch[st++ % 4],
      t = ac.currentTime + 0.05;
    nt(c[0] - 12, t, 3, 0.5);
    [0, 1, 2, 3, 2, 1, 2, 3].forEach(function (k, i) {
      nt(c[k] + 12, t + i * 0.4, 1.6, 0.28);
    });
    if (Math.random() < 0.8)
      nt(mel[Math.floor(Math.random() * 5)], t + (Math.random() < 0.5 ? 0 : 1.6), 2.4, 0.22);
  }
  bar();
  setInterval(bar, 3200);
}
document.getElementById("snd").addEventListener("click", function (e) {
  e.stopPropagation();
  muted = !muted;
  this.textContent = muted ? "🔇" : "🎵";
  if (au) au.muted = muted;
  if (master) master.gain.value = muted ? 0 : 0.33;
});

// ===== partículas y fuegos artificiales =====
var cv = document.getElementById("cv"),
  c = cv.getContext("2d"),
  P = [],
  sea = false,
  W,
  H,
  fin = null;
function rs() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
}
rs();
addEventListener("resize", rs);
var cols = ["#ff5a72", "#e9c98f", "#ffffff", "#ff9aa8", "#d6304a"];
function amb() {
  P.push({
    x: Math.random() * W,
    y: H + 20,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.4 - Math.random() * 0.7,
    r: 3 + Math.random() * 10,
    a: 0.5,
    l: 900,
    c: cols[(Math.random() * 5) | 0],
    g: 0,
    b: 1,
  });
}
function boom(x, y) {
  var col = cols[(Math.random() * 5) | 0];
  for (var i = 0; i < 70; i++) {
    var an = Math.random() * 6.28,
      sp = 1 + Math.random() * 4.5;
    P.push({
      x: x,
      y: y,
      vx: Math.cos(an) * sp,
      vy: Math.sin(an) * sp,
      r: 2,
      a: 1,
      l: 90,
      c: col,
      g: 0.05,
    });
  }
}
function show() {
  clearInterval(fin);
  fin = setInterval(function () {
    if (cur !== last) return clearInterval(fin);
    boom(W * (0.15 + Math.random() * 0.7), H * (0.12 + Math.random() * 0.35));
  }, 650);
}
document.addEventListener("pointerdown", function (e) {
  for (var i = 0; i < 14; i++) {
    var an = Math.random() * 6.28,
      sp = 1 + Math.random() * 3;
    P.push({
      x: e.clientX,
      y: e.clientY,
      vx: Math.cos(an) * sp,
      vy: Math.sin(an) * sp,
      r: 3,
      a: 1,
      l: 50,
      c: cols[(Math.random() * 5) | 0],
      g: 0.02,
    });
  }
});
(function loop() {
  c.clearRect(0, 0, W, H);
  if (Math.random() < 0.18) amb();
  if (sea && Math.random() < 0.05)
    P.push({
      x: Math.random() * W,
      y: H,
      vx: 0,
      vy: -1.5,
      r: 5,
      a: 0.6,
      l: 300,
      c: "#ffffff",
      g: 0,
      b: 1,
    });
  for (var i = P.length - 1; i >= 0; i--) {
    var p = P[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.l--;
    if (p.l <= 0 || p.y < -30) {
      P.splice(i, 1);
      continue;
    }
    c.globalAlpha = Math.min(p.a, p.l / 40) * (p.b ? 0.55 : 1);
    c.fillStyle = p.c;
    c.beginPath();
    c.arc(p.x, p.y, p.r, 0, 6.28);
    c.fill();
  }
  requestAnimationFrame(loop);
})();