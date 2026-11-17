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
