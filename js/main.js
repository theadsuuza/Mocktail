import { initDownload } from './download.js';

const SHOT_COUNT = 21;

const SPECS = [
  ['Genre', '18+ · Uncut'],
  ['Release Date', '25 September 2026'],
  ['Language', 'Hindi'],
  ['Quality', '1080p WEB-DL'],
  ['Watermark', 'No'],
  ['Audio', 'AAC 2.0CH'],
  ['Format', 'MKV'],
  ['Size', 'Various'],
];

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initNav();
  buildShots();
  buildSpecs();
  initLightbox();
  initReveal();
  initDownload();
});

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );
}

function buildShots() {
  const grid = document.getElementById('shots');
  if (!grid) return;

  const frag = document.createDocumentFragment();

  for (let i = 1; i <= SHOT_COUNT; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shot';
    btn.dataset.index = String(i - 1);
    btn.setAttribute('aria-label', `Open screenshot ${i}`);

    const img = document.createElement('img');
    img.src = `images/${i}.jpg`;
    img.alt = `Mocktail screenshot ${i}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    const num = document.createElement('span');
    num.className = 'shot__num';
    num.textContent = String(i).padStart(2, '0');

    btn.append(img, num);
    frag.append(btn);
  }

  grid.append(frag);
}

function buildSpecs() {
  const list = document.getElementById('specs');
  if (!list) return;

  const frag = document.createDocumentFragment();

  const add = (label, valueNode) => {
    const row = document.createElement('div');
    row.className = 'spec';
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.append(valueNode);
    row.append(dt, dd);
    frag.append(row);
  };

  SPECS.forEach(([label, value]) => add(label, document.createTextNode(value)));

  const link = document.createElement('a');
  link.href = 'https://www.imdb.com/find/?q=Mocktail';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View on IMDb →';
  add('IMDb', link);

  list.append(frag);
}

function initLightbox() {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const counter = document.getElementById('lbCount');
  if (!box || !img) return;

  const shots = Array.from(document.querySelectorAll('.shot'));
  if (shots.length === 0) return;

  let current = 0;

  const show = (index) => {
    current = (index + shots.length) % shots.length;
    img.src = `images/${current + 1}.jpg`;
    img.alt = `Mocktail screenshot ${current + 1}`;
    if (counter) counter.textContent = `${current + 1} / ${shots.length}`;
  };

  const open = (index) => {
    show(index);
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  shots.forEach((shot) => shot.addEventListener('click', () => open(Number(shot.dataset.index))));

  document.getElementById('lbClose')?.addEventListener('click', close);
  document.getElementById('lbPrev')?.addEventListener('click', () => show(current - 1));
  document.getElementById('lbNext')?.addEventListener('click', () => show(current + 1));

  box.addEventListener('click', (e) => { if (e.target === box) close(); });

  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

function initReveal() {
  const targets = document.querySelectorAll('.reveal, .shot');

  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.classList.contains('shot') ? Number(el.dataset.index) * 35 : 0;
        setTimeout(() => el.classList.add('is-visible'), Math.min(delay, 450));
        io.unobserve(el);
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((t) => io.observe(t));
}
