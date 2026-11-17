// ===== Sfizi e Delizie · interazioni =====
(function () {
  "use strict";

  // --- Orari di apertura (0 = domenica). Tieni allineati con la tabella in index.html ---
  // TODO: sostituire con gli orari reali (tieni allineata la tabella in index.html)
  const HOURS = {
    0: [[7, 0], [13, 30]],
    1: [[6, 30], [20, 0]],
    2: [[6, 30], [20, 0]],
    3: [[6, 30], [20, 0]],
    4: [[6, 30], [20, 0]],
    5: [[6, 30], [20, 0]],
    6: [[6, 30], [20, 30]],
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

  // --- Colazione interattiva nella prima pagina ---
  const stage = document.getElementById("stage");
  if (stage) {
    const svg = document.getElementById("breakfast");
    const cornetto = document.getElementById("cornetto");
    const fill = cornetto.querySelector(".c-fill");
    const crumbs = document.getElementById("crumbs");
    const cup = document.getElementById("cup");
    const bubble = document.getElementById("bubble");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const restart = (el, cls) => { el.classList.remove(cls); void el.getBBox(); el.classList.add(cls); };

    let bubbleTimer;
    const say = (text) => {
      bubble.textContent = text;
      bubble.classList.add("show");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 2200);
    };

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

    // Scelta della farcitura
    const NAMES = { pistacchio: "al pistacchio", nutella: "alla Nutella", crema: "alla crema", frutti: "ai frutti di bosco" };
    const choices = document.querySelectorAll(".choice");
    choices.forEach((btn) => {
      btn.addEventListener("click", () => {
        stage.dataset.filling = btn.dataset.filling;
        choices.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-checked", String(on));
        });
        restart(fill, "pop");
        say(`Cornetto ${NAMES[btn.dataset.filling]} 😋`);
      });
    });

    // Morso al cornetto: briciole che cadono
    const NS = "http://www.w3.org/2000/svg";
    const bite = () => {
      restart(cornetto, "wobble");
      if (!reduceMotion) {
        const colors = ["#e6a050", "#c9792f", "#f4c27f", getComputedStyle(stage).getPropertyValue("--c-fill").trim()];
        for (let i = 0; i < 12; i++) {
          const c = document.createElementNS(NS, "circle");
          c.setAttribute("cx", rand(95, 185).toFixed(1));
          c.setAttribute("cy", rand(240, 270).toFixed(1));
          c.setAttribute("r", rand(1.8, 3.6).toFixed(1));
          c.setAttribute("fill", pick(colors));
          c.setAttribute("class", "crumb");
          c.style.setProperty("--dx", rand(-30, 30).toFixed(0) + "px");
          c.style.setProperty("--rot", rand(-180, 180).toFixed(0) + "deg");
          c.style.animationDelay = (i * 20) + "ms";
          c.addEventListener("animationend", () => c.remove());
          crumbs.appendChild(c);
        }
      }
      say(pick(["Che bontà! 😋", "Gnam! 🥐", "Ancora un morso? 😄"]));
    };

    // Cappuccino: a ogni tocco un nuovo disegno nella schiuma
    const ARTS = ["heart", "leaf", "smile"];
    let art = -1;
    const pour = () => {
      art = (art + 1) % ARTS.length;
      stage.dataset.art = ARTS[art];
      restart(cup, "tap");
      say(["Un cuore per te ❤️", "Latte art! 🌿", "Buongiorno! ☀️"][art]);
    };

    const asButton = (el, fn) => {
      el.addEventListener("click", fn);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); }
      });
    };
    asButton(cornetto, bite);
    asButton(cup, pour);
  }

  // --- Modulo contatti: apre il client email con il messaggio precompilato ---
  const form = document.getElementById("contact-form");
  const formMsg = document.getElementById("form-msg");
  const EMAIL = "info@sfiziedelizie.it"; // TODO: sostituire con l'email reale

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
