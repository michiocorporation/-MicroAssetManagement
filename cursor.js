(() => {
  'use strict';
  const mouseScreen = matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const cursor = document.createElement('div');
  cursor.className = 'mam-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="mam-cursor-halo"><span class="mam-cursor-ring"></span></div><div class="mam-cursor-pointer"><svg class="mam-cursor-tip" viewBox="0 0 24 28" fill="none"><path d="M2 2 8 24l4-10 10-4L2 2Z" fill="#bceeff" stroke="#080f1b" stroke-width="1.5" stroke-linejoin="round"/><path d="m2 2 10 12 10-4L2 2Z" fill="#37c5ee"/><path d="m2 2 10 12" stroke="#080f1b" stroke-width="1.2"/></svg><svg class="mam-cursor-arrow" viewBox="0 0 18 18"><path d="M4 14 14 4M4 4h10v10"/></svg></div>';
  document.body.append(cursor);
  const pointer = cursor.querySelector('.mam-cursor-pointer');
  const halo = cursor.querySelector('.mam-cursor-halo');
  const interactive = 'a[href],button,summary,[role="button"],[role="link"]';
  const native = 'input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),[data-native-cursor],:disabled,[aria-disabled="true"],iframe';
  let x = 0, y = 0, followX = 0, followY = 0, frame = 0, visible = false, lastTime = 0;

  function hide() {
    visible = false;
    root.classList.remove('mam-cursor-on');
    cursor.classList.remove('is-visible', 'is-interactive', 'is-pressed');
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
  }
  function placeHalo() { halo.style.transform = `translate3d(${followX - 24}px,${followY - 24}px,0)`; }
  function follow(now) {
    frame = 0;
    if (!visible) return;
    const delta = lastTime ? Math.min(now - lastTime, 64) : 16.7;
    lastTime = now;
    const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-delta / 55);
    followX += (x - followX) * amount;
    followY += (y - followY) * amount;
    placeHalo();
    if (Math.abs(x - followX) + Math.abs(y - followY) > .1) frame = requestAnimationFrame(follow);
    else lastTime = 0;
  }
  function updateTarget(target) {
    if (!mouseScreen.matches || document.querySelector('dialog[open]') || !(target instanceof Element) || target.closest(native)) {
      hide(); return false;
    }
    cursor.classList.toggle('is-interactive', !!target.closest(interactive));
    return true;
  }
  function move(event) {
    if (event.pointerType !== 'mouse') { hide(); return; }
    if (!updateTarget(event.target)) return;
    x = event.clientX; y = event.clientY;
    // The pointer follows exactly; only the decorative ring has a short lag.
    pointer.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (!visible) { followX = x; followY = y; placeHalo(); }
    visible = true;
    cursor.classList.add('is-visible');
    root.classList.add('mam-cursor-on');
    if (!frame) frame = requestAnimationFrame(follow);
  }
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', move, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); }, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') hide();
    else if (visible) cursor.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
  document.addEventListener('pointercancel', hide, { passive: true });
  document.addEventListener('dragstart', hide);
  document.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key === 'Escape') hide(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  window.addEventListener('blur', hide);
  window.addEventListener('pagehide', hide);
  window.addEventListener('resize', hide, { passive: true });
  window.addEventListener('scroll', () => { if (visible) updateTarget(document.elementFromPoint(x, y)); }, { passive: true });
  mouseScreen.addEventListener('change', hide);
  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    followX = x; followY = y; placeHalo();
  });
  // Native modal dialogs are in the browser's top layer; keep their native cursor.
  const dialogs = new MutationObserver(() => { if (document.querySelector('dialog[open]')) hide(); });
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
})();
