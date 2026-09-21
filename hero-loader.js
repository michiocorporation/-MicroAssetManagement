'use strict';
// Paint the page before downloading and compiling the optional 3D scene.
(() => {
  const hero = document.querySelector('.hero');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let requested = false;
  const fallback = () => document.dispatchEvent(new Event('mam:scene-unavailable'));
  function loadScene() {
    if (requested || document.hidden) return;
    if (reducedMotion.matches || navigator.connection?.saveData) { fallback(); return; }
    requested = true;
    hero.dataset.sceneState = 'loading';
    import('./hero-3d.js?v=20260922-review').then(() => {
      hero.dataset.sceneState = hero.classList.contains('has-3d') ? 'ready' : 'fallback';
    }).catch(() => {
      hero.classList.remove('has-3d', 'is-assembling');
      hero.dataset.sceneState = 'fallback';
      document.querySelector('#intro-ui').hidden = true;
      fallback();
    });
  }
  function loadIfVisible() {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) loadScene();
  }
  function afterPaint() {
    if ('requestIdleCallback' in window) requestIdleCallback(loadIfVisible, { timeout: 400 });
    else setTimeout(loadIfVisible, 0);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          loadIfVisible();
          if (requested) observer.disconnect();
        }
      });
      observer.observe(hero);
    } else window.addEventListener('scroll', loadIfVisible, { passive: true });
    document.addEventListener('visibilitychange', loadIfVisible);
    reducedMotion.addEventListener('change', loadIfVisible);
  }
  // Wait for actual text paint, rather than merely for DOM readiness.
  if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('paint')) {
    if (performance.getEntriesByName('first-contentful-paint').length) afterPaint();
    else {
      const paintObserver = new PerformanceObserver(list => {
        if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) {
          paintObserver.disconnect();
          afterPaint();
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    }
  } else requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(afterPaint, 100)));
})();
