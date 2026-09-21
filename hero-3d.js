import * as THREE from './public/vendor/three.module.min.js';

const host = document.querySelector('#hero-scene');
const hero = document.querySelector('.hero');
const art = document.querySelector('.hero-art');
const introUI = document.querySelector('#intro-ui');
const motionButton = document.querySelector('#toggle-motion');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const smooth = (a, b, value) => { const x = clamp((value - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.devicePixelRatio < 2, powerPreference: 'low-power' });
} catch {
  // The original supplied logo remains visible when WebGL is unavailable.
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x080f1b, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 18);
  const ambient = new THREE.HemisphereLight(0xd9f1ff, 0x0d2039, 2.6);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-4, 6, 9); scene.add(key);
  const rim = new THREE.DirectionalLight(0x69d4ff, 3.2); rim.position.set(7, 1, -4); scene.add(rim);
  const warm = new THREE.DirectionalLight(0xffdcaa, 1.8); warm.position.set(-3, -5, 4); scene.add(warm);

  const emblem = new THREE.Group(); scene.add(emblem);
  const ornament = new THREE.Group(); scene.add(ornament);
  const shapes = [
    { color: 0x234b7d, label: '01 — LEGAL', points: [[474,669],[714,624],[731,628],[824,781]], axis: [-1,-.35,2] },
    { color: 0x00a6df, label: '02 — FINANCE', points: [[476,634],[686,456],[662,592],[655,601]], axis: [-.85,1,-1.5] },
    { color: 0xed5826, label: '03 — REAL ESTATE', points: [[891,345],[882,560],[757,582],[747,579],[746,572]], axis: [1,.5,2] },
    { color: 0x84bb00, label: '04 — CONSTRUCTION', points: [[881,593],[872,795],[774,638],[770,628],[773,617],[783,612]], axis: [.7,-1,-1] },
    { color: 0xffb900, label: '05 — ENERGY', points: [[891,282],[724,422],[699,569],[700,574],[704,575]], axis: [.3,1,.5] }
  ];
  const pieces = [];
  shapes.forEach((spec, index) => {
    const coords = spec.points.map(([x, y]) => new THREE.Vector2((x - 685) * .011, (540 - y) * .011));
    const centroid = coords.reduce((sum, point) => sum.add(point), new THREE.Vector2()).multiplyScalar(1 / coords.length);
    const shape = new THREE.Shape(coords.map(point => point.clone().sub(centroid)));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .23, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .024, bevelThickness: .024, curveSegments: 3 });
    geometry.translate(0, 0, -.115);
    const front = new THREE.MeshPhysicalMaterial({ color: spec.color, metalness: .33, roughness: .26, clearcoat: .8, clearcoatRoughness: .2 });
    const edge = new THREE.MeshStandardMaterial({ color: spec.color, metalness: .6, roughness: .25 });
    const mesh = new THREE.Mesh(geometry, [front, edge]);
    const home = new THREE.Vector3(centroid.x, centroid.y, 0);
    mesh.position.copy(home);
    mesh.userData = { home, offset: new THREE.Vector3(...spec.axis), index };
    emblem.add(mesh); pieces.push(mesh);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 35), new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: .11 }));
    outline.scale.setScalar(1.055); mesh.add(outline);
  });

  // Fine drafting marks and orbiting points echo construction and a connected team.
  const circlePoints = [];
  for (let i = 0; i <= 160; i++) { const angle = i / 160 * Math.PI * 2; circlePoints.push(new THREE.Vector3(Math.cos(angle) * 3.55, Math.sin(angle) * 3.55, -.8)); }
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(circlePoints), new THREE.LineBasicMaterial({ color: 0x65bfe5, transparent: true, opacity: .16 }));
  orbit.rotation.x = .28; orbit.rotation.y = -.25; ornament.add(orbit);
  const ticks = [];
  for (let i = 0; i < 80; i++) { const a = i / 80 * Math.PI * 2; const r = i % 10 === 0 ? 3.72 : 3.61; ticks.push(new THREE.Vector3(Math.cos(a) * 3.55, Math.sin(a) * 3.55, -.8), new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -.8)); }
  const tickMarks = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks), new THREE.LineBasicMaterial({ color: 0x6ec7e8, transparent: true, opacity: .21 })); tickMarks.rotation.copy(orbit.rotation); ornament.add(tickMarks);
  const arcPoints = [];
  for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 1.4 - .2; arcPoints.push(new THREE.Vector3(Math.cos(a) * 4.15, Math.sin(a) * 2.9, -1.3 + Math.sin(a) * 1.1)); }
  const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints), new THREE.LineBasicMaterial({ color: 0x3877a1, transparent: true, opacity: .18 })); ornament.add(arc);
  const satellites = shapes.map((spec, i) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.037, 8, 6), new THREE.MeshBasicMaterial({color:spec.color}));
    dot.userData.phase = i / 5 * Math.PI * 2; ornament.add(dot); return dot;
  });
  // Deterministic points make the opening repeatable, with a small GPU footprint.
  let seed = 7401;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const count = window.innerWidth < 600 ? 330 : 720;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2, b = Math.acos(random() * 2 - 1), r = 3.1 + random() * 1.5;
    positions[i*3] = Math.cos(a) * Math.sin(b) * r;
    positions[i*3+1] = Math.sin(a) * Math.sin(b) * r;
    positions[i*3+2] = Math.cos(b) * r - 1.5;
  }
  const dustGeometry = new THREE.BufferGeometry(); dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0x74c3ea, size: .018, transparent: true, opacity: .43, depthWrite: false, sizeAttenuation: true })); ornament.add(dust);
  const grid = new THREE.GridHelper(42, 38, 0x1b4868, 0x1a2f47);
  grid.position.set(0, -4.2, -3); grid.material.transparent = true; grid.material.opacity = .18; scene.add(grid);
  const trace = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-16,-2.8,-3),new THREE.Vector3(16,-2.8,-3)]), new THREE.LineBasicMaterial({ color:0x264b69, transparent:true, opacity:.25 })); scene.add(trace);

  let width = 1, height = 1, aspect = 1;
  let intro = false, introStarted = 0, fallbackTimeout = null;
  let frameId = 0, lastFrame = 0, time = 0;
  let paused = reducedMotion.matches, visible = true, lost = false, introFinished = false;
  let pointer = { x: 0, y: 0 }, viewOffset = 0, previousFocus = null;
  let target = { x: 0, y: 0, scale: 1 }, current = { x: 0, y: 0, scale: 1 };
  const mobile = () => window.innerWidth <= 540;
  function resize() {
    const rect = host.getBoundingClientRect(); width = Math.max(rect.width, 1); height = Math.max(rect.height, 1); aspect = width / height;
    renderer.setSize(width, height, false); camera.aspect = aspect; camera.updateProjectionMatrix();
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov/2)) * camera.position.z;
    const artRect = art.getBoundingClientRect();
    const centerX = (artRect.left + artRect.width / 2 - rect.left) / width;
    const centerY = (artRect.top + artRect.height / 2 - rect.top) / height;
    target.x = (centerX - .5) * viewHeight * aspect;
    target.y = (.5 - centerY) * viewHeight;
    target.scale = Math.min(artRect.width / height * viewHeight / 6.2, artRect.height / height * viewHeight / 6.8);
    if (!intro) { current = {...target}; renderScene(0); }
  }
  function updateButton() { motionButton.textContent = paused ? '▷' : 'Ⅱ'; motionButton.setAttribute('aria-pressed',String(paused)); motionButton.setAttribute('aria-label', paused ? 'アニメーションを再生' : 'アニメーションを一時停止'); hero.classList.toggle('motion-paused',paused); }
  function finishIntro() {
    if (!intro) return;
    intro = false; introFinished = true; clearTimeout(fallbackTimeout);
    document.body.classList.remove('intro-active','intro-finishing'); introUI.hidden = true;
    pieces.forEach(piece => { piece.position.copy(piece.userData.home); piece.rotation.set(0,0,0); });
    resize();
    if (document.activeElement === document.querySelector('#skip-intro')) (previousFocus?.isConnected ? previousFocus : document.querySelector('.scroll-cue')).focus({preventScroll:true});
    requestTick();
  }
  function startIntro() {
    if (reducedMotion.matches || lost) return;
    previousFocus = document.activeElement;
    window.scrollTo({ top: 0, behavior: 'instant' });
    intro = true; introFinished = false; introStarted = performance.now();
    document.body.classList.add('intro-active'); introUI.hidden = false;
    document.querySelector('#skip-intro').focus({preventScroll:true});
    resize(); clearTimeout(fallbackTimeout); fallbackTimeout = setTimeout(finishIntro, 7600);
    requestTick();
  }
  function renderScene(stamp) {
    if (lost) return;
    const delta = lastFrame ? Math.min((stamp-lastFrame)/1000,.05) : .016; lastFrame = stamp;
    if (!paused && !document.hidden) time += delta;
    const elapsed = intro ? (performance.now()-introStarted)/1000 : 10;
    const transition = intro ? smooth(4.65,6.4,elapsed) : 1;
    if (intro) {
      const introScale = Math.min(1.02, aspect < .8 ? aspect*1.45 : 1.02);
      current.x = lerp(0, target.x, transition);
      current.y = lerp(mobile() ? .8 : .45, target.y, transition);
      current.scale = lerp(introScale,target.scale,transition);
      const step = clamp(Math.floor(elapsed / .79),0,4);
      document.querySelector('#intro-field').textContent = elapsed < 4.3 ? shapes[step].label : 'FIVE EXPERTISE. ONE TEAM.';
      document.querySelector('#intro-counter').textContent = `0${step+1} / 05`;
      document.querySelector('#intro-progress').style.transform = `scaleX(${Math.min(elapsed/6.4,1)})`;
      if (elapsed > 4.6) document.body.classList.add('intro-finishing');
      if (elapsed > 6.45) { finishIntro(); return; }
    }
    const rotY = paused ? -.09 : Math.sin(time*.23)*.1 - .09 + pointer.x*.12;
    const rotX = paused ? .06 : Math.cos(time*.21)*.05 + pointer.y*.1;
    emblem.rotation.y = intro ? lerp(.12,rotY,smooth(3.7,5.8,elapsed)) : rotY;
    emblem.rotation.x = rotX; emblem.rotation.z = intro ? lerp(-.035,0,smooth(3.2,5.6,elapsed)) : Math.sin(time*.18)*.014;
    emblem.position.set(current.x, current.y + (intro || paused ? 0 : Math.sin(time*.55)*.05) - viewOffset*.35, 0);
    emblem.scale.setScalar(current.scale);
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov/2)) * camera.position.z;
    const edgeX = (viewHeight * aspect / 2 + 5) / current.scale;
    const edgeY = (viewHeight / 2 + 5) / current.scale;
    pieces.forEach((piece,i) => {
      const arrival = intro ? smooth(.1+i*.24,3.4+i*.22,elapsed) : 1;
      const remaining = 1 - arrival;
      const curve = Math.sin(arrival * Math.PI);
      const {home,offset} = piece.userData;
      const separation = !intro && !paused ? (.5+.5*Math.sin(time*.42))*.035 + viewOffset*.1 : 0;
      piece.position.copy(home);
      if (intro) {
        // Each start point lies beyond an edge, including the entire prism bounds.
        piece.position.x += offset.x * edgeX * remaining + curve * (i%2 ? -.65 : .65);
        piece.position.y += offset.y * edgeY * remaining + curve * (i-2)*.3;
        piece.position.z += offset.z * remaining + curve * .45;
      } else piece.position.addScaledVector(offset,separation);
      piece.rotation.x = remaining * (i%2 ? 2.4 : -2.2);
      piece.rotation.y = remaining * (i%2 ? -2.7 : 2.5);
      piece.rotation.z = remaining * (i-2)*.7;
    });
    ornament.position.copy(emblem.position); ornament.scale.setScalar(current.scale);
    dust.rotation.y = time*.025; dust.rotation.z = -.08;
    orbit.rotation.z = time*.017; tickMarks.rotation.z = time*.017;
    satellites.forEach((dot,i) => { const a = time*.075 + dot.userData.phase; dot.position.set(Math.cos(a)*3.55,Math.sin(a)*3.55,-.8+Math.sin(a)*.6); });
    grid.material.opacity = 0;
    trace.material.opacity = 0;
    const fieldReveal = intro ? smooth(1.8,4.3,elapsed) : 1;
    orbit.material.opacity = .09 * fieldReveal;
    tickMarks.material.opacity = .11 * fieldReveal;
    arc.material.opacity = .07 * fieldReveal;
    dust.material.opacity = .29 * fieldReveal;
    host.style.opacity = String(intro ? 1 : 1-viewOffset*.45);
    renderer.render(scene,camera);
  }
  function tick(stamp) {
    frameId = 0;
    if (document.hidden || lost || (!visible && !intro)) return;
    renderScene(stamp);
    if (!frameId && (intro || !paused)) frameId = requestAnimationFrame(tick);
  }
  function requestTick() { if (!frameId && !lost && !document.hidden && (visible || intro)) { lastFrame = 0; frameId = requestAnimationFrame(tick); } }
  host.addEventListener('webglcontextlost', event => { event.preventDefault(); lost=true; finishIntro(); cancelAnimationFrame(frameId); frameId=0; hero.classList.remove('has-3d'); document.querySelector('#scene-controls').hidden=true; });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); lost=true; finishIntro(); cancelAnimationFrame(frameId); frameId=0; hero.classList.remove('has-3d'); document.querySelector('#scene-controls').hidden=true; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { lost=false; hero.classList.add('has-3d'); document.querySelector('#scene-controls').hidden=false; resize(); requestTick(); });
  hero.addEventListener('pointermove', event => { if (event.pointerType !== 'mouse') return; const rect = hero.getBoundingClientRect(); pointer.x=(event.clientX-rect.left)/rect.width-.5; pointer.y=(event.clientY-rect.top)/rect.height-.5; });
  hero.addEventListener('pointerleave', () => { pointer={x:0,y:0}; });
  const resizeObserver = new ResizeObserver(() => { resize(); requestTick(); }); resizeObserver.observe(host); resizeObserver.observe(art);
  const visibilityObserver = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; if(visible) requestTick(); else if(!intro) {cancelAnimationFrame(frameId); frameId=0;} },{threshold:0}); visibilityObserver.observe(hero);
  window.addEventListener('scroll', () => { viewOffset=clamp(-hero.getBoundingClientRect().top/hero.offsetHeight,0,1); if(paused) requestTick(); },{passive:true});
  document.addEventListener('visibilitychange', () => { if(document.hidden) {cancelAnimationFrame(frameId);frameId=0;} else {if(intro && performance.now()-introStarted>6500) finishIntro(); requestTick();} });
  reducedMotion.addEventListener('change', event => { paused=event.matches; if(event.matches) finishIntro(); updateButton(); requestTick(); });
  motionButton.addEventListener('click', () => { paused=!paused; updateButton(); requestTick(); });
  document.querySelector('#skip-intro').addEventListener('click',finishIntro);
  document.addEventListener('keydown', event => {if(event.key==='Escape' && intro) finishIntro();});
  hero.classList.add('has-3d'); document.querySelector('#scene-controls').hidden=false;
  resize(); updateButton();
  if (!reducedMotion.matches && (!window.location.hash || window.location.hash === '#top')) startIntro(); else {introFinished=true;requestTick();}
  // Expose only declarative scene status on the DOM for QA; no personal data is stored.
  renderer.domElement.dataset.scene = 'mam-five-piece-webgl';
  renderer.domElement.dataset.renderer = 'three-0.180.0';
  window.addEventListener('pagehide', () => {cancelAnimationFrame(frameId); frameId=0;clearTimeout(fallbackTimeout);});
  window.addEventListener('pageshow', requestTick);
}


