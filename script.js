// ===== Dolcerione · interazioni =====
(function () {
  "use strict";

  // --- Orari di apertura (0 = domenica). Tieni allineati con la tabella in index.html ---
  const HOURS = {
    0: [[7, 0], [14, 0]],
    1: null,
    2: [[6, 30], [20, 0]],
    3: [[6, 30], [20, 0]],
    4: [[6, 30], [20, 0]],
    5: [[6, 30], [20, 0]],
    6: [[6, 30], [21, 0]],
  };

  // Anno nel footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- Header con ombra allo scroll ---
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Menu mobile ---
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    nav.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // --- Link attivo nella navigazione ---
  const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navObs.observe(s));
  }

  // --- Comparsa progressiva + contatori ---
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("it-IT");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => obs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  }

  // --- Filtro prodotti ---
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".card");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });
      cards.forEach((c) => c.classList.toggle("hidden", cat !== "tutti" && c.dataset.cat !== cat));
    });
  });

  // --- Aperto / chiuso adesso ---
  const now = new Date();
  const day = now.getDay();
  const todayRow = document.querySelector(`.hours tr[data-day="${day}"]`);
  if (todayRow) todayRow.classList.add("today");

  const status = document.getElementById("open-status");
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = HOURS[day];
  const fmt = ([h, m]) => `${h}:${String(m).padStart(2, "0")}`;
  if (today && mins >= today[0][0] * 60 + today[0][1] && mins < today[1][0] * 60 + today[1][1]) {
    status.textContent = `Aperto ora · chiudiamo alle ${fmt(today[1])}`;
    status.className = "open-now open";
  } else {
    // trova la prossima apertura
    let msg = "Chiuso ora";
    for (let i = 0; i < 7; i++) {
      const d = (day + i) % 7;
      const h = HOURS[d];
      if (!h) continue;
      if (i === 0 && mins >= h[0][0] * 60 + h[0][1]) continue;
      const names = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
      const when = i === 0 ? "oggi" : i === 1 ? "domani" : names[d];
      msg += ` · riapriamo ${when} alle ${fmt(h[0])}`;
      break;
    }
    status.textContent = msg;
    status.className = "open-now closed";
  }

  // --- Torta interattiva nella prima pagina ---
  const stage = document.getElementById("cake-stage");
  if (stage) {
    const svg = document.getElementById("cake");
    const body = document.getElementById("cake-body");
    const sprinkles = document.getElementById("sprinkles");
    const candle = document.getElementById("candle");
    const wish = document.getElementById("wish");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SPRINKLE_COLORS = ["#f39c12", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#ffffff", "#f8c6d0"];
    const CONFETTI_COLORS = ["#7a2e3a", "#f3c6cf", "#d9a441", "#e74c3c", "#8db05f", "#f2cf4a"];
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Inclinazione 3D che segue il puntatore
    if (!reduceMotion) {
      stage.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        svg.style.setProperty("--ry", (x * 18).toFixed(2) + "deg");
        svg.style.setProperty("--rx", (-y * 14).toFixed(2) + "deg");
      });
      stage.addEventListener("pointerleave", () => {
        svg.style.setProperty("--ry", "0deg");
        svg.style.setProperty("--rx", "0deg");
      });
    }

    // Scelta del gusto
    const flavors = document.querySelectorAll(".flavor");
    flavors.forEach((btn) => {
      btn.addEventListener("click", () => {
        stage.dataset.flavor = btn.dataset.flavor;
        flavors.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-checked", String(on));
        });
        squish();
      });
    });

    function squish() {
      body.classList.remove("squish");
      void body.getBBox(); // riavvia l'animazione
      body.classList.add("squish");
    }

    // Zuccherini dove si tocca la torta
    const NS = "http://www.w3.org/2000/svg";
    body.addEventListener("click", (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      for (let i = 0; i < 9; i++) {
        const x = Math.min(305, Math.max(95, p.x + rand(-35, 35)));
        const y = Math.min(295, Math.max(145, p.y + rand(-22, 22)));
        if (y < 215 && (x < 125 || x > 275)) continue; // fuori dallo strato alto
        const s = document.createElementNS(NS, "rect");
        s.setAttribute("width", "9"); s.setAttribute("height", "3"); s.setAttribute("rx", "1.5");
        s.setAttribute("fill", pick(SPRINKLE_COLORS));
        s.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rand(0, 180).toFixed(0)})`);
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "sprinkle");
        g.style.animationDelay = (i * 25) + "ms";
        g.appendChild(s);
        sprinkles.appendChild(g);
      }
      while (sprinkles.childNodes.length > 160) sprinkles.removeChild(sprinkles.firstChild);
      squish();
    });

    // Coriandoli
    function confetti(count) {
      if (reduceMotion) return;
      const r = stage.getBoundingClientRect();
      const ox = r.width / 2, oy = r.height * 0.16;
      for (let i = 0; i < count; i++) {
        const c = document.createElement("span");
        c.className = "confetti";
        c.style.left = ox + "px"; c.style.top = oy + "px";
        c.style.background = pick(CONFETTI_COLORS);
        const angle = rand(-Math.PI, 0);
        const dist = rand(80, 220);
        c.style.setProperty("--dx", (Math.cos(angle) * dist).toFixed(0) + "px");
        c.style.setProperty("--dy", (Math.sin(angle) * dist * 0.6 + rand(120, 260)).toFixed(0) + "px");
        c.style.setProperty("--rot", rand(-540, 540).toFixed(0) + "deg");
        stage.appendChild(c);
        c.addEventListener("animationend", () => c.remove());
      }
    }

    // Candelina: soffia per spegnerla, tocca di nuovo per riaccenderla
    let wishTimer;
    const toggleCandle = () => {
      const out = candle.classList.toggle("out");
      candle.setAttribute("aria-pressed", String(out));
      candle.setAttribute("aria-label", out ? "Riaccendi la candelina" : "Spegni la candelina");
      clearTimeout(wishTimer);
      if (out) {
        wish.textContent = pick(["Desiderio espresso! 🎉", "Tanti auguri! 🎂", "Che si avveri! ✨"]);
        wish.classList.add("show");
        confetti(40);
        wishTimer = setTimeout(() => wish.classList.remove("show"), 2600);
      } else {
        wish.classList.remove("show");
      }
    };
    candle.addEventListener("click", (e) => { e.stopPropagation(); toggleCandle(); });
    candle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCandle(); }
    });
  }

  // --- Modulo contatti: apre il client email con il messaggio precompilato ---
  const form = document.getElementById("contact-form");
  const formMsg = document.getElementById("form-msg");
  const EMAIL = "info@dolcerione.it"; // TODO: sostituire con l'email reale

  const dateInput = document.getElementById("data");
  dateInput.min = new Date(Date.now() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const required = [form.nome, form.messaggio];
    let ok = true;
    required.forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      formMsg.textContent = "Per favore compila nome e messaggio.";
      formMsg.className = "form-msg error";
      required.find((f) => !f.value.trim()).focus();
      return;
    }
    const lines = [`Nome: ${form.nome.value.trim()}`];
    if (form.telefono.value.trim()) lines.push(`Telefono: ${form.telefono.value.trim()}`);
    if (form.data.value) lines.push(`Data ritiro: ${form.data.value.split("-").reverse().join("/")}`);
    lines.push("", form.messaggio.value.trim());
    const body = lines.join("\n");
    const subject = `${form.tipo.value} – richiesta dal sito`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    formMsg.textContent = "Grazie! Si sta aprendo la tua app di posta per inviare la richiesta.";
    formMsg.className = "form-msg ok";
    form.reset();
  });
})();
