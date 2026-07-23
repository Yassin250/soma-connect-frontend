// The app renders under a root `zoom` (see styles/index.css). In every modern
// engine, getBoundingClientRect() returns coordinates in the top-level
// (physical) space — but absolute/fixed portal coordinates are interpreted in
// the zoomed (logical) space. Anything that measures a rect to position a
// floating element must convert through these helpers. With zoom disabled or
// unsupported they are exact no-ops (factor 1).

export const getRootZoom = () =>
  parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

/** Element rect converted into the app's logical coordinate space. */
export const logicalRect = (el) => {
  const zoom = getRootZoom();
  const r = el.getBoundingClientRect();
  return {
    top: r.top / zoom,
    left: r.left / zoom,
    right: r.right / zoom,
    bottom: r.bottom / zoom,
    width: r.width / zoom,
    height: r.height / zoom,
  };
};

/** Viewport size in logical px (innerWidth/innerHeight are physical). */
export const logicalViewport = () => {
  const zoom = getRootZoom();
  return { width: window.innerWidth / zoom, height: window.innerHeight / zoom };
};
