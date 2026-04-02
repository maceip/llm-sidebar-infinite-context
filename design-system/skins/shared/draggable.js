/**
 * Makes .skin-root draggable. Persists position to localStorage.
 * Ignores drags that start on clickable elements (buttons, links).
 */
(() => {
  const root = document.querySelector('.skin-root');
  if (!root) return;

  const storageKey = 'overlay-skin-position';
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // Restore saved position
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      root.style.left = saved.x + 'px';
      root.style.top = saved.y + 'px';
    }
  } catch (_) {}

  root.addEventListener('mousedown', (e) => {
    // Don't drag if clicking a button or interactive element
    if (e.target.closest('button, a, .mode-btn, .x-glow, [onclick]')) return;
    // Only left click
    if (e.button !== 0) return;

    dragging = true;
    root.classList.add('dragging');
    const rect = root.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const x = Math.max(0, Math.min(window.innerWidth - root.offsetWidth, e.clientX - offsetX));
    const y = Math.max(0, Math.min(window.innerHeight - root.offsetHeight, e.clientY - offsetY));
    root.style.left = x + 'px';
    root.style.top = y + 'px';
    root.style.right = 'auto';
    root.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('dragging');
    // Save position
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        x: parseInt(root.style.left) || 0,
        y: parseInt(root.style.top) || 0,
      }));
    } catch (_) {}
  });
})();
