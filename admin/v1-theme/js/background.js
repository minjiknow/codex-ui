(() => {
  'use strict';
  document.querySelectorAll('.dashboard').forEach(root => {
    const canvas = root.querySelector('.ambient-background');
    const context = canvas?.getContext('2d');
    if (!context) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, gutter = 0, frame = 0, previousTime = 0, elapsed = 0;
    let ink = '', soft = '';
    // Deterministic decorative particles, not business/sample records.
    const petals = Array.from({length: 14}, (_, i) => ({
      side: i % 2,
      offset: ((i * 0.61803398875) % 1),
      lane: 0.25 + (i % 4) * 0.16,
      size: 7 + (i % 4) * 1.5,
      speed: 20 + (i % 5) * 3,
      phase: i * 1.9
    }));
    const running = () => root.classList.contains('is-motion-running') && !document.hidden && !reducedMotion.matches;

    function draw() {
      context.clearRect(0, 0, width, height);
      const visiblePetals = width <= 768 ? petals.slice(0, 8) : petals;
      visiblePetals.forEach((petal, i) => {
        const travel = height + 80;
        const y = (petal.offset * travel + elapsed * petal.speed) % travel - 40;
        const sway = Math.sin(elapsed * 0.65 + petal.phase);
        const inset = Math.max(7, Math.min(gutter - 7, gutter * petal.lane + sway * Math.min(gutter * 0.15, 22)));
        const x = petal.side ? width - inset : inset;
        context.save();
        context.translate(x, y);
        context.rotate(petal.phase + elapsed * 0.35 + sway * 0.25);
        // A tapered petal with one curved fold, drawn behind all content.
        context.scale(0.65 + Math.abs(Math.sin(elapsed * 0.5 + petal.phase)) * 0.35, 1);
        context.beginPath();
        context.moveTo(0, -petal.size);
        context.bezierCurveTo(petal.size, -petal.size * 0.55, petal.size * 0.75, petal.size * 0.5, 0, petal.size);
        context.bezierCurveTo(-petal.size * 0.5, petal.size * 0.35, -petal.size * 0.65, -petal.size * 0.45, 0, -petal.size);
        context.fillStyle = i % 3 === 0 ? ink : soft;
        context.globalAlpha = i % 3 === 0 ? 0.3 : 0.75;
        context.fill();
        context.beginPath();
        context.moveTo(0, -petal.size * 0.7);
        context.quadraticCurveTo(petal.size * 0.2, 0, 0, petal.size * 0.75);
        context.strokeStyle = ink;
        context.globalAlpha = 0.18;
        context.lineWidth = 0.7;
        context.stroke();
        context.restore();
      });
    }
    function tick(time) {
      frame = 0;
      if (!running()) return;
      const delta = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      elapsed += delta / 1000;
      draw();
      frame = requestAnimationFrame(tick);
    }
    function synchronize() {
      cancelAnimationFrame(frame);
      frame = 0; previousTime = 0;
      if (running()) frame = requestAnimationFrame(tick);
      else draw();
    }
    function resize() {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const main = root.querySelector('main');
      gutter = main.getBoundingClientRect().left + parseFloat(getComputedStyle(main).paddingLeft);
      const styles = getComputedStyle(root);
      ink = styles.getPropertyValue('--color-accent').trim();
      soft = styles.getPropertyValue('--color-petal').trim();
      draw();
    }
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', synchronize);
    reducedMotion.addEventListener('change', synchronize);
    new MutationObserver(synchronize).observe(root, {attributes: true, attributeFilter: ['class']});
    resize(); synchronize();
  });
})();
