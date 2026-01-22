
(() => {
  const header = document.querySelector('header');
  const navLinks = Array.from(document.querySelectorAll('nav a.navlink[href^="#"]'));
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // ---- Language toggle (single file) ----
  const LANG_KEY = 'niconnect_lang';
  const langBtns = Array.from(document.querySelectorAll('[data-lang-switch]'));
  const transEls = Array.from(document.querySelectorAll('[data-lang]'));

  function getInitialLang(){
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'pl' || saved === 'en') return saved;
    const nav = (navigator.language || '').toLowerCase();
    return nav.startsWith('pl') ? 'pl' : 'en';
  }

  function setLang(lang){
    if (lang !== 'pl' && lang !== 'en') return;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);

    transEls.forEach(el => {
      const elLang = el.getAttribute('data-lang');
      el.style.display = (elLang === lang) ? '' : 'none';
    });

    // language buttons state
    langBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-lang-switch') === lang;
      btn.classList.toggle('active', isActive);
      if (isActive) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    // title/description
    const titlePl = 'NICONNECT — Arkadiusz Nikodem';
    const titleEn = 'NICONNECT — Arkadiusz Nikodem';
    document.title = (lang === 'pl') ? titlePl : titleEn;

    const desc = document.querySelector('meta[name="description"]');
    if (desc){
      desc.setAttribute('content', lang === 'pl'
        ? 'Senior Oracle APEX / PL/SQL Developer — 11+ lat doświadczenia. Oracle APEX, PL/SQL, SQL tuning, ORDS/REST/JSON.'
        : 'Senior Oracle APEX / PL/SQL Developer — 11+ years of experience. Oracle APEX, PL/SQL, SQL tuning, ORDS/REST/JSON.');
    }
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLang(btn.getAttribute('data-lang-switch'));
    });
  });

  // ---- Fixed header offset (never cover content) ----
  function setHeaderOffset() {
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--headerH', `${h}px`);
    document.body.style.paddingTop = `${h}px`;
    sections.forEach(sec => { sec.style.scrollMarginTop = `${h + 18}px`; });
  }

  // ---- Active section highlight ----
  function setActiveById(id){
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
    });
  }

  // click -> set active immediately
  navLinks.forEach(a => a.addEventListener('click', () => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) setActiveById(href.slice(1));
  }));

  // CTA / cards: ensure active highlight follows click navigation
  Array.from(document.querySelectorAll('[data-scroll-to]')).forEach(el => {
    el.addEventListener('click', (e) => {
      const id = el.getAttribute('data-scroll-to');
      if (!id) return;
      // allow default anchor, but update active immediately
      setActiveById(id);
    });
  });

  // IntersectionObserver (robust): make sure the last section (Contact) can become active
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => (b.intersectionRatio - a.intersectionRatio))[0];
    if (visible) setActiveById(visible.target.id);
  }, { rootMargin: `-${Math.max(20, Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--headerH')) || 86) + 10)}px 0px -55% 0px`, threshold: [0.12, 0.22, 0.35, 0.5] });

  sections.forEach(sec => io.observe(sec));

  // Fallback: at the very bottom always highlight Contact
  function handleBottomHighlight(){
    const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 6);
    if (nearBottom) setActiveById('contact');
  }
  window.addEventListener('scroll', handleBottomHighlight, { passive: true });

  // ---- Mobile menu ----
  const burger = document.querySelector('[data-burger]');
  const mobile = document.querySelector('[data-mobile]');
  function closeMobile(){
    if (!mobile) return;
    mobile.classList.remove('open');
    burger?.setAttribute('aria-expanded','false');
  }
  function toggleMobile(){
    if (!mobile) return;
    const open = !mobile.classList.contains('open');
    mobile.classList.toggle('open', open);
    burger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger?.addEventListener('click', toggleMobile);
  mobile?.addEventListener('click', (e) => {
    if (e.target.matches('a')) closeMobile();
    if (e.target === mobile) closeMobile();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobile(); });

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setHeaderOffset();
    setLang(getInitialLang());
    const hash = (location.hash || '#start').replace('#','');
    if (document.getElementById(hash)) setActiveById(hash);
    else if (sections[0]) setActiveById(sections[0].id);
  });
  window.addEventListener('resize', setHeaderOffset);

  // ---- Projects tabs ----
  function initProjectTabs(){
    const tabBtns = Array.from(document.querySelectorAll('.tabbtn[data-tab]'));
    const panels = Array.from(document.querySelectorAll('.tabpanel[data-panel]'));
    if (!tabBtns.length || !panels.length) return;

    function activate(tab){
      tabBtns.forEach(btn => {
        const isActive = btn.getAttribute('data-tab') === tab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(p => {
        const show = p.getAttribute('data-panel') === tab;
        p.hidden = !show;
      });
    }

    tabBtns.forEach(btn => btn.addEventListener('click', () => activate(btn.getAttribute('data-tab'))));
    activate('self');
  }

  document.addEventListener('DOMContentLoaded', initProjectTabs);

})();
