function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function toast(title, msg) {
  const root = qs("#toast");
  const titleEl = qs("#toastTitle");
  const msgEl = qs("#toastMsg");
  const close = qs("#toastClose");
  if (!root || !titleEl || !msgEl || !close) return;

  titleEl.textContent = title;
  msgEl.textContent = msg;
  root.hidden = false;

  const timeout = window.setTimeout(() => {
    root.hidden = true;
  }, 4600);

  close.onclick = () => {
    window.clearTimeout(timeout);
    root.hidden = true;
  };
}

function setTheme(theme) {
  const safe = String(theme || "").trim();
  if (!safe) return;
  document.documentElement.setAttribute("data-theme", safe);
  try {
    window.localStorage.setItem("portfolio-theme", safe);
  } catch {
    // ignore
  }
}

function restoreTheme() {
  try {
    const stored = window.localStorage.getItem("portfolio-theme");
    if (stored) setTheme(stored);
  } catch {
    // ignore
  }
}

function bindTheme() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme]");
    if (!btn) return;
    setTheme(btn.getAttribute("data-theme"));
  });
}

function bindNav() {
  const toggle = qs("#navToggle");
  const links = qs("#navLinks");
  if (!toggle || !links) return;

  const closeMenu = () => {
    links.removeAttribute("data-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.getAttribute("data-open") === "true";
    if (open) closeMenu();
    else {
      links.setAttribute("data-open", "true");
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#navLinks") || e.target.closest("#navToggle")) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenu();
  });

  qsa('a[href^="#"]', links).forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });
}

function bindActiveSection() {
  const navLinks = qsa('.nav__link[href^="#"]');
  const ids = navLinks
    .map((a) => String(a.getAttribute("href") || "").slice(1))
    .filter(Boolean);
  const sections = ids.map((id) => qs(`#${CSS.escape(id)}`)).filter(Boolean);
  if (!sections.length || !navLinks.length) return;

  const linkById = new Map();
  navLinks.forEach((a) => linkById.set(String(a.getAttribute("href")).slice(1), a));

  const setCurrent = (id) => {
    navLinks.forEach((a) => a.removeAttribute("aria-current"));
    const link = linkById.get(id);
    if (link) link.setAttribute("aria-current", "true");
  };

  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      if (!visible) return;
      setCurrent(visible.target.id);
    },
    { root: null, threshold: [0.25, 0.4, 0.55], rootMargin: "-20% 0px -70% 0px" },
  );

  sections.forEach((s) => obs.observe(s));

  const initial = String(window.location.hash || "").slice(1);
  if (initial) setCurrent(initial);
}

async function copyToClipboard(text) {
  const value = String(text || "");
  if (!value) return false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  return ok;
}

function bindCopyEmail() {
  const btn = qs("#copyEmail");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const email = btn.getAttribute("data-email");
    try {
      const ok = await copyToClipboard(email);
      toast(ok ? "Copiado" : "Não copiado", ok ? "E-mail copiado para a área de transferência." : "Não foi possível copiar.");
    } catch {
      toast("Erro", "Não foi possível copiar o e-mail.");
    }
  });
}

function setYear() {
  const year = qs("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function main() {
  restoreTheme();
  bindTheme();
  bindNav();
  bindActiveSection();
  bindCopyEmail();
  setYear();
}

document.addEventListener("DOMContentLoaded", main);

