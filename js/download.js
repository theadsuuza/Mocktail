// Gated download cards.
//   • Each card must wait WAIT_SECONDS before it opens its link.
//   • The second card unlocks only after the first card's wait completes.
//   • Links are placeholders ('#') — put the real URLs in LINKS when ready.

const LINKS = ['https://mega.nz/folder/qlBgSbQR#d2waztbpSKLS1yrg3Mrlyw', 'https://1drv.ms/f/c/D857B57199D65E7B/IgBqXVBYqWonQozW9PTFzqmdATjUZCfUJYx6tZZZKeSAXlg'];
const WAIT_SECONDS = 15;
const RING = 2 * Math.PI * 52; // r=52 in the SVG

export function initDownload() {
  const cards = Array.from(document.querySelectorAll('.dl'));
  const status = document.getElementById('dlStatus');
  if (cards.length === 0) return;

  cards.forEach((card, index) => {
    const prog = card.querySelector('.dl__prog');
    if (prog) {
      prog.style.strokeDasharray = String(RING);
      prog.style.strokeDashoffset = String(RING);
    }
    card.addEventListener('click', () => start(card, index));
  });

  function start(card, index) {
    if (card.disabled || card.classList.contains('is-waiting') || card.classList.contains('is-done')) return;

    const prog = card.querySelector('.dl__prog');
    const icon = card.querySelector('.dl__icon');
    const cta = card.querySelector('.dl__cta');
    const startedAt = performance.now();

    card.classList.add('is-waiting');
    card.disabled = true;
    if (cta) cta.textContent = 'Please wait…';
    setStatus(`Preparing Download ${index + 1}…`);

    const frame = (now) => {
      const t = Math.min((now - startedAt) / (WAIT_SECONDS * 1000), 1);
      if (prog) prog.style.strokeDashoffset = String(RING * (1 - t));
      if (icon) icon.textContent = t < 1 ? String(Math.ceil(WAIT_SECONDS * (1 - t))) : '✓';
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      finish(card, index, prog, cta);
    };

    requestAnimationFrame(frame);
  }

  function finish(card, index, prog, cta) {
    card.classList.remove('is-waiting');
    card.classList.add('is-done');
    card.disabled = false;
    if (prog) prog.style.strokeDashoffset = '0';
    if (cta) cta.textContent = 'Open again';

    window.open(LINKS[index] || '#', '_blank', 'noopener');

    const next = cards[index + 1];
    if (next) {
      next.disabled = false;
      next.classList.remove('is-locked');
      const nextIcon = next.querySelector('.dl__icon');
      const nextCta = next.querySelector('.dl__cta');
      if (nextIcon) nextIcon.textContent = '⤓';
      if (nextCta) nextCta.textContent = 'Start';
      setStatus(`Download ${index + 1} is ready. Download ${index + 2} is now unlocked.`);
    } else {
      setStatus('All downloads unlocked.');
    }
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }
}
