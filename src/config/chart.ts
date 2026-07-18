export const CHART_MARGIN = { top: 20, right: 15, bottom: 40, left: 15 };
export const CONTENT_MAX_WIDTH = 920;

// Horizontal border of DayLengthChart's .panel (src/viz/DayLengthChart.module.css) — kept as a JS
// constant so the SVG width can be sized to fit exactly inside it. Update both together.
export const CHART_PANEL_INSET = 1 * 2;

// Chart height is derived from its width (not viewport height) so proportions stay
// consistent regardless of screen aspect ratio. A single ratio looks right on a wide
// desktop chart but goes tiny once the width shrinks on mobile, so below MOBILE_BREAKPOINT
// (must match the breakpoint used in ControlPanel/LocationCard's CSS media queries) the
// chart uses a taller ratio to stay legible.
export const CHART_ASPECT_RATIO = 0.42;
export const CHART_ASPECT_RATIO_MOBILE = 0.85;
export const MOBILE_BREAKPOINT = 640;